/** Map an object-fit:contain point to the decoded image's alpha pixels. */
export function alphaHit(mask, box, point) {
  if (!mask || !box.width || !box.height || !mask.width || !mask.height) return false;
  const width = mask.sourceWidth || mask.width, height = mask.sourceHeight || mask.height;
  const scale = Math.min(box.width / width, box.height / height);
  const left = (box.width - width * scale) / 2;
  const top = (box.height - height * scale) / 2;
  const x = Math.floor((point.x - left) / (width * scale) * mask.width);
  const y = Math.floor((point.y - top) / (height * scale) * mask.height);
  return x >= 0 && y >= 0 && x < mask.width && y < mask.height &&
    mask.data[(y * mask.width + x) * 4 + 3] > 0;
}

/** Undo the creature's CSS animation, including rotation about transform-origin. */
export function localImagePoint(point, rect, box, matrix, origin) {
  const { a, b, c, d, e, f } = matrix;
  const tx = origin.x + e - a * origin.x - c * origin.y;
  const ty = origin.y + f - b * origin.x - d * origin.y;
  const corners = [[0, 0], [box.width, 0], [0, box.height], [box.width, box.height]];
  const minX = Math.min(...corners.map(([x, y]) => a * x + c * y + tx));
  const minY = Math.min(...corners.map(([x, y]) => b * x + d * y + ty));
  const x = point.x - rect.left + minX - tx;
  const y = point.y - rect.top + minY - ty;
  const det = a * d - b * c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return { x: -Infinity, y: -Infinity };
  return { x: (d * x - c * y) / det, y: (a * y - b * x) / det };
}
