const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Function to generate an uncompressed/deflated valid RGBA PNG
function createPng(width, height, getPixel) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1; // 1 filter byte per row
  const rawData = Buffer.alloc(height * scanlineLength);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace: None
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idat = makeChunk('IDAT', deflated);

  // IEND Chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Shader for Godrej Interio Gold Crest
function luxuryIconShader(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Outer rounded border
  const cornerRadius = w * 0.2;
  const innerX = Math.max(0, Math.abs(dx) - (cx - cornerRadius));
  const innerY = Math.max(0, Math.abs(dy) - (cy - cornerRadius));
  const isInsideCard = (innerX * innerX + innerY * innerY) <= (cornerRadius * cornerRadius);

  if (!isInsideCard) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Border ring (Gold)
  const isBorder = (innerX * innerX + innerY * innerY) >= ((cornerRadius - 6) * (cornerRadius - 6)) ||
                   Math.abs(dist - (w * 0.42)) < 3 ||
                   Math.abs(dist - (w * 0.46)) < 4;

  if (isBorder) {
    return [212, 175, 55, 255]; // Pure Gold #D4AF37
  }

  // Center Shield / Crest area
  const inCenter = dist < (w * 0.3);
  if (inCenter) {
    // Rich Gold fill with subtle gradient
    const grad = (y / h);
    const r = Math.floor(212 + 40 * grad);
    const g = Math.floor(175 + 30 * grad);
    const b = Math.floor(55 + 20 * grad);
    return [Math.min(255, r), Math.min(255, g), Math.min(255, b), 255];
  }

  // Deep Obsidian Slate Background #0F172A
  const gradBg = (y / h) * 0.2;
  return [15 + Math.floor(15 * gradBg), 23 + Math.floor(18 * gradBg), 42 + Math.floor(25 * gradBg), 255];
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
const png192 = createPng(192, 192, luxuryIconShader);
fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), png192);
console.log('✅ Generated public/icons/icon-192x192.png (' + png192.length + ' bytes)');

// Generate 512x512
const png512 = createPng(512, 512, luxuryIconShader);
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), png512);
console.log('✅ Generated public/icons/icon-512x512.png (' + png512.length + ' bytes)');
