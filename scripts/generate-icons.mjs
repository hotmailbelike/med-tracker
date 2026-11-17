// Draws the app icon (a two-tone capsule on a dark tile) straight into PNG files, with no image
// dependencies: shapes are signed distance functions, supersampled for smooth edges.
// Run with `npm run icons`; the output in public/icons is committed.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { crc32, deflateSync } from 'node:zlib';

const OUTPUT_DIR = path.resolve(import.meta.dirname, '../public/icons');
const SUPERSAMPLES_PER_AXIS = 4;

const TILE = [0x16, 0x16, 0x16];
const ACCENT = [0xff, 0x32, 0x58];
const LIGHT = [0xf7, 0xf7, 0xf7];
const BADGE = [0xff, 0xff, 0xff];

/** Shape sizes in a -1..1 icon space. */
const TILE_CORNER_RADIUS = 0.44;
const CAPSULE_HALF_LENGTH = 0.34;
const CAPSULE_RADIUS = 0.27;
const CAPSULE_GAP_HALF_WIDTH = 0.035;
/** Maskable icons are cropped to a circle of 80% of the size, so the capsule shrinks to fit it. */
const MASKABLE_CAPSULE_SCALE = 0.78;
/** The notification badge is drawn tiny, so its capsule fills most of the square. */
const BADGE_CAPSULE_SCALE = 1.4;

const ICONS = [
  { file: 'icon-192.png', size: 192, roundedTile: true, capsuleScale: 1 },
  { file: 'icon-512.png', size: 512, roundedTile: true, capsuleScale: 1 },
  { file: 'maskable-512.png', size: 512, roundedTile: false, capsuleScale: MASKABLE_CAPSULE_SCALE },
  { file: 'apple-touch-icon.png', size: 180, roundedTile: false, capsuleScale: MASKABLE_CAPSULE_SCALE },
  // Notification badge: Android uses only its alpha channel, so it is a white capsule on transparency.
  { file: 'badge-96.png', size: 96, roundedTile: false, capsuleScale: BADGE_CAPSULE_SCALE, monochrome: true },
];

function roundedSquareDistance(x, y, radius) {
  const qx = Math.abs(x) - (1 - radius);
  const qy = Math.abs(y) - (1 - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Colour of one sample point, or null when it is transparent. */
function sampleColor(x, y, { roundedTile, capsuleScale, monochrome = false }) {
  if (roundedTile && roundedSquareDistance(x, y, TILE_CORNER_RADIUS) > 0) return null;

  // Rotate 45 degrees so the capsule runs from top left (light half) to bottom right (accent half).
  const along = (x - y) / Math.SQRT2 / capsuleScale;
  const across = (x + y) / Math.SQRT2 / capsuleScale;
  const capsuleDistance =
    Math.hypot(Math.max(Math.abs(along) - CAPSULE_HALF_LENGTH, 0), across) - CAPSULE_RADIUS;
  const isCapsule = capsuleDistance <= 0 && Math.abs(along) >= CAPSULE_GAP_HALF_WIDTH;

  if (monochrome) return isCapsule ? BADGE : null;
  if (!isCapsule) return TILE;
  return along > 0 ? ACCENT : LIGHT;
}

function renderPixels(icon) {
  const { size } = icon;
  const pixels = Buffer.alloc(size * size * 4);
  const samples = SUPERSAMPLES_PER_AXIS * SUPERSAMPLES_PER_AXIS;

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let covered = 0;
      for (let sy = 0; sy < SUPERSAMPLES_PER_AXIS; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLES_PER_AXIS; sx += 1) {
          const x = ((column + (sx + 0.5) / SUPERSAMPLES_PER_AXIS) / size) * 2 - 1;
          const y = 1 - ((row + (sy + 0.5) / SUPERSAMPLES_PER_AXIS) / size) * 2;
          const color = sampleColor(x, y, icon);
          if (color === null) continue;
          red += color[0];
          green += color[1];
          blue += color[2];
          covered += 1;
        }
      }
      const offset = (row * size + column) * 4;
      if (covered > 0) {
        pixels[offset] = Math.round(red / covered);
        pixels[offset + 1] = Math.round(green / covered);
        pixels[offset + 2] = Math.round(blue / covered);
      }
      pixels[offset + 3] = Math.round((covered / samples) * 255);
    }
  }
  return pixels;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, checksum]);
}

function encodePng(size, rgba) {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const BIT_DEPTH = 8;
  const COLOR_TYPE_RGBA = 6;
  const FILTER_NONE = 0;

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = BIT_DEPTH;
  header[9] = COLOR_TYPE_RGBA;

  const rowLength = size * 4;
  const scanlines = Buffer.alloc((rowLength + 1) * size);
  for (let row = 0; row < size; row += 1) {
    scanlines[row * (rowLength + 1)] = FILTER_NONE;
    rgba.copy(scanlines, row * (rowLength + 1) + 1, row * rowLength, (row + 1) * rowLength);
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scanlines, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

await mkdir(OUTPUT_DIR, { recursive: true });
for (const icon of ICONS) {
  const png = encodePng(icon.size, renderPixels(icon));
  await writeFile(path.join(OUTPUT_DIR, icon.file), png);
  console.log(`Wrote public/icons/${icon.file} (${png.length} bytes)`);
}
