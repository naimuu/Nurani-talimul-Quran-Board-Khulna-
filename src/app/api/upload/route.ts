import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import { uploadToGridFS } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

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

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    // Determine extension safely from filename or MIME type
    const rawExt = file.name?.includes(".")
      ? file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || ""
      : "";

    let fileExtension = rawExt;
    if (!fileExtension) {
      if (file.type === "image/png") fileExtension = "png";
      else if (file.type === "image/webp") fileExtension = "webp";
      else if (file.type === "image/gif") fileExtension = "gif";
      else if (file.type === "image/svg+xml") fileExtension = "svg";
      else if (file.type === "application/pdf") fileExtension = "pdf";
      else if (file.type?.startsWith("image/")) fileExtension = "jpg";
      else fileExtension = "bin";
    }

    const filename = `${crypto.randomUUID()}.${fileExtension}`;

    // Determine folder based on request or mime type
    const customFolder = (formData.get("folder") as string | null)?.replace(/[^a-zA-Z0-9_-]/g, "");
    const folder = customFolder || (file.type?.startsWith("image/") ? "images" : "documents");

    // Standardize content type
    let contentType = file.type;
    if (!contentType || contentType === "application/octet-stream") {
      if (fileExtension === "pdf") contentType = "application/pdf";
      else if (["jpg", "jpeg"].includes(fileExtension)) contentType = "image/jpeg";
      else if (fileExtension === "png") contentType = "image/png";
      else if (fileExtension === "webp") contentType = "image/webp";
      else if (fileExtension === "gif") contentType = "image/gif";
      else if (fileExtension === "svg") contentType = "image/svg+xml";
      else contentType = "application/octet-stream";
    }

    let savedToGridFS = false;
    let savedToDisk = false;
    let gridErrorMsg = "";

    // 1. Upload to MongoDB GridFS for permanent storage across all servers/restarts
    try {
      await uploadToGridFS(buffer, `${folder}/${filename}`, {
        contentType,
        metadata: {
          originalName: file.name || filename,
          folder,
          cleanPath: `${folder}/${filename}`,
          size: buffer.length,
        },
      });
      savedToGridFS = true;
    } catch (dbErr: any) {
      gridErrorMsg = dbErr?.message || String(dbErr);
      console.error("MongoDB GridFS upload error:", dbErr);
    }

    // 2. Also save to local filesystem as cache/fallback if possible
    try {
      const uploadDir = join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      savedToDisk = true;
    } catch (fsErr) {
      // Non-fatal if server is read-only (e.g. Vercel serverless) as long as GridFS succeeded
      console.warn("Local disk write warning:", fsErr);
    }

    if (!savedToGridFS && !savedToDisk) {
      return NextResponse.json(
        { error: "ছবি/ফাইল সার্ভারে সংরক্ষণ করা যায়নি: " + (gridErrorMsg || "Storage unavailable") },
        { status: 500 }
      );
    }

    // Return /api/uploads/... URL so it never collides with Next.js static public/uploads folder
    return NextResponse.json({
      url: `/api/uploads/${folder}/${filename}`,
      name: file.name || filename,
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
