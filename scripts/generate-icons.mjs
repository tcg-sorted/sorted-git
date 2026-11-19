#!/usr/bin/env node
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'apps/desktop/src-tauri/icons');
const sourceDir = join(iconsDir, 'source');
const sourceSvg = join(sourceDir, 'sorted-monogram.svg');
const SIZE = 1024;
const SUBROWS = 4;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

function parseColor(value) {
  if (value === 'white') return [255, 255, 255];
  if (value === 'black') return [0, 0, 0];
  const hex = value.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!hex) throw new Error(`Unsupported fill "${value}" in ${sourceSvg}`);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function cubic(points, p0, p1, p2, p3) {
  const steps = 48;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    points.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

function flattenPath(d) {
  const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const polygons = [];
  let points = [];
  let current = [0, 0];
  let command = '';
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/^[a-z]$/i.test(tokens[i])) command = tokens[i++];
    if (command !== command.toUpperCase()) throw new Error(`Relative path command "${command}" is not supported`);
    if (command === 'M') {
      if (points.length) polygons.push(points);
      current = [num(), num()];
      points = [current];
      command = 'L';
    } else if (command === 'L') {
      current = [num(), num()];
      points.push(current);
    } else if (command === 'H') {
      current = [num(), current[1]];
      points.push(current);
    } else if (command === 'V') {
      current = [current[0], num()];
      points.push(current);
    } else if (command === 'C') {
      const c1 = [num(), num()];
      const c2 = [num(), num()];
      const end = [num(), num()];
      cubic(points, current, c1, c2, end);
      current = end;
    } else if (command === 'Z') {
      if (points.length) polygons.push(points);
      points = [];
    } else {
      throw new Error(`Path command "${command}" is not supported`);
    }
  }
  if (points.length) polygons.push(points);
  return polygons;
}

function roundedRect(width, height, radius) {
  const k = 0.5522847498 * radius;
  const points = [[radius, 0], [width - radius, 0]];
  cubic(points, [width - radius, 0], [width - radius + k, 0], [width, radius - k], [width, radius]);
  points.push([width, height - radius]);
  cubic(points, [width, height - radius], [width, height - radius + k], [width - radius + k, height], [width - radius, height]);
  points.push([radius, height]);
  cubic(points, [radius, height], [radius - k, height], [0, height - radius + k], [0, height - radius]);
  points.push([0, radius]);
  cubic(points, [0, radius], [0, radius - k], [radius - k, 0], [radius, 0]);
  return [points];
}

function coverage(polygons, scale) {
  const edges = [];
  for (const polygon of polygons) {
    for (let j = 0; j < polygon.length; j++) {
      const a = polygon[j];
      const b = polygon[(j + 1) % polygon.length];
      if (a[1] === b[1]) continue;
      edges.push([a[0] * scale, a[1] * scale, b[0] * scale, b[1] * scale]);
    }
  }
  const cover = new Float32Array(SIZE * SIZE);
  for (let row = 0; row < SIZE * SUBROWS; row++) {
    const y = (row + 0.5) / SUBROWS;
    const crossings = [];
    for (const [x0, y0, x1, y1] of edges) {
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        crossings.push([x0 + ((y - y0) / (y1 - y0)) * (x1 - x0), y1 > y0 ? 1 : -1]);
      }
    }
    crossings.sort((p, q) => p[0] - q[0]);
    const base = Math.floor(row / SUBROWS) * SIZE;
    let winding = 0;
    for (let c = 0; c < crossings.length - 1; c++) {
      winding += crossings[c][1];
      if (winding === 0) continue;
      const from = Math.max(0, crossings[c][0]);
      const to = Math.min(SIZE, crossings[c + 1][0]);
      for (let px = Math.floor(from); px < to; px++) {
        const span = Math.min(to, px + 1) - Math.max(from, px);
        if (span > 0) cover[base + px] += span / SUBROWS;
      }
    }
  }
  return cover;
}

const svg = readFileSync(sourceSvg, 'utf8');
const viewBox = (attr(svg.match(/<svg[^>]*>/)[0], 'viewBox') ?? '0 0 32 32').split(/\s+/).map(Number);
const scale = SIZE / viewBox[2];
const layers = [];
for (const tag of svg.match(/<(rect|path)\b[^>]*>/g) ?? []) {
  const fill = parseColor(attr(tag, 'fill'));
  if (tag.startsWith('<rect')) {
    const width = Number(attr(tag, 'width'));
    const height = Number(attr(tag, 'height'));
    layers.push({ fill, cover: coverage(roundedRect(width, height, Number(attr(tag, 'rx') ?? 0)), scale) });
  } else {
    layers.push({ fill, cover: coverage(flattenPath(attr(tag, 'd')), scale) });
  }
}

const rgba = Buffer.alloc(SIZE * SIZE * 4);
for (let p = 0; p < SIZE * SIZE; p++) {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (const { fill, cover } of layers) {
    const alpha = Math.min(1, cover[p]);
    r = fill[0] * alpha + r * (1 - alpha);
    g = fill[1] * alpha + g * (1 - alpha);
    b = fill[2] * alpha + b * (1 - alpha);
    a = alpha + a * (1 - alpha);
  }
  const o = p * 4;
  rgba[o] = a ? Math.round(r / a) : 0;
  rgba[o + 1] = a ? Math.round(g / a) : 0;
  rgba[o + 2] = a ? Math.round(b / a) : 0;
  rgba[o + 3] = Math.round(a * 255);
}

const png = encodePng(SIZE, rgba);
mkdirSync(sourceDir, { recursive: true });
writeFileSync(join(sourceDir, 'sorted-icon-1024.png'), png);
writeFileSync(join(iconsDir, 'icon.png'), png);
console.log('generated icons/source/sorted-icon-1024.png and icons/icon.png from icons/source/sorted-monogram.svg');
console.log('\nFor every platform icon run: pnpm --filter @angkorgit/desktop exec tauri icon src-tauri/icons/icon.png');
