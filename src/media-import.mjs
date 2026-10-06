import { VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS } from './media-limits.mjs';

export function readDataURL(file, signal) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => { reader.abort(); reject(new DOMException('已取消读取', 'AbortError')); };
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    reader.onloadend = () => signal?.removeEventListener('abort', abort);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error('素材读取失败，请重新选择。'));
    reader.readAsDataURL(file);
  });
}

// Decode locally before importing: the browser verifies playable media and the
// host separately validates the container. No external upload or transcoding.
export async function prepareSplashVideo(file, signal) {
  if (!file.size) throw Error('视频是空文件，请重新选择。');
  if (file.size > VIDEO_MAX_BYTES) throw Error('视频不能超过 50 MiB，请先压缩视频。');
  const source = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto'; video.muted = true; video.playsInline = true;
  const waitFor = (event, start) => new Promise((resolve, reject) => {
    const done = error => {
      clearTimeout(timer);
      video.removeEventListener(event, success); video.removeEventListener('error', failure);
      signal?.removeEventListener('abort', abort);
      error ? reject(error) : resolve();
    };
    const success = () => done();
    const failure = () => done(Error('无法播放这个 MP4，请使用 H.264 视频与 AAC 音轨重新导出。'));
    const abort = () => done(new DOMException('已取消读取', 'AbortError'));
    const timer = setTimeout(() => done(Error('视频读取超时，请检查文件或压缩后重试。')), 20000);
    video.addEventListener(event, success, { once: true });
    video.addEventListener('error', failure, { once: true });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort(); else start();
  });
  try {
    await waitFor('loadeddata', () => { video.src = source; });
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > VIDEO_MAX_SECONDS)
      throw Error('启动视频时长需大于 0 秒，且不超过 120 秒。');
    if (!video.videoWidth || !video.videoHeight || video.videoWidth * video.videoHeight > 32000000)
      throw Error('视频画面尺寸无效或过大，请缩小分辨率后重试。');
    await waitFor('seeked', () => { video.currentTime = Math.min(0.25, video.duration / 3); });
    const scale = Math.min(1, 960 / video.videoWidth, 540 / video.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = { name: 'video-poster.jpg', type: 'image/jpeg', dataUrl: canvas.toDataURL('image/jpeg', 0.85) };
    const dataUrl = await readDataURL(file, signal);
    return { image, video: { name: file.name, type: 'video/mp4', dataUrl: dataUrl.replace(/^data:[^;,]*/, 'data:video/mp4') }, duration: video.duration };
  } finally {
    video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(source);
  }
}
