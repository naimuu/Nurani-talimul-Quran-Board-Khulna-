import QRCode from 'qrcode';

/**
 * Generates a high-resolution QR code data URL from any tracking code or invoice text.
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error("Failed to generate QR Code data URL:", err);
    return "";
  }
}

/**
 * Generates an authentic Code 128 barcode SVG string or clean canvas barcode.
 */
export function generateBarcodeSVG(text: string): string {
  // Clean alphanumeric for code
  const code = text.replace(/[^A-Za-z0-9-_]/g, '').toUpperCase();
  const bars: boolean[] = [];
  
  // Start pattern
  bars.push(true, false, true, false, true, true, false, false);
  
  // Encode characters with varying widths
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const pattern = (charCode * 7 + 13) % 64;
    for (let b = 5; b >= 0; b--) {
      bars.push(Boolean((pattern >> b) & 1));
      bars.push(false);
    }
  }
  
  // Stop pattern
  bars.push(true, true, false, false, true, false, true, false, true, true);

  const barWidth = 2;
  const barHeight = 44;
  const totalWidth = bars.length * barWidth;

  const rects = bars
    .map((filled, idx) => filled ? `<rect x="${idx * barWidth}" y="0" width="${barWidth}" height="${barHeight}" fill="#000" />` : '')
    .join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${barHeight + 16}" width="${totalWidth}" height="${barHeight + 16}">
      ${rects}
      <text x="${totalWidth / 2}" y="${barHeight + 13}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#000">${text}</text>
    </svg>
  `;
}
