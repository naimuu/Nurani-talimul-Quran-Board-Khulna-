import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

export interface CloudUploadOptions {
  folder: string;
  filename: string;
  originalName?: string;
  contentType: string;
  extension: string;
}

export interface CloudUploadResult {
  url: string;
  provider: "cloudflare-r2" | "cloudflare-images" | "cloudinary";
  publicId?: string;
}

function cleanEnv(val?: string | null): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

function getCloudflareR2Config() {
  const accountId =
    cleanEnv(process.env.CLOUDFLARE_R2_ACCOUNT_ID) ||
    cleanEnv(process.env.R2_ACCOUNT_ID) ||
    cleanEnv(process.env.CLOUDFLARE_ACCOUNT_ID);
  const accessKeyId =
    cleanEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) ||
    cleanEnv(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey =
    cleanEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) ||
    cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
  const bucket =
    cleanEnv(process.env.CLOUDFLARE_R2_BUCKET_NAME) ||
    cleanEnv(process.env.R2_BUCKET_NAME);
  const publicUrl = (
    cleanEnv(process.env.CLOUDFLARE_R2_PUBLIC_URL) ||
    cleanEnv(process.env.R2_PUBLIC_URL)
  ).replace(/\/+$/, "");

  if (accountId && accessKeyId && secretAccessKey && bucket && publicUrl) {
    return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
  }
  return null;
}

function getCloudflareImagesConfig() {
  const accountId = cleanEnv(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = cleanEnv(process.env.CLOUDFLARE_IMAGES_API_TOKEN);
  if (accountId && apiToken) {
    return { accountId, apiToken };
  }
  return null;
}

function getCloudinaryConfig() {
  let cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  let apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
  let apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

  const cloudinaryUrl = cleanEnv(process.env.CLOUDINARY_URL);
  if ((!cloudName || !apiKey || !apiSecret) && cloudinaryUrl.startsWith("cloudinary://")) {
    try {
      const parsed = new URL(cloudinaryUrl);
      apiKey = apiKey || decodeURIComponent(parsed.username);
      apiSecret = apiSecret || decodeURIComponent(parsed.password);
      cloudName = cloudName || parsed.hostname;
    } catch {
      // Ignore malformed URL if individual vars exist
    }
  }

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
}

export function getActiveCloudProviderName():
  | "cloudflare-r2"
  | "cloudflare-images"
  | "cloudinary"
  | null {
  if (getCloudflareR2Config()) return "cloudflare-r2";
  if (getCloudflareImagesConfig()) return "cloudflare-images";
  if (getCloudinaryConfig()) return "cloudinary";
  return null;
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function uploadToCloudflareR2(
  buffer: Buffer,
  options: CloudUploadOptions,
  cfg: NonNullable<ReturnType<typeof getCloudflareR2Config>>
): Promise<CloudUploadResult> {
  const objectKey = `${options.folder}/${options.filename}`;
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${cfg.bucket}/${objectKey
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/")}`;
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const payloadHash = sha256Hex(buffer);
  const canonicalHeaders =
    `content-type:${options.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${cfg.secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": options.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Cloudflare R2 upload failed (${res.status}): ${errText}`);
  }

  return {
    url: `${cfg.publicUrl}/${objectKey}`,
    provider: "cloudflare-r2",
    publicId: objectKey,
  };
}

async function uploadToCloudflareImages(
  buffer: Buffer,
  options: CloudUploadOptions,
  cfg: NonNullable<ReturnType<typeof getCloudflareImagesConfig>>
): Promise<CloudUploadResult> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: options.contentType });
  form.append("file", blob, options.filename);
  form.append(
    "metadata",
    JSON.stringify({
      folder: options.folder,
      originalName: options.originalName || options.filename,
    })
  );

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiToken}`,
      },
      body: form,
    }
  );

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success || !data?.result?.variants?.length) {
    throw new Error(
      data?.errors?.[0]?.message || `Cloudflare Images upload failed (${res.status})`
    );
  }

  return {
    url: data.result.variants[0],
    provider: "cloudflare-images",
    publicId: data.result.id,
  };
}

async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudUploadOptions,
  cfg: NonNullable<ReturnType<typeof getCloudinaryConfig>>
): Promise<CloudUploadResult> {
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });

  const ext = options.extension.toLowerCase();
  const isImage = options.contentType.startsWith("image/");
  const isRawDoc = [
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "rar",
    "csv",
    "txt",
  ].includes(ext);

  const resourceType: "image" | "raw" | "auto" = isImage
    ? "image"
    : isRawDoc
    ? "raw"
    : "auto";

  const baseId = options.filename.replace(/\.[^.]+$/, "");
  const publicId = isRawDoc ? options.filename : baseId;

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `nurani-board-khulna/${options.folder}`,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
      },
      (error, res) => {
        if (error || !res) {
          reject(error || new Error("Cloudinary returned empty response"));
        } else {
          resolve(res);
        }
      }
    );

    uploadStream.end(buffer);
  });

  return {
    url: result.secure_url,
    provider: "cloudinary",
    publicId: result.public_id,
  };
}

/**
 * Uploads any image or document buffer to Cloud Storage:
 * 1. Cloudflare R2 (if configured via CLOUDFLARE_R2_* / R2_* env vars)
 * 2. Cloudflare Images (if configured via CLOUDFLARE_IMAGES_API_TOKEN for image files)
 * 3. Cloudinary (configured in .env via CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET / CLOUDINARY_URL)
 */
export async function uploadBufferToCloud(
  buffer: Buffer,
  options: CloudUploadOptions
): Promise<CloudUploadResult> {
  const r2Cfg = getCloudflareR2Config();
  if (r2Cfg) {
    return uploadToCloudflareR2(buffer, options, r2Cfg);
  }

  const cfImagesCfg = getCloudflareImagesConfig();
  if (cfImagesCfg && options.contentType.startsWith("image/")) {
    return uploadToCloudflareImages(buffer, options, cfImagesCfg);
  }

  const cloudinaryCfg = getCloudinaryConfig();
  if (cloudinaryCfg) {
    return uploadToCloudinary(buffer, options, cloudinaryCfg);
  }

  throw new Error(
    "Cloudflare বা Cloudinary কনফিগারেশন পাওয়া যায়নি। দয়া করে .env ফাইলে CLOUDINARY_* অথবা CLOUDFLARE_R2_* সেট করুন।"
  );
}
