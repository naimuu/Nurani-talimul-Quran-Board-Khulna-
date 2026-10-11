import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";

/**
 * Finds Chrome or Edge executable on the host machine.
 */
export function findChromeOrEdgeExecutable(): string | null {
  const isWindows = process.platform === "win32";

  if (isWindows) {
    const candidates = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
      path.join(process.env.LOCALAPPDATA || "", "Microsoft\\Edge\\Application\\msedge.exe"),
      path.join(process.env.PROGRAMFILES || "", "Google\\Chrome\\Application\\chrome.exe"),
      path.join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft\\Edge\\Application\\msedge.exe"),
    ];

    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }
  } else {
    // Linux / Unix / macOS
    const candidates = [
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/snap/bin/chromium",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];

    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }
  }

  return null;
}

/**
 * Converts an HTML string into a crystal-sharp, real vector text PDF document
 * using headless Chromium engine without any raster image degradation.
 */
export async function convertHtmlToPdfBuffer(html: string): Promise<Buffer> {
  const browserPath = findChromeOrEdgeExecutable();
  if (!browserPath) {
    throw new Error("Chromium/Edge browser executable not found on server.");
  }

  const randomId = Math.random().toString(36).substring(2, 9);
  const tmpHtml = path.join(os.tmpdir(), `invoice_${Date.now()}_${randomId}.html`);
  const tmpPdf = path.join(os.tmpdir(), `invoice_${Date.now()}_${randomId}.pdf`);

  await fs.promises.writeFile(tmpHtml, html, "utf-8");

  const normalizedHtmlUrl = `file:///${tmpHtml.replace(/\\/g, "/")}`;

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${tmpPdf}`,
    normalizedHtmlUrl,
  ];

  try {
    await new Promise<void>((resolve, reject) => {
      execFile(browserPath, args, { timeout: 15000 }, (error, _stdout, _stderr) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });

    if (!fs.existsSync(tmpPdf)) {
      throw new Error("Failed to produce PDF output file.");
    }

    const pdfBuffer = await fs.promises.readFile(tmpPdf);
    return pdfBuffer;
  } finally {
    try {
      if (fs.existsSync(tmpHtml)) await fs.promises.unlink(tmpHtml);
    } catch (_) {}
    try {
      if (fs.existsSync(tmpPdf)) await fs.promises.unlink(tmpPdf);
    } catch (_) {}
  }
}
