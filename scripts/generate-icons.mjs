import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve(process.cwd(), 'public');

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let step = 0; step < 8; step += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const writePng = (filename, width, height, draw) => {
  const pixels = Buffer.alloc(width * height * 4);

  const setPixel = (x, y, rgba) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }
    const index = (y * width + x) * 4;
    pixels[index] = rgba[0];
    pixels[index + 1] = rgba[1];
    pixels[index + 2] = rgba[2];
    pixels[index + 3] = rgba[3];
  };

  const fillRect = (x, y, w, h, rgba) => {
    for (let py = y; py < y + h; py += 1) {
      for (let px = x; px < x + w; px += 1) {
        setPixel(px, py, rgba);
      }
    }
  };

  const fillRoundedRect = (x, y, w, h, radius, rgba) => {
    for (let py = y; py < y + h; py += 1) {
      for (let px = x; px < x + w; px += 1) {
        const dx = Math.max(Math.max(x + radius - px, 0), px - (x + w - radius - 1));
        const dy = Math.max(Math.max(y + radius - py, 0), py - (y + h - radius - 1));
        if (dx * dx + dy * dy <= radius * radius) {
          setPixel(px, py, rgba);
        }
      }
    }
  };

  const fillCircle = (cx, cy, radius, rgba) => {
    for (let py = cy - radius; py <= cy + radius; py += 1) {
      for (let px = cx - radius; px <= cx + radius; px += 1) {
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          setPixel(px, py, rgba);
        }
      }
    }
  };

  const fillLine = (x, y, w, h, rgba, radius = Math.floor(h / 2)) => {
    fillRoundedRect(x, y, w, h, radius, rgba);
  };

  const drawCheck = (cx, cy, size, rgba) => {
    const thickness = Math.max(2, Math.floor(size * 0.14));
    for (let i = 0; i < size; i += 1) {
      for (let t = -thickness; t <= thickness; t += 1) {
        setPixel(cx - Math.floor(size * 0.28) + i, cy + Math.floor(size * 0.06) + i + t, rgba);
        setPixel(cx + i, cy + Math.floor(size * 0.38) - i + t, rgba);
      }
    }
  };

  draw({ fillRect, fillRoundedRect, fillCircle, fillLine, drawCheck });

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.from([0]), pixels.subarray(start, start + width * 4));
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(path.join(publicDir, filename), png);
};

const rgba = {
  transparent: [0, 0, 0, 0],
  bg: [243, 244, 246, 255],
  glow: [224, 242, 254, 255],
  white: [255, 255, 255, 255],
  border: [226, 232, 240, 255],
  text: [15, 23, 42, 255],
  muted: [203, 213, 225, 255],
  sky: [56, 189, 248, 255],
  emerald: [16, 185, 129, 255],
  amber: [251, 146, 60, 255],
};

const drawIcon = (size, filename, { maskable = false, apple = false } = {}) => {
  const pad = maskable ? Math.floor(size * 0.14) : Math.floor(size * 0.08);
  const cardRadius = Math.floor(size * 0.18);
  const tileRadius = apple ? Math.floor(size * 0.24) : Math.floor(size * 0.22);

  writePng(filename, size, size, ({ fillRect, fillRoundedRect, fillCircle, fillLine, drawCheck }) => {
    fillRect(0, 0, size, size, rgba.bg);
    fillRoundedRect(pad, pad, size - pad * 2, size - pad * 2, tileRadius, rgba.glow);
    fillRoundedRect(
      pad + Math.floor(size * 0.06),
      pad + Math.floor(size * 0.06),
      size - pad * 2 - Math.floor(size * 0.12),
      size - pad * 2 - Math.floor(size * 0.12),
      cardRadius,
      rgba.white,
    );

    const left = pad + Math.floor(size * 0.16);
    const top = pad + Math.floor(size * 0.22);
    const rowGap = Math.floor(size * 0.15);
    const circleRadius = Math.floor(size * 0.04);

    fillCircle(left, top, circleRadius, rgba.sky);
    drawCheck(left, top, Math.floor(size * 0.04), rgba.white);
    fillLine(left + Math.floor(size * 0.12), top - Math.floor(size * 0.016), Math.floor(size * 0.32), Math.floor(size * 0.03), rgba.text);
    fillLine(left + Math.floor(size * 0.12), top + Math.floor(size * 0.045), Math.floor(size * 0.23), Math.floor(size * 0.02), rgba.muted);

    fillCircle(left, top + rowGap, circleRadius, rgba.emerald);
    fillLine(left + Math.floor(size * 0.12), top + rowGap - Math.floor(size * 0.016), Math.floor(size * 0.28), Math.floor(size * 0.03), rgba.text);
    fillLine(left + Math.floor(size * 0.12), top + rowGap + Math.floor(size * 0.045), Math.floor(size * 0.18), Math.floor(size * 0.02), rgba.muted);

    fillCircle(left, top + rowGap * 2, circleRadius, rgba.amber);
    fillLine(left + Math.floor(size * 0.12), top + rowGap * 2 - Math.floor(size * 0.016), Math.floor(size * 0.34), Math.floor(size * 0.03), rgba.text);
    fillLine(left + Math.floor(size * 0.12), top + rowGap * 2 + Math.floor(size * 0.045), Math.floor(size * 0.22), Math.floor(size * 0.02), rgba.muted);

    if (!maskable) {
      fillRoundedRect(
        pad + Math.floor(size * 0.08),
        pad + Math.floor(size * 0.02),
        size - pad * 2 - Math.floor(size * 0.16),
        Math.floor(size * 0.04),
        Math.floor(size * 0.02),
        rgba.border,
      );
    }
  });
};

fs.mkdirSync(publicDir, { recursive: true });

drawIcon(192, 'icon-192.png');
drawIcon(512, 'icon-512.png');
drawIcon(512, 'icon-maskable-512.png', { maskable: true });
drawIcon(180, 'apple-touch-icon.png', { apple: true });
drawIcon(32, 'favicon-32.png');
