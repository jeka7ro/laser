// Pure Client-side Vector QR Code Generator for Laser Magic Tables
// Zero network dependencies, outputs high-resolution vector SVG
// Strict: zero emojis

import QRCode from 'qrcode';

/**
 * Generates clean vector SVG string for a given text/URL
 */
export async function generateQrSvg(text, options = {}) {
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: options.margin !== undefined ? options.margin : 1,
      color: {
        dark: options.darkColor || '#04070f',
        light: options.lightColor || '#ffffff'
      },
      width: options.width || 260,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    });
    return svg;
  } catch (err) {
    console.error('Error generating QR code SVG:', err);
    return `<svg viewBox="0 0 100 100" width="${options.width || 260}" height="${options.width || 260}"><rect width="100" height="100" fill="#111"/><text x="50" y="55" text-anchor="middle" font-size="8" fill="#00f0ff">QR CODE</text></svg>`;
  }
}

/**
 * Generates PNG data URL for print or download
 */
export async function generateQrDataUrl(text, options = {}) {
  try {
    return await QRCode.toDataURL(text, {
      margin: options.margin !== undefined ? options.margin : 1,
      color: {
        dark: options.darkColor || '#04070f',
        light: options.lightColor || '#ffffff'
      },
      width: options.width || 360,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    });
  } catch (err) {
    console.error('Error generating QR code DataURL:', err);
    return '';
  }
}
