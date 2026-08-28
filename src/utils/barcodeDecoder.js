// OmniBuild OS™ — Universal Dual-Engine Barcode & QR Decoder
// Powered by ZXing Library (MultiFormatReader) + Native Hardware BarcodeDetector

import { 
  BrowserMultiFormatReader, 
  BarcodeFormat, 
  DecodeHintType 
} from '@zxing/library';

// Configure ZXing Hints for high-speed warehouse decoding (Code-128, Code-39, QR, EAN-13, etc.)
const hints = new Map();
const formats = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.ITF
];
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
hints.set(DecodeHintType.TRY_HARDER, true);

const zxingReader = new BrowserMultiFormatReader(hints);

/**
 * Clean & normalize barcode strings (strips asterisks, whitespace, non-printable characters)
 */
export function sanitizeBarcode(rawText) {
  if (!rawText) return '';
  let str = String(rawText).trim().toUpperCase();
  // Remove wrapping asterisks (common in Code-39 / Code-128 human-readable text)
  if (str.startsWith('*') && str.endsWith('*') && str.length > 2) {
    str = str.substring(1, str.length - 1);
  }
  return str.trim();
}

/**
 * Decodes barcode from an image element, canvas, or video element using ZXing + BarcodeDetector
 */
export async function decodeBarcodeFromSource(mediaElement) {
  if (!mediaElement) return null;

  // 1. Try Native BarcodeDetector if available (Fastest GPU)
  if ('BarcodeDetector' in window) {
    try {
      const nativeDetector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'upc_a', 'data_matrix']
      });
      const results = await nativeDetector.detect(mediaElement);
      if (results && results.length > 0 && results[0].rawValue) {
        return sanitizeBarcode(results[0].rawValue);
      }
    } catch (e) {
      // Fall through to ZXing
    }
  }

  // 2. Try ZXing Multi-Format Reader
  try {
    const zxResult = await zxingReader.decode(mediaElement);
    if (zxResult && zxResult.getText()) {
      return sanitizeBarcode(zxResult.getText());
    }
  } catch (e) {
    // ZXing standard frame miss
  }

  return null;
}

/**
 * Decodes barcode from an uploaded image File or Data URL
 */
export async function decodeBarcodeFromImageFile(fileOrDataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      // 1. Try direct decoding
      let detected = await decodeBarcodeFromSource(img);
      if (detected) {
        resolve(detected);
        return;
      }

      // 2. Try high-contrast binarized canvas pass (for screen glare or low-light barcodes)
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Enhance contrast
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          const val = avg > 128 ? 255 : 0; // High contrast thresholding
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);

        detected = await decodeBarcodeFromSource(canvas);
        if (detected) {
          resolve(detected);
          return;
        }
      } catch (e) {
        console.warn("Canvas binarization error:", e);
      }

      resolve(null);
    };

    img.onerror = () => resolve(null);

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
