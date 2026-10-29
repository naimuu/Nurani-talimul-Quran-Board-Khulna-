import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { downloadFromGridFS, uploadToGridFS } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

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

  // 2. Fallback to local filesystem disk storage (public/uploads/... or public/...)
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
  } catch (fsErr) {
    // Graceful fallback for missing images: return the board's logo image instead of 404
    const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);
    if (isImage) {
      try {
        const logoPath = join(process.cwd(), "public", "images", "logo.jpeg");
        const logoBuffer = await readFile(logoPath);
        return new NextResponse(new Uint8Array(logoBuffer), {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Disposition": `inline; filename="placeholder.jpeg"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (placeholderErr) {
        // In case logo.jpeg cannot be read, return SVG placeholder
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="#f8fafc">
          <rect width="400" height="300" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
          <text x="200" y="150" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">ছবি পাওয়া যায়নি</text>
        </svg>`;
        return new NextResponse(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    return new NextResponse("File not found", { status: 404 });
  }
}
