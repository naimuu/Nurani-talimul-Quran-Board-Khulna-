import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  uploadBufferToCloud,
  getActiveCloudProviderName,
} from "@/lib/cloudStorage";
import { uploadToGridFS } from "@/lib/gridfs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল পাওয়া যায়নি (No file uploaded)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "আপলোডকৃত ফাইলটি খালি (Uploaded file is empty)" },
        { status: 400 }
      );
    }

    // Determine extension safely from filename or MIME type
    const rawExt = file.name?.includes(".")
      ? file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          ?.replace(/[^a-z0-9]/g, "") || ""
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

    // Determine logical cloud folder based on request or mime type
    const customFolder = (formData.get("folder") as string | null)?.replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
    const folder =
      customFolder || (file.type?.startsWith("image/") ? "images" : "documents");

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

    // 1. Primary: Upload directly to Cloud Storage (Cloudflare R2 / Cloudflare Images / Cloudinary)
    // Never write to local project folder (public/uploads) so server deploys never lose images!
    const activeProvider = getActiveCloudProviderName();
    if (activeProvider) {
      const cloudResult = await uploadBufferToCloud(buffer, {
        folder,
        filename,
        originalName: file.name || filename,
        contentType,
        extension: fileExtension,
      });

      return NextResponse.json({
        url: cloudResult.url,
        provider: cloudResult.provider,
        publicId: cloudResult.publicId,
        name: file.name || filename,
        size: buffer.length,
      });
    }

    // 2. Database fallback ONLY if neither Cloudflare nor Cloudinary env vars are set
    await uploadToGridFS(buffer, `${folder}/${filename}`, {
      contentType,
      metadata: {
        originalName: file.name || filename,
        folder,
        cleanPath: `${folder}/${filename}`,
        size: buffer.length,
      },
    });

    return NextResponse.json({
      url: `/api/uploads/${folder}/${filename}`,
      provider: "gridfs",
      name: file.name || filename,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error("Cloud upload error:", error);
    return NextResponse.json(
      { error: "ক্লাউডে ছবি/ফাইল আপলোড করা যায়নি: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
