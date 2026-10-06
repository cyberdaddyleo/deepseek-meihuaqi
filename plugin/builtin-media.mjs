import { readFileSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const media = new Map([
  ['geek-startup', { path: 'assets/geek-startup.mp4', type: 'video/mp4' }],
  ['geek-wallpaper', { path: 'assets/geek-wallpaper.png', type: 'image/png' }],
  ['cyberdad-logo', { path: 'assets/cyberdad-logo.png', type: 'image/png' }],
  ['cyberdad-atlas', { path: 'assets/cyberdad-atlas.png', type: 'image/png' }],
  ['cyberdad-startup', { path: 'assets/cyberdad-startup.mp4', type: 'video/mp4' }],
  ['cyberdad-wallpaper', { path: 'assets/cyberdad-wallpaper.png', type: 'image/png' }],
  ['whalegirl-startup', { path: 'assets/whalegirl-startup.mp4', type: 'video/mp4' }],
  ['whalegirl-wallpaper', { path: 'assets/whalegirl-wallpaper.png', type: 'image/png' }],
  ['whalegirl-atlas', { path: 'assets/whalegirl-atlas.png', type: 'image/png' }],
]);
const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function verified(data, type) {
  return type === 'video/mp4'
    ? data.length >= 16 && data.toString('ascii', 4, 8) === 'ftyp' && data.readUInt32BE(0) >= 16 && data.readUInt32BE(0) <= data.length
    : data.length >= 24 && data.subarray(0, 8).equals(pngHeader) && data.toString('ascii', 12, 16) === 'IHDR';
}
function byteRange(value, length) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, length - suffix); end = length - 1;
  } else {
    start = Number(match[1]); end = match[2] ? Number(match[2]) : length - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= length || end < start) return null;
    end = Math.min(end, length - 1);
  }
  return { start, end };
}

/** Registered through the existing authenticated connection router, never a new server. */
export function builtinMediaResponse(request, root) {
  const entry = media.get(new URL(request.url).searchParams.get('id'));
  if (!entry) return new Response('内置素材不存在', { status: 404 });
  let data;
  try {
    // Neither the caller's filename nor its URL is used as a filesystem path.
    const file = join(root, entry.path), stat = lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('无效素材');
    data = readFileSync(file);
    if (!verified(data, entry.type)) throw new Error('无效素材类型');
  } catch { return new Response('内置素材缺失或格式不正确', { status: 404 }); }
  const headers = {
    'Content-Type': entry.type,
    'Content-Length': String(data.length),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
  const range = request.headers.get('range');
  // HEAD reports the full representation; GET supports a single byte range.
  if (range && request.method !== 'HEAD') {
    const selected = byteRange(range, data.length);
    if (!selected) return new Response(null, { status: 416, headers: { ...headers, 'Content-Length': '0', 'Content-Range': `bytes */${data.length}` } });
    const { start, end } = selected;
    return new Response(data.subarray(start, end + 1), { status: 206, headers: { ...headers, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${data.length}` } });
  }
  return new Response(request.method === 'HEAD' ? null : data, { headers });
}
