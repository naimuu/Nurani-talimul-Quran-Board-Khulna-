import mongoose from "mongoose";
import connectDB from "./mongodb";

export async function getGridFSBucket(): Promise<mongoose.mongo.GridFSBucket> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not established");
  }
  return new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  });
}

export interface GridFSUploadResult {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
}

/**
 * Uploads a Buffer to MongoDB GridFS (compatible with MongoDB Node driver v6+)
 */
export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  options: {
    contentType: string;
    metadata?: Record<string, any>;
  }
): Promise<GridFSUploadResult> {
  const gridBucket = await getGridFSBucket();

  // If a file with the same filename already exists, remove it first
  try {
    const existing = await gridBucket.find({ filename }).toArray();
    for (const file of existing) {
      await gridBucket.delete(file._id);
    }
  } catch {
    // Ignore error if search/delete fails
  }

  return new Promise((resolve, reject) => {
    const uploadStream = gridBucket.openUploadStream(filename, {
      contentType: options.contentType,
      metadata: {
        ...(options.metadata || {}),
        contentType: options.contentType,
      },
    });

    uploadStream.once("error", (err) => {
      reject(err);
    });

    uploadStream.once("finish", () => {
      try {
        const gFile = (uploadStream as any).gridFSFile;
        resolve({
          fileId: String(gFile?._id ?? uploadStream.id),
          filename: gFile?.filename || filename,
          contentType: options.contentType,
          size: buffer.length,
        });
      } catch (err) {
        reject(err);
      }
    });

    uploadStream.end(buffer);
  });
}

export interface GridFSDownloadResult {
  buffer: Buffer;
  contentType: string;
  originalName?: string;
  filename: string;
}

/**
 * Downloads a file from MongoDB GridFS by filename or path
 */
export async function downloadFromGridFS(
  filenameOrPath: string
): Promise<GridFSDownloadResult | null> {
  const gridBucket = await getGridFSBucket();

  // Clean filename for matching (strip leading slashes and optional "uploads/" or "api/uploads/" prefix)
  const cleanPath = filenameOrPath
    .replace(/^\/+/, "")
    .replace(/^api\/uploads\//, "")
    .replace(/^uploads\//, "");
  const baseName = cleanPath.split("/").pop() || cleanPath;

  // Search by exact path or basename
  const files = await gridBucket
    .find({
      $or: [
        { filename: cleanPath },
        { filename: baseName },
        { "metadata.cleanPath": cleanPath },
      ],
    })
    .sort({ uploadDate: -1 })
    .toArray();

  if (files.length === 0) {
    return null;
  }

  const targetFile = files[0];

  return new Promise((resolve, reject) => {
    const downloadStream = gridBucket.openDownloadStream(targetFile._id);
    const chunks: Buffer[] = [];

    downloadStream.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    downloadStream.once("error", (err) => {
      reject(err);
    });

    downloadStream.once("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve({
        buffer,
        contentType:
          (targetFile as any).contentType ||
          (targetFile as any).metadata?.contentType ||
          "application/octet-stream",
        originalName: (targetFile as any).metadata?.originalName,
        filename: targetFile.filename,
      });
    });
  });
}
