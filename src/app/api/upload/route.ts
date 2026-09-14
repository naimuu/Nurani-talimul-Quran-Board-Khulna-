import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import { uploadToGridFS } from "@/lib/gridfs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const filename = `${crypto.randomUUID()}.${fileExtension}`;

    // Determine folder based on request or mime type
    const customFolder = formData.get("folder") as string | null;
    let folder = customFolder || (file.type.startsWith("image/") ? "images" : "documents");

    // Standardize content type
    let contentType = file.type;
    if (!contentType || contentType === "application/octet-stream") {
      if (fileExtension === "pdf") contentType = "application/pdf";
      else if (["jpg", "jpeg"].includes(fileExtension)) contentType = "image/jpeg";
      else if (fileExtension === "png") contentType = "image/png";
      else if (fileExtension === "webp") contentType = "image/webp";
      else contentType = "application/octet-stream";
    }

    // 1. Upload to MongoDB GridFS for permanent storage across all servers/restarts
    try {
      await uploadToGridFS(buffer, `${folder}/${filename}`, {
        contentType,
        metadata: {
          originalName: file.name,
          folder,
          cleanPath: `${folder}/${filename}`,
          size: buffer.length,
        },
      });
    } catch (dbErr) {
      console.error("MongoDB GridFS upload error:", dbErr);
      // If MongoDB GridFS fails, we will still try writing to disk below
    }

    // 2. Also save to local filesystem as cache/fallback if possible
    try {
      const uploadDir = join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      const path = join(uploadDir, filename);
      await writeFile(path, buffer);
    } catch (fsErr) {
      // Non-fatal if server is read-only (e.g. Vercel serverless)
      console.warn("Local disk write warning:", fsErr);
    }

    // Return the URL that can be used to access the file
    return NextResponse.json({
      url: `/uploads/${folder}/${filename}`,
      name: file.name,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
