import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { downloadFromGridFS, uploadToGridFS } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

function getContentType(extension: string): string {
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const safePath = (params.path || []).filter(
    (p) => p && !p.includes("..") && !p.includes("/") && !p.includes("\\")
  );

  if (safePath.length === 0) {
    return new NextResponse("File not found", { status: 404 });
  }

  const pathKey = safePath.join("/");
  const fileName = safePath[safePath.length - 1] || "file";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // 1. Primary: MongoDB GridFS persistent cloud storage
  try {
    const gridFile = await downloadFromGridFS(pathKey);
    if (gridFile && gridFile.buffer && gridFile.buffer.length > 0) {
      const contentType =
        gridFile.contentType && gridFile.contentType !== "application/octet-stream"
          ? gridFile.contentType
          : getContentType(ext);
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

  // 2. Fallback: local filesystem disk storage (public/uploads/... or public/...)
  const filePath = join(process.cwd(), "public", "uploads", ...safePath);
  const altFilePath = join(process.cwd(), "public", ...safePath);

  try {
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch {
      fileBuffer = await readFile(altFilePath);
    }
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
  } catch {
    return new NextResponse("File not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

