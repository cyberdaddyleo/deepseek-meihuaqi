// The complete, skippable original movie in the native document. Its lifetime is
// independent of BootPage's React handoff; initialization is never delayed.
import { setStartupIcon, startupControlCss } from './startup-controls.mjs';
export function mountVideoStartup(preset, assetURL, fallbackData) {
  if (document.querySelector('[data-cyber-video-startup]')) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.dataset.cyberVideoStartup = '';
  layer.dataset.videoFit = preset.videoFit === 'contain' ? 'contain' : 'cover';
  layer.setAttribute('aria-label', `${preset.name}启动画面`);
  const style = document.createElement('style');
  style.textContent = startupControlCss + `
[data-cyber-video-startup]{position:fixed;inset:0;z-index:2147483000;background:#08121f;color:#e4f5ff;isolation:isolate;font:14px/1.6 -apple-system,"PingFang SC",sans-serif;transition:opacity .18s ease}
[data-cyber-video-startup] .cyber-boot-art{position:absolute;inset:0;pointer-events:none}
[data-cyber-video-startup] .cyber-boot-poster,[data-cyber-video-startup] .cyber-boot-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
[data-cyber-video-startup][data-video-fit="contain"] .cyber-boot-video{object-fit:contain;background:#071321}
[data-cyber-video-startup] .cyber-boot-video{opacity:0;transition:opacity .15s}
[data-cyber-video-startup][data-frame] .cyber-boot-video{opacity:1}
.cyber-video-footer{position:absolute;bottom:18px;right:18px;z-index:2}
.cyber-video-actions{display:flex;align-items:center;gap:8px}
@media(max-width:600px){.cyber-video-footer{right:12px;bottom:12px}}
@media(prefers-reduced-motion:reduce){[data-cyber-video-startup],[data-cyber-video-startup] .cyber-boot-video{transition:none}}
`;
  const decor = document.createElement('div'); decor.className = 'cyber-boot-art';
  const poster = new Image(); poster.className = 'cyber-boot-poster'; poster.alt = '';
  poster.onerror = () => { poster.onerror = null; poster.src = fallbackData; };
  poster.src = assetURL(preset.preview); decor.append(poster);
  const footer = document.createElement('div'); footer.className = 'cyber-video-footer';
  const skip = document.createElement('button'); skip.className = 'cyber-boot-skip'; skip.type = 'button';
  setStartupIcon(skip, 'skip', '跳过动画');
  const sound = document.createElement('button'); sound.className = 'cyber-boot-sound'; sound.type = 'button'; sound.hidden = true;
  const actions = document.createElement('div'); actions.className = 'cyber-video-actions'; actions.append(sound, skip);
  footer.append(actions); layer.append(decor, footer);
  document.head.append(style); document.body.append(layer);

  // Shipped movies are about seven seconds; imported clips may be up to two
  // minutes / 50 MiB. Give local loading headroom, then detect missing playback
  // progress independently of duration so a stalled long clip cannot trap users.
  const customVideo = preset.custom === true;
  const MEDIA_GRACE_MS = customVideo ? 30000 : 2200;
  const FALLBACK_VISIBLE_MS = 4500, STALL_MS = 8000;
  let maxVisibleMs = customVideo ? 160000 : 15000;
  let closed = false, ready = false, video, frameRequest, timer, cleanupTimer, movieURL;
  const mediaRequest = new AbortController();
  let failedMedia = motion.matches, hasFrame = false;
  let soundBlocked = false, playAttempt = 0;
  let visibleMs = 0, lastClock = performance.now(), lastProgressMs = 0, lastMediaTime = -1;
  let wasVisible = document.visibilityState === 'visible';
  const observer = new MutationObserver(update);
  function clock() {
    const now = performance.now(), elapsed = now - lastClock;
    if (wasVisible) visibleMs += elapsed;
    lastClock = now;
    wasVisible = document.visibilityState === 'visible';
  }
  function releaseVideo() {
    mediaRequest.abort();
    if (movieURL) { URL.revokeObjectURL(movieURL); movieURL = null; }
    if (!video) return;
    const previous = video; video = null;
    for (const name of ['loadedmetadata','seeked','playing','waiting','ended','error']) previous['on'+name] = null;
    if (frameRequest !== undefined) previous.cancelVideoFrameCallback?.(frameRequest);
    previous.pause(); previous.removeAttribute('src'); previous.removeAttribute('poster'); previous.load(); previous.remove();
  }
  function remove() {
    clearTimeout(cleanupTimer); releaseVideo(); poster.onerror = null; poster.removeAttribute('src'); layer.remove(); style.remove();
  }
  function finish(fade = false) {
    if (closed) { if (!fade) remove(); return; }
    closed = true; observer.disconnect(); clearTimeout(timer); clearTimeout(abandonTimer);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('keydown', keyboard, true);
    motion.removeEventListener('change', reducedMotion);
    window.removeEventListener('pagehide', leave);
    skip.onclick = null; sound.onclick = null;
    if (fade && !motion.matches) { video?.pause(); layer.style.opacity = '0'; layer.style.pointerEvents = 'none'; cleanupTimer = setTimeout(remove, 180); }
    else remove();
  }
  const leave = () => finish();
  const keyboard = event => {
    const block = () => { event.preventDefault(); event.stopImmediatePropagation(); };
    if (event.key === 'Escape') { block(); finish(); return; }
    // Preserve application/system shortcuts (including normal Cmd+Q). Other
    // editing keys must not reach the editor obscured by this full intro.
    if (event.metaKey || event.ctrlKey) return;
    if (event.key === 'Tab') {
      block();
      const next = document.activeElement === skip && !sound.hidden ? sound : skip;
      next.focus({preventScroll:true}); return;
    }
    if (event.target instanceof Node && layer.contains(event.target)) return;
    block();
  };
  function mediaFailed() {
    if (closed) return;
    clock(); failedMedia = true; releaseVideo(); syncSound(); update();
  }
  function reducedMotion(event) { if (event.matches) mediaFailed(); }
  function noteFrame() {
    if (closed || !video) return;
    frameRequest = undefined;
    // Preserve the original opening, including its intentional dark frames.
    clock(); hasFrame = true; layer.dataset.frame = 'shown'; update();
  }
  function firstFrame() {
    if (!video || closed || hasFrame) return;
    if (video.requestVideoFrameCallback) frameRequest = video.requestVideoFrameCallback(noteFrame);
    else requestAnimationFrame(() => { if (video?.readyState >= 2) noteFrame(); });
  }
  function play() {
    if (!video || !movieURL || video.readyState < 1 || video.seeking || closed || document.visibilityState !== 'visible') return;
    const current = video, attempt = ++playAttempt;
    const active = () => !closed && current === video && attempt === playAttempt && document.visibilityState === 'visible';
    void current.play().catch(error => {
      if (!active()) return;
      // Browser autoplay policies can reject sound while permitting the same
      // movie muted. Keep the intro and offer a trusted click to enable audio.
      if (error.name === 'NotAllowedError' && !current.muted) {
        current.muted = true; soundBlocked = true; syncSound();
        void current.play().catch(() => { if (active()) mediaFailed(); });
      } else mediaFailed();
    });
  }
  function syncSound() {
    sound.hidden = !video || failedMedia;
    if (sound.hidden) return;
    setStartupIcon(sound, video.muted ? 'soundOff' : 'soundOn', video.muted ? '开启启动声音' : '关闭启动声音');
    sound.setAttribute('aria-pressed', String(!video.muted));
    if (soundBlocked) sound.setAttribute('aria-description', '自动播放声音受限，点按开启声音');
    else sound.removeAttribute('aria-description');
  }
  function visibility() {
    clock();
    if (document.visibilityState === 'visible') play();
    else video?.pause();
    update();
  }
  function update() {
    if (closed) return;
    clock();
    const boot = document.querySelector('[data-dsh-boot]');
    if (boot && !boot.querySelector('[data-dsh-boot-spinner]')) { finish(); return; }
    ready = !boot && !!document.querySelector('[data-slot="main"], [contenteditable="true"]');
    // Readiness remains internal; the original BootPage shows real loading or
    // errors after completion/skip. No decorative status text covers the movie.
    layer.dataset.ready = String(ready);
    if (customVideo && hasFrame && video && video.currentTime > lastMediaTime + .01) {
      lastMediaTime = video.currentTime; lastProgressMs = visibleMs;
    }
    if (customVideo && hasFrame && !failedMedia && visibleMs - lastProgressMs >= STALL_MS) { mediaFailed(); return; }
    const deadline = failedMedia ? FALLBACK_VISIBLE_MS : maxVisibleMs;
    if (visibleMs >= deadline || (ready && failedMedia)) { finish(hasFrame && !failedMedia); return; }
    // A missing/stalled movie must not hold a ready work interface indefinitely.
    if (!hasFrame && !failedMedia && visibleMs >= MEDIA_GRACE_MS) { mediaFailed(); if (!ready) finish(); return; }
    clearTimeout(timer);
    if (document.visibilityState !== 'visible') return;
    const waits = [deadline - visibleMs];
    if (!hasFrame && !failedMedia) waits.push(MEDIA_GRACE_MS - visibleMs);
    if (customVideo && hasFrame && !failedMedia) waits.push(500);
    timer = setTimeout(update, Math.max(1, Math.min(...waits)));
  }
  skip.onclick = leave;
  sound.onclick = () => {
    if (!video || closed) return;
    video.muted = !video.muted; soundBlocked = false;
    syncSound(); play();
  };
  document.addEventListener('keydown', keyboard, true);
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', reducedMotion);
  window.addEventListener('pagehide', leave, { once: true });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  // A never-shown/abandoned window must not retain decoding or observers forever.
  const abandonTimer = setTimeout(leave, customVideo ? 190000 : 30000);
  if (!failedMedia) {
    video = document.createElement('video'); video.className = 'cyber-boot-video';
    video.muted = false; video.defaultMuted = false; video.volume = 1;
    syncSound();
    video.playsInline = true; video.preload = 'auto'; video.loop = false;
    video.setAttribute('aria-hidden', 'true'); video.tabIndex = -1;
    video.poster = assetURL(preset.preview);
    video.onerror = mediaFailed;
    // A new media element starts at zero. Do not seek or speed up the original.
    video.onloadedmetadata = () => {
      if (customVideo) {
        if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 120.25) { mediaFailed(); return; }
        maxVisibleMs = MEDIA_GRACE_MS + Math.ceil(video.duration * 1000) + STALL_MS;
      }
      play();
    };
    video.onseeked = play;
    video.onplaying = () => { firstFrame(); update(); };
    video.onwaiting = update;
    // Completion belongs to the movie, not the faster native initialization.
    // If Harness still loads afterwards its own spinner remains underneath.
    video.onended = () => finish(true);
    decor.append(video);
    // dsh-app's stream proxy strips Content-Length, leaving Chromium with a
    // 0..0 seekable range. A bounded local Blob supplies an exact length without
    // changing the signed app, the source movie, or the authenticated route.
    void (async () => {
      try {
        const response = await fetch(assetURL(preset.asset), {signal:mediaRequest.signal});
        if (!response.ok) throw new Error('Startup media unavailable');
        const movie = await response.blob();
        if (closed || !video) return;
        movieURL = URL.createObjectURL(movie);
        video.src = movieURL;
      } catch { if (!closed && !mediaRequest.signal.aborted) mediaFailed(); }
    })();
  }
  update();
}
