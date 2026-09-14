import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { downloadFromGridFS, uploadToGridFS } from "@/lib/gridfs";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Prevent directory traversal
  const safePath = params.path.filter(
    (p) => !p.includes("..") && !p.includes("/") && !p.includes("\\")
  );

  const pathKey = safePath.join("/");
  const fileName = safePath[safePath.length - 1] || "file";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Helper to determine Content-Type
  const getContentType = (extension: string) => {
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "png":
        return "image/png";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "webp":
        return "image/webp";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      default:
        return "application/octet-stream";
    }
  };

  // 1. Try to fetch from MongoDB GridFS (primary cloud persistent storage)
  try {
    const gridFile = await downloadFromGridFS(pathKey);
    if (gridFile && gridFile.buffer) {
      const contentType = gridFile.contentType || getContentType(ext);
      const displayName = gridFile.originalName || fileName;

      return new NextResponse(new Uint8Array(gridFile.buffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(displayName)}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (dbErr) {
    console.warn("MongoDB GridFS download check error:", dbErr);
  }

  // 2. Fallback to local filesystem disk storage
  const filePath = join(process.cwd(), "public", "uploads", ...safePath);
  try {
    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(ext);

    // Background sync to MongoDB GridFS so it becomes permanently available
    uploadToGridFS(fileBuffer, pathKey, {
      contentType,
      metadata: {
        originalName: fileName,
        folder: safePath[0] || "uploads",
        cleanPath: pathKey,
        syncedFromDisk: true,
      },
    }).catch((syncErr) => {
      console.warn("Auto-sync disk file to MongoDB GridFS failed:", syncErr);
    });

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (fsErr) {
    return new NextResponse("File not found", { status: 404 });
  }
}
