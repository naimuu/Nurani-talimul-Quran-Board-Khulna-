import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

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
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const filename = `${crypto.randomUUID()}.${fileExtension}`;
    
    // Determine folder based on mime type
    let folder = "documents";
    if (file.type.startsWith("image/")) {
      folder = "images";
    }
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Return the URL that can be used to access the file
    return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
