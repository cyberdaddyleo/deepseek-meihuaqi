(() => {
  // plugin/startup-controls.mjs
  var svg = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
  var speaker = '<path d="M11 5 6 9H3v6h3l5 4V5Z"/>';
  var startupIcons = {
    skip: svg('<path d="m6 5 10 7-10 7V5Z"/><path d="M19 5v14"/>'),
    soundOn: svg(speaker + '<path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>'),
    soundOff: svg(speaker + '<path d="m16 9 5 6m0-6-5 6"/>')
  };
  function setStartupIcon(button, icon, label) {
    button.type = "button";
    button.classList.add("cyber-startup-control");
    button.setAttribute("aria-label", label);
    if (button.dataset.icon !== icon) {
      button.dataset.icon = icon;
      button.innerHTML = startupIcons[icon];
    }
  }
  var startupControlCss = `
.cyber-startup-control{box-sizing:border-box;display:inline-grid;place-items:center;flex:0 0 auto;width:30px;height:30px;padding:0;border:1px solid #d8eeff38;border-radius:50%;background:#08121f70;color:#e4f5ff;opacity:.76;cursor:pointer;backdrop-filter:blur(10px);transition:opacity .15s,background-color .15s;font:inherit;line-height:1}
.cyber-startup-control[hidden]{display:none}
.cyber-startup-control svg{display:block;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.cyber-startup-control:hover,.cyber-startup-control:focus-visible{opacity:1;background:#122b43d9}
.cyber-startup-control:focus-visible{outline:2px solid #8edfff;outline-offset:3px}
[data-cyber-boot] .cyber-startup-control{background:#ffffffb8;color:#315679;border-color:#789dbb55}
[data-cyber-boot] .cyber-startup-control:hover{background:#fff}
@media(pointer:coarse){.cyber-startup-control{width:40px;height:40px}}
@media(prefers-reduced-motion:reduce){.cyber-startup-control{transition:none}}
`;

  // plugin/video-startup.mjs
  function mountVideoStartup(preset, assetURL, fallbackData2) {
    if (document.querySelector("[data-cyber-video-startup]")) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const layer = document.createElement("div");
    layer.dataset.cyberVideoStartup = "";
    layer.dataset.videoFit = preset.videoFit === "contain" ? "contain" : "cover";
    layer.setAttribute("aria-label", `${preset.name}\u542F\u52A8\u753B\u9762`);
    const style = document.createElement("style");
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
    const decor = document.createElement("div");
    decor.className = "cyber-boot-art";
    const poster = new Image();
    poster.className = "cyber-boot-poster";
    poster.alt = "";
    poster.onerror = () => {
      poster.onerror = null;
      poster.src = fallbackData2;
    };
    poster.src = assetURL(preset.preview);
    decor.append(poster);
    const footer = document.createElement("div");
    footer.className = "cyber-video-footer";
    const skip = document.createElement("button");
    skip.className = "cyber-boot-skip";
    skip.type = "button";
    setStartupIcon(skip, "skip", "\u8DF3\u8FC7\u52A8\u753B");
    const sound = document.createElement("button");
    sound.className = "cyber-boot-sound";
    sound.type = "button";
    sound.hidden = true;
    const actions = document.createElement("div");
    actions.className = "cyber-video-actions";
    actions.append(sound, skip);
    footer.append(actions);
    layer.append(decor, footer);
    document.head.append(style);
    document.body.append(layer);
    const MAX_VISIBLE_MS = 15e3, FALLBACK_VISIBLE_MS = 4500, MEDIA_GRACE_MS = 2200;
    let closed = false, ready = false, video, frameRequest, timer, cleanupTimer, movieURL;
    const mediaRequest = new AbortController();
    let failedMedia = motion.matches, hasFrame = false;
    let soundBlocked = false, playAttempt = 0;
    let visibleMs = 0, lastClock = performance.now();
    let wasVisible = document.visibilityState === "visible";
    const observer = new MutationObserver(update);
    function clock() {
      const now = performance.now(), elapsed = now - lastClock;
      if (wasVisible) visibleMs += elapsed;
      lastClock = now;
      wasVisible = document.visibilityState === "visible";
    }
    function releaseVideo() {
      mediaRequest.abort();
      if (movieURL) {
        URL.revokeObjectURL(movieURL);
        movieURL = null;
      }
      if (!video) return;
      const previous = video;
      video = null;
      for (const name of ["loadedmetadata", "seeked", "playing", "waiting", "ended", "error"]) previous["on" + name] = null;
      if (frameRequest !== void 0) previous.cancelVideoFrameCallback?.(frameRequest);
      previous.pause();
      previous.removeAttribute("src");
      previous.removeAttribute("poster");
      previous.load();
      previous.remove();
    }
    function remove() {
      clearTimeout(cleanupTimer);
      releaseVideo();
      poster.onerror = null;
      poster.removeAttribute("src");
      layer.remove();
      style.remove();
    }
    function finish(fade = false) {
      if (closed) {
        if (!fade) remove();
        return;
      }
      closed = true;
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(abandonTimer);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("keydown", keyboard, true);
      motion.removeEventListener("change", reducedMotion);
      window.removeEventListener("pagehide", leave);
      skip.onclick = null;
      sound.onclick = null;
      if (fade && !motion.matches) {
        video?.pause();
        layer.style.opacity = "0";
        layer.style.pointerEvents = "none";
        cleanupTimer = setTimeout(remove, 180);
      } else remove();
    }
    const leave = () => finish();
    const keyboard = (event) => {
      const block = () => {
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      if (event.key === "Escape") {
        block();
        finish();
        return;
      }
      if (event.metaKey || event.ctrlKey) return;
      if (event.key === "Tab") {
        block();
        const next = document.activeElement === skip && !sound.hidden ? sound : skip;
        next.focus({ preventScroll: true });
        return;
      }
      if (event.target instanceof Node && layer.contains(event.target)) return;
      block();
    };
    function mediaFailed() {
      if (closed) return;
      clock();
      failedMedia = true;
      releaseVideo();
      syncSound();
      update();
    }
    function reducedMotion(event) {
      if (event.matches) mediaFailed();
    }
    function noteFrame() {
      if (closed || !video) return;
      frameRequest = void 0;
      clock();
      hasFrame = true;
      layer.dataset.frame = "shown";
      update();
    }
    function firstFrame() {
      if (!video || closed || hasFrame) return;
      if (video.requestVideoFrameCallback) frameRequest = video.requestVideoFrameCallback(noteFrame);
      else requestAnimationFrame(() => {
        if (video?.readyState >= 2) noteFrame();
      });
    }
    function play() {
      if (!video || !movieURL || video.readyState < 1 || video.seeking || closed || document.visibilityState !== "visible") return;
      const current = video, attempt = ++playAttempt;
      const active = () => !closed && current === video && attempt === playAttempt && document.visibilityState === "visible";
      void current.play().catch((error) => {
        if (!active()) return;
        if (error.name === "NotAllowedError" && !current.muted) {
          current.muted = true;
          soundBlocked = true;
          syncSound();
          void current.play().catch(() => {
            if (active()) mediaFailed();
          });
        } else mediaFailed();
      });
    }
    function syncSound() {
      sound.hidden = !video || failedMedia;
      if (sound.hidden) return;
      setStartupIcon(sound, video.muted ? "soundOff" : "soundOn", video.muted ? "\u5F00\u542F\u542F\u52A8\u58F0\u97F3" : "\u5173\u95ED\u542F\u52A8\u58F0\u97F3");
      sound.setAttribute("aria-pressed", String(!video.muted));
      if (soundBlocked) sound.setAttribute("aria-description", "\u81EA\u52A8\u64AD\u653E\u58F0\u97F3\u53D7\u9650\uFF0C\u70B9\u6309\u5F00\u542F\u58F0\u97F3");
      else sound.removeAttribute("aria-description");
    }
    function visibility() {
      clock();
      if (document.visibilityState === "visible") play();
      else video?.pause();
      update();
    }
    function update() {
      if (closed) return;
      clock();
      const boot = document.querySelector("[data-dsh-boot]");
      if (boot && !boot.querySelector("[data-dsh-boot-spinner]")) {
        finish();
        return;
      }
      ready = !boot && !!document.querySelector('[data-slot="main"], [contenteditable="true"]');
      layer.dataset.ready = String(ready);
      const deadline = failedMedia ? FALLBACK_VISIBLE_MS : MAX_VISIBLE_MS;
      if (visibleMs >= deadline || ready && failedMedia) {
        finish(hasFrame && !failedMedia);
        return;
      }
      if (!hasFrame && !failedMedia && visibleMs >= MEDIA_GRACE_MS) {
        mediaFailed();
        if (!ready) finish();
        return;
      }
      clearTimeout(timer);
      if (document.visibilityState !== "visible") return;
      const waits = [deadline - visibleMs];
      if (!hasFrame && !failedMedia) waits.push(MEDIA_GRACE_MS - visibleMs);
      timer = setTimeout(update, Math.max(1, Math.min(...waits)));
    }
    skip.onclick = leave;
    sound.onclick = () => {
      if (!video || closed) return;
      video.muted = !video.muted;
      soundBlocked = false;
      syncSound();
      play();
    };
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reducedMotion);
    window.addEventListener("pagehide", leave, { once: true });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const abandonTimer = setTimeout(leave, 3e4);
    if (!failedMedia) {
      video = document.createElement("video");
      video.className = "cyber-boot-video";
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      syncSound();
      video.playsInline = true;
      video.preload = "auto";
      video.loop = false;
      video.setAttribute("aria-hidden", "true");
      video.tabIndex = -1;
      video.poster = assetURL(preset.preview);
      video.onerror = mediaFailed;
      video.onloadedmetadata = play;
      video.onseeked = play;
      video.onplaying = () => {
        firstFrame();
        update();
      };
      video.onwaiting = update;
      video.onended = () => finish(true);
      decor.append(video);
      void (async () => {
        try {
          const response = await fetch(assetURL(preset.asset), { signal: mediaRequest.signal });
          if (!response.ok) throw new Error("Startup media unavailable");
          const movie = await response.blob();
          if (closed || !video) return;
          movieURL = URL.createObjectURL(movie);
          video.src = movieURL;
        } catch {
          if (!closed && !mediaRequest.signal.aborted) mediaFailed();
        }
      })();
    }
    update();
  }

  // lib/assets.mjs
  var assets = { "assets/cat.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZyBkYXRhLWNyZWF0dXJlPSJjYXQiPgogICAgPGcgY2xhc3M9InRhaWwgY2F0LXRhaWwiPjxwYXRoIGQ9Ik0xNjcgMTcyYzQ1IDkgNTMtMzggMjctMzgiIHN0cm9rZT0iI2I4OTg3NSIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE2NyAxNzJjNDUgOSA1My0zOCAyNy0zOCIgc3Ryb2tlPSIjZWJkN2I0IiBzdHJva2Utd2lkdGg9IjEzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L2c+CiAgICA8ZyBjbGFzcz0iY2F0LWJvZHkiPjxwYXRoIGQ9Ik03MyAxMzFjLTggMTUtMTQgMzgtMTIgNDkgMiAyMyAyNiAyNyA1NyAyNyAyOSAwIDUzLTcgNTMtMjggMC0xNS05LTM4LTE1LTQ4IiBmaWxsPSIjZjNlN2NjIiBzdHJva2U9IiM5YTgwNjciIHN0cm9rZS13aWR0aD0iMy41Ii8+PGVsbGlwc2UgY3g9IjEyMCIgY3k9IjE4MyIgcng9IjI5IiByeT0iMjAiIGZpbGw9IiNmZmY2ZTMiLz48L2c+CiAgICA8ZyBjbGFzcz0iY2F0LWZvb3QtbGVmdCI+PHBhdGggZD0iTTgxIDE5MmMtOCA3LTggMTcgNiAxOGgxMmM5LTEgMTAtOSAzLTE2IiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTg3IDIwMnY1bTctNXY1IiBzdHJva2U9IiNkMGI0OTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9ImNhdC1mb290LXJpZ2h0Ij48cGF0aCBkPSJNMTM3IDE5MmMtOCA3LTggMTcgNiAxOGgxMmM5LTEgMTAtOSAzLTE2IiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE0MyAyMDJ2NW03LTV2NSIgc3Ryb2tlPSIjZDBiNDkyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz4KICAgIDxnIGNsYXNzPSJwZXQtaGVhZCBjYXQtaGVhZCI+CiAgICAgIDxwYXRoIGQ9Im02MSA5NC0yLTQ3YzE2IDAgMzAgMTQgMzggMjQgMTQtNCAyNi00IDQwIDAgMTAtMTYgMjMtMjMgMzktMjVsLTIgNDhjOCA5IDEzIDE5IDEzIDMxIDAgMjctMjYgNDItNjcgNDItMzkgMC02Ni0xNC02Ni00MiAwLTEzIDEtMjMgNy0zMVoiIGZpbGw9IiNmZmYxZDYiIHN0cm9rZT0iIzlhODA2NyIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgICAgPHBhdGggY2xhc3M9ImNhdC1lYXJzIiBkPSJtNjggNjIgMSAyNSAxNi04bTc2LTE3LTEgMjUtMTUtNyIgZmlsbD0iI2U2YjdhYSIvPjxwYXRoIGQ9Im0xMDggNzUgMyAxNG0xNC0xNSAxIDE0IiBzdHJva2U9IiNkNWI3ODgiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgICAgIDxnIGNsYXNzPSJleWVzIiBmaWxsPSIjNjA1MzQ0Ij48ZWxsaXBzZSBjeD0iODkiIGN5PSIxMTkiIHJ4PSI0LjUiIHJ5PSI2LjUiLz48ZWxsaXBzZSBjeD0iMTQ5IiBjeT0iMTE5IiByeD0iNC41IiByeT0iNi41Ii8+PC9nPgogICAgICA8ZyBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgc3Ryb2tlPSIjNjA1MzQ0IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTgxIDExOXE4IDYgMTYgMCIvPjxwYXRoIGQ9Ik0xNDEgMTE5cTggNiAxNiAwIi8+PC9nPgogICAgICA8cGF0aCBkPSJtMTE0IDEzMiA2IDUgNi01IiBmaWxsPSIjYzk4ZjhkIi8+PHBhdGggY2xhc3M9Im1vdXRoLW5vcm1hbCIgZD0iTTEyMCAxMzdxLTQgOC0xMSAybTExLTJxNCA4IDExIDIiIHN0cm9rZT0iIzhjNzQ2MCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxlbGxpcHNlIGNsYXNzPSJtb3V0aC15YXduIiBzdHlsZT0iZGlzcGxheTpub25lIiBjeD0iMTIwIiBjeT0iMTQzIiByeD0iNiIgcnk9IjkiIGZpbGw9IiNhOTc4NzMiLz4KICAgICAgPHBhdGggZD0ibTY2IDEzMSAxMiAybS0xMyA2IDEzLTFtODUtNSAxMy0ybS0xMiA3IDEzIDIiIHN0cm9rZT0iI2JkYTA4MCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8ZWxsaXBzZSBjeD0iODIiIGN5PSIxMzQiIHJ4PSI4IiByeT0iNCIgZmlsbD0iI2VmYmRhYyIgb3BhY2l0eT0iLjY1Ii8+PGVsbGlwc2UgY3g9IjE1NyIgY3k9IjEzNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZWZiZGFjIiBvcGFjaXR5PSIuNjUiLz4KICAgIDwvZz4KICAgIDwhLS0gU2VwYXJhdGUgZm9yZWxlZ3Mgc3RheSB2aXNpYmxlIGFib3ZlIHRoZSBiZWxseTsgaGluZCBmZWV0IHJlbWFpbiBiZWxvdy4gLS0+CiAgICA8ZyBjbGFzcz0iY2F0LXBhdyBjYXQtcGF3LWxlZnQiPjxwYXRoIGQ9Ik04OCAxNjZjLTktMS0xMiA3LTkgMTZsMyA3YzYgNyAxMiA2IDE3IDAgMy00IDItOCAwLTEzbC0yLTVjLTItNC01LTUtOS01WiIgZmlsbD0iI2ZmZjFkNiIgc3Ryb2tlPSIjYmRhMDgwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJtODYgMTg0IDEgNW01LTYgMSA1IiBzdHJva2U9IiNkMGI0OTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9ImNhdC1wYXcgY2F0LXBhdy1yaWdodCI+PHBhdGggZD0iTTE1MiAxNjZjOS0xIDEyIDcgOSAxNmwtMyA3Yy02IDctMTIgNi0xNyAwLTMtNC0yLTggMC0xM2wyLTVjMi00IDUtNSA5LTVaIiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Im0xNTQgMTg0LTEgNW0tNS02LTEgNSIgc3Ryb2tlPSIjZDBiNDkyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz4KICA8L2c+Cjwvc3ZnPgo=", "assets/leaves.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48cGF0aCBkPSJNMTE5IDE5NlY5NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNmU5NzczIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTkgMTQwQzcyIDE0MiA1MyAxMDggNTQgNzNjNDMgMCA2OSAyNCA2NSA2N1oiIGZpbGw9IiNhZGNkYTAiLz48cGF0aCBkPSJNMTIwIDEyMGMtMy01MCAzMC02OSA2My02NiAzIDQyLTIzIDY5LTYzIDY2WiIgZmlsbD0iIzc5YWQ4MyIvPjxwYXRoIGQ9Ik0xMjAgMTcxYzI5LTMwIDUyLTI1IDY4LTEzLTIwIDI4LTQzIDMwLTY4IDEzWiIgZmlsbD0iI2I3ZDVhNyIvPjxwYXRoIGQ9Im03OCAxMDAgNDAgNDBtMi0yMSA0MS00MyIgc3Ryb2tlPSIjZWVmNGRkIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPgo=", "assets/robot.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InJvYm90LWJvZHkiIHgxPSI2NiIgeTE9IjgwIiB4Mj0iMTgwIiB5Mj0iMTgwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2JlZGVmMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPgogIDxnIGRhdGEtY3JlYXR1cmU9InJvYm90Ij4KICAgIDxnIGNsYXNzPSJyb2JvdC1sZWdzIiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PGcgY2xhc3M9InJvYm90LWxlZy1sZWZ0Ij48cGF0aCBkPSJNOTEgMTk1djEzIi8+PHBhdGggZD0iTTg3IDIwOWg5IiBzdHJva2Utd2lkdGg9IjEwIi8+PC9nPjxnIGNsYXNzPSJyb2JvdC1sZWctcmlnaHQiPjxwYXRoIGQ9Ik0xNDkgMTk1djEzIi8+PHBhdGggZD0iTTE0NSAyMDloOSIgc3Ryb2tlLXdpZHRoPSIxMCIvPjwvZz48L2c+CiAgICA8ZyBjbGFzcz0icm9ib3QtYXJtLWxlZnQiPjxwYXRoIGQ9Im03NCAxNTctMTYgMTUiIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTciIGN5PSIxNzQiIHI9IjciIGZpbGw9IiNjY2U3ZjciIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPgogICAgPGcgY2xhc3M9InJvYm90LWFybS1yaWdodCI+PHBhdGggZD0ibTE2OCAxNTcgMjAtMTIiIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0ibTE4NyAxNDUgNS05bS0zIDEwIDgtNCIgc3Ryb2tlPSIjNjk4ZmIyIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE4OCIgY3k9IjE0NiIgcj0iNyIgZmlsbD0iI2NjZTdmNyIgc3Ryb2tlPSIjNjk4ZmIyIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+CiAgICA8cmVjdCBjbGFzcz0icm9ib3QtYm9keSIgeD0iNzYiIHk9IjEzOSIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjU3IiByeD0iMjIiIGZpbGw9InVybCgjcm9ib3QtYm9keSkiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSIzLjUiLz4KICAgIDxyZWN0IHg9IjEwNCIgeT0iMTY0IiB3aWR0aD0iMzEiIGhlaWdodD0iMTQiIHJ4PSI3IiBmaWxsPSIjNGU5M2NlIi8+PGNpcmNsZSBjbGFzcz0icm9ib3Qtc3RhdHVzIiBjeD0iMTI0IiBjeT0iMTcxIiByPSIzIiBmaWxsPSIjYjZlZGZmIi8+CiAgICA8ZyBjbGFzcz0icGV0LWhlYWQgcm9ib3QtaGVhZCI+CiAgICAgIDxwYXRoIGQ9Ik0xMTcgNTFWMzUiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjbGFzcz0iYW50ZW5uYS1saWdodCIgY3g9IjExNyIgY3k9IjI4IiByPSI5IiBmaWxsPSIjODVkM2Y1IiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjExNCIgY3k9IjI1IiByPSIyLjUiIGZpbGw9IiNlY2ZiZmYiLz4KICAgICAgPHJlY3QgeD0iNDIiIHk9IjgwIiB3aWR0aD0iMTQiIGhlaWdodD0iMzgiIHJ4PSI3IiBmaWxsPSIjN2NiN2RmIiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMyIvPjxyZWN0IHg9IjE4NCIgeT0iODAiIHdpZHRoPSIxNCIgaGVpZ2h0PSIzOCIgcng9IjciIGZpbGw9IiM3Y2I3ZGYiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgIDxyZWN0IHg9IjUzIiB5PSI1MSIgd2lkdGg9IjEzNCIgaGVpZ2h0PSIxMDEiIHJ4PSIzNCIgZmlsbD0idXJsKCNyb2JvdC1ib2R5KSIgc3Ryb2tlPSIjNGU3MDkyIiBzdHJva2Utd2lkdGg9IjMuNSIvPgogICAgICA8cGF0aCBkPSJNNjkgNzNxOC0xMSAyMi0xMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPHJlY3QgeD0iNjUiIHk9IjgzIiB3aWR0aD0iNDYiIGhlaWdodD0iMzMiIHJ4PSIxMyIgZmlsbD0iI2VkZjlmZiIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjQiLz48cmVjdCB4PSIxMjgiIHk9IjgzIiB3aWR0aD0iNDYiIGhlaWdodD0iMzMiIHJ4PSIxMyIgZmlsbD0iI2VkZjlmZiIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMTExIDk4cTgtNiAxNyAwIiBzdHJva2U9IiMzNDUzNzAiIHN0cm9rZS13aWR0aD0iNCIvPgogICAgICA8ZyBjbGFzcz0iZXllcyIgZmlsbD0iIzM0NTM3MCI+PGVsbGlwc2UgY3g9Ijg5IiBjeT0iMTAwIiByeD0iNC41IiByeT0iNiIvPjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI0LjUiIHJ5PSI2Ii8+PC9nPgogICAgICA8ZyBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTgyIDEwMHE3IDUgMTQgMCIvPjxwYXRoIGQ9Ik0xNDMgMTAwcTcgNSAxNCAwIi8+PC9nPgogICAgICA8cGF0aCBjbGFzcz0ibW91dGgtbm9ybWFsIiBkPSJNMTEwIDEzMHExMCA3IDIwIDAiIHN0cm9rZT0iIzM0NTM3MCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZWxsaXBzZSBjbGFzcz0ibW91dGgteWF3biIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgY3g9IjEyMCIgY3k9IjEzMSIgcng9IjUiIHJ5PSI3IiBmaWxsPSIjNTY3YTk5Ii8+CiAgICAgIDxlbGxpcHNlIGN4PSI3NyIgY3k9IjEyNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZjBiYmM4Ii8+PGVsbGlwc2UgY3g9IjE2MyIgY3k9IjEyNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZjBiYmM4Ii8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K", "assets/splash-forest.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZWRmM2UyIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxwYXRoIGQ9Ik0xMTkgMTk2Vjk0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2ZTk3NzMiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTExOSAxNDBDNzIgMTQyIDUzIDEwOCA1NCA3M2M0MyAwIDY5IDI0IDY1IDY3WiIgZmlsbD0iI2FkY2RhMCIvPjxwYXRoIGQ9Ik0xMjAgMTIwYy0zLTUwIDMwLTY5IDYzLTY2IDMgNDItMjMgNjktNjMgNjZaIiBmaWxsPSIjNzlhZDgzIi8+PHBhdGggZD0iTTEyMCAxNzFjMjktMzAgNTItMjUgNjgtMTMtMjAgMjgtNDMgMzAtNjggMTNaIiBmaWxsPSIjYjdkNWE3Ii8+PHBhdGggZD0ibTc4IDEwMCA0MCA0MG0yLTIxIDQxLTQzIiBzdHJva2U9IiNlZWY0ZGQiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPjwvc3ZnPgo=", "assets/splash-stars.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZWNlOWZhIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxnIGZpbGw9IiM4YThlZGEiPjxwYXRoIGQ9Im0xMjAgNjUgOSA0MiA0MiAxMy00MiA5LTkgNDItMTMtNDItNDItOSA0Mi0xM1oiLz48cGF0aCBkPSJtNjIgMzUgNCAxOCAxOCA1LTE4IDQtNCAxOC01LTE4LTE4LTQgMTgtNVptMTE1IDEzNyA0IDE4IDE4IDUtMTggNC00IDE4LTUtMTgtMTgtNCAxOC01WiIvPjwvZz48ZyBmaWxsPSIjYjhiYWYwIj48Y2lyY2xlIGN4PSIxODUiIGN5PSI2MiIgcj0iNCIvPjxjaXJjbGUgY3g9IjQ5IiBjeT0iMTYxIiByPSI0Ii8+PGNpcmNsZSBjeD0iMTU3IiBjeT0iNDAiIHI9IjMiLz48Y2lyY2xlIGN4PSI5OSIgY3k9IjE5NiIgcj0iMyIvPjwvZz48L2c+PC9zdmc+Cg==", "assets/splash-whale.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZThmNWZmIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0id2hhbGUtYm9keSIgeDE9IjcyIiB5MT0iNjMiIHgyPSIxNDMiIHkyPSIxODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjOWRkZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTA5NWRmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGcgZGF0YS1jcmVhdHVyZT0id2hhbGUiPjxwYXRoIGQ9Ik0xNzcgMTIyYzIzLTQgMjUtMjMgMjItMzkgMTggNyAyOCAyOSAxNSA0OC03IDExLTIwIDE4LTM0IDE4IiBmaWxsPSIjNmFhZmU5IiBzdHJva2U9IiMzMTZiOWYiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTQwIDEyNGMwLTM0IDI1LTYxIDY3LTYxIDQwIDAgNzYgMjYgNzYgNjUgMCA0My0zNiA2MS03NSA2MS00MCAwLTY4LTIzLTY4LTY1WiIgZmlsbD0idXJsKCN3aGFsZS1ib2R5KSIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMuNSIvPjxwYXRoIGQ9Ik00NSAxNDVjMjYgMjMgODEgMjggMTI2IDAtOCAyNy0zMiAzOS02MiAzOS0zMSAwLTU0LTEzLTY0LTM5WiIgZmlsbD0iI2RiZjVmZiIvPjxwYXRoIGQ9Ik0xMTkgMTQ4YzQgMTggMTggMjUgMzQgMTgiIGZpbGw9IiM3MWI3ZWMiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZyBjbGFzcz0iZXllcyI+PGVsbGlwc2UgY3g9IjcyIiBjeT0iMTIyIiByeD0iNSIgcnk9IjciIGZpbGw9IiMyNDQ5NjYiLz48Y2lyY2xlIGN4PSI3MyIgY3k9IjEyMCIgcj0iMS42IiBmaWxsPSJ3aGl0ZSIvPjwvZz48ZWxsaXBzZSBjeD0iNjIiIGN5PSIxMzciIHJ4PSIxMCIgcnk9IjUiIGZpbGw9IiNmMWI5YzUiIG9wYWNpdHk9Ii44Ii8+PHBhdGggZD0iTTg0IDEzOXE5IDcgMTctMiIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTEgNTlxLTE2LTgtMTUtMjBtMTUgMjBxMS0yOCAxMy0yNyIgc3Ryb2tlPSIjNzVjN2YxIiBzdHJva2Utd2lkdGg9IjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjkxIiBjeT0iMjgiIHI9IjUiIGZpbGw9IiNhNWUyZmEiLz48Y2lyY2xlIGN4PSIxMzYiIGN5PSI0MCIgcj0iNCIgZmlsbD0iI2E1ZTJmYSIvPjxwYXRoIGQ9Ik02MiA5OXExMC0xNyAyOC0yMSIgc3Ryb2tlPSIjZGZmN2ZmIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iLjgiLz48L2c+PC9nPjwvc3ZnPgo=", "assets/stars.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48ZyBmaWxsPSIjOGE4ZWRhIj48cGF0aCBkPSJtMTIwIDY1IDkgNDIgNDIgMTMtNDIgOS05IDQyLTEzLTQyLTQyLTkgNDItMTNaIi8+PHBhdGggZD0ibTYyIDM1IDQgMTggMTggNS0xOCA0LTQgMTgtNS0xOC0xOC00IDE4LTVabTExNSAxMzcgNCAxOCAxOCA1LTE4IDQtNCAxOC01LTE4LTE4LTQgMTgtNVoiLz48L2c+PGcgZmlsbD0iI2I4YmFmMCI+PGNpcmNsZSBjeD0iMTg1IiBjeT0iNjIiIHI9IjQiLz48Y2lyY2xlIGN4PSI0OSIgY3k9IjE2MSIgcj0iNCIvPjxjaXJjbGUgY3g9IjE1NyIgY3k9IjQwIiByPSIzIi8+PGNpcmNsZSBjeD0iOTkiIGN5PSIxOTYiIHI9IjMiLz48L2c+PC9zdmc+Cg==", "assets/theme-forest.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZmFmOWYxIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjZWRmMWUzIi8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjZGFlOGNhIi8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiMzZTc1NTUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iI2RhZThjYSIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iI2VkZjFlMyIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjM2U3NTU1IiBmaWxsPSIjZmFmOWYxIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/theme-ice.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZjVmYWZmIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjZWFmM2ZiIi8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjZDhlYWZmIi8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiMyODY4YmQiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iI2Q4ZWFmZiIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iI2VhZjNmYiIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjMjg2OGJkIiBmaWxsPSIjZjVmYWZmIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/theme-night.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjMTQxZDMyIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjMTcyMjM4Ii8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjMzQ0NjY4Ii8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiNhOWJjZmYiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iIzM0NDY2OCIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iIzE3MjIzOCIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjYTliY2ZmIiBmaWxsPSIjMTQxZDMyIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/whale.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9IndoYWxlLWJvZHkiIHgxPSI3MiIgeTE9IjYzIiB4Mj0iMTQzIiB5Mj0iMTg0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzlkZGZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzUwOTVkZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPgogIDxnIGRhdGEtY3JlYXR1cmU9IndoYWxlIj4KICAgIDxnIGNsYXNzPSJ0YWlsIHdoYWxlLXRhaWwiPjxwYXRoIGQ9Ik0xNzcgMTIyYzIzLTQgMjUtMjMgMjItMzkgMTggNyAyOCAyOSAxNSA0OC03IDExLTIwIDE4LTM0IDE4IiBmaWxsPSIjNmFhZmU5IiBzdHJva2U9IiMzMTZiOWYiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9IndoYWxlLWJvZHkiPjxwYXRoIGQ9Ik00MCAxMjRjMC0zNCAyNS02MSA2Ny02MSA0MCAwIDc2IDI2IDc2IDY1IDAgNDMtMzYgNjEtNzUgNjEtNDAgMC02OC0yMy02OC02NVoiIGZpbGw9InVybCgjd2hhbGUtYm9keSkiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzLjUiLz48cGF0aCBkPSJNNDUgMTQ1YzI2IDIzIDgxIDI4IDEyNiAwLTggMjctMzIgMzktNjIgMzktMzEgMC01NC0xMy02NC0zOVoiIGZpbGw9IiNkYmY1ZmYiLz48cGF0aCBkPSJNNjIgOTlxMTAtMTcgMjgtMjEiIHN0cm9rZT0iI2RmZjdmZiIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9Ii44Ii8+PC9nPgogICAgPHBhdGggY2xhc3M9IndoYWxlLWZpbiIgZD0iTTExOSAxNDhjNCAxOCAxOCAyNSAzNCAxOCIgZmlsbD0iIzcxYjdlYyIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPGcgY2xhc3M9ImV5ZXMiPjxlbGxpcHNlIGN4PSI3MiIgY3k9IjEyMiIgcng9IjUiIHJ5PSI3IiBmaWxsPSIjMjQ0OTY2Ii8+PGNpcmNsZSBjeD0iNzMiIGN5PSIxMjAiIHI9IjEuNiIgZmlsbD0id2hpdGUiLz48L2c+CiAgICA8cGF0aCBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgZD0iTTY1IDEyM3E3IDUgMTQgMCIgc3Ryb2tlPSIjMjQ0OTY2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPGVsbGlwc2UgY3g9IjYyIiBjeT0iMTM3IiByeD0iMTAiIHJ5PSI1IiBmaWxsPSIjZjFiOWM1IiBvcGFjaXR5PSIuOCIvPjxwYXRoIGNsYXNzPSJtb3V0aC1ub3JtYWwiIGQ9Ik04NCAxMzlxOSA3IDE3LTIiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZWxsaXBzZSBjbGFzcz0ibW91dGgteWF3biIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgY3g9Ijk0IiBjeT0iMTM5IiByeD0iNSIgcnk9IjYiIGZpbGw9IiMzMTZiOWYiLz4KICAgIDxnIGNsYXNzPSJ3aGFsZS1zcG91dCI+PHBhdGggZD0iTTExMSA1OXEtMTYtOC0xNS0yMG0xNSAyMHExLTI4IDEzLTI3IiBzdHJva2U9IiM3NWM3ZjEiIHN0cm9rZS13aWR0aD0iNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iOTEiIGN5PSIyOCIgcj0iNSIgZmlsbD0iI2E1ZTJmYSIvPjxjaXJjbGUgY3g9IjEzNiIgY3k9IjQwIiByPSI0IiBmaWxsPSIjYTVlMmZhIi8+PC9nPgogIDwvZz4KPC9zdmc+Cg==" };
  var sceneCss = ".scene-whale {\n  background: linear-gradient(145deg, #fff 10%, #e8f5ff 65%, #d9ebfc);\n}\n.scene-stars {\n  background: radial-gradient(\n    ellipse at 55% 45%,\n    #f4f1ff,\n    #e6ebff 65%,\n    #dde6fc\n  );\n}\n.scene-forest {\n  background: linear-gradient(150deg, #fffcf0, #eef5e5 60%, #e1efd9);\n}\n.scene-orbs {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n.scene-orbs i {\n  position: absolute;\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: #ffffff6b;\n  filter: blur(2px);\n  animation: scene-drift 9s ease-in-out infinite;\n}\n.scene-orbs i:nth-child(1) {\n  left: 13%;\n  top: 18%;\n  width: 50px;\n  height: 50px;\n  border: 1px solid #ffffffa3;\n}\n.scene-orbs i:nth-child(2) {\n  right: 12%;\n  bottom: 5%;\n  animation-delay: -4s;\n}\n.scene-orbs i:nth-child(3) {\n  right: 20%;\n  top: 19%;\n  width: 12px;\n  height: 12px;\n  animation-delay: -7s;\n}\n.scene-art {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  animation: scene-drift 5s ease-in-out infinite;\n}\n.scene-stars .scene-art {\n  animation: stars-gather 5s ease-in-out infinite;\n}\n.scene-forest .scene-art {\n  animation: leaf-sway 6s ease-in-out infinite;\n  transform-origin: 50% 80%;\n}\n@keyframes scene-drift {\n  50% {\n    transform: translateY(-12px) rotate(2deg);\n  }\n}\n@keyframes stars-gather {\n  50% {\n    transform: scale(0.91) rotate(5deg);\n    opacity: 0.6;\n  }\n}\n@keyframes leaf-sway {\n  50% {\n    transform: rotate(5deg) translateY(-5px);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .scene-art,\n  .scene-orbs i {\n    animation: none !important;\n  }\n}\n";

  // src/asset-fallback.mjs
  var fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" data-fallback="emergency"><g data-creature="whale"><path class="whale-tail" d="M171 125q26-3 25-34 31 27-14 56" fill="#79b9ec" stroke="#316b9f" stroke-width="4" stroke-linejoin="round"/><ellipse class="whale-body" cx="109" cy="130" rx="72" ry="57" fill="#98d8fa" stroke="#316b9f" stroke-width="4"/><path d="M43 149q62 31 132 0-15 33-65 34-49 0-67-34" fill="#e2f6ff"/><path class="whale-fin" d="M117 151q9 22 30 12" fill="#79b9ec" stroke="#316b9f" stroke-width="3" stroke-linecap="round"/><circle class="eyes" cx="76" cy="124" r="6" fill="#244966"/><path class="sleep-eyes" style="display:none" d="M70 124q6 5 12 0" fill="none" stroke="#244966" stroke-width="3" stroke-linecap="round"/><path d="M88 143q9 8 19-1" fill="none" stroke="#316b9f" stroke-width="3" stroke-linecap="round"/><path class="whale-spout" d="M112 67q-16-5-15-20m15 20q1-22 13-24" fill="none" stroke="#79b9ec" stroke-width="6" stroke-linecap="round"/></g></svg>';
  var fallbackData = "data:image/svg+xml," + encodeURIComponent(fallbackSvg);

  // src/pet-size.mjs
  var PET_SIZE = Object.freeze({ min: 80, max: 320, step: 10, default: 120 });

  // src/presets.mjs
  var themes = [
    {
      id: "geek",
      name: "\u6781\u5BA2 \xB7 \u6DF1\u6D77\u4E2D\u67A2",
      caption: "\u4EE3\u7801\u6D6E\u7A97\u3001\u7EC8\u7AEF\u7EC6\u7EBF\uFF0C\u8FDE\u63A5\u6DF1\u6D77\u7075\u611F\u3002",
      scheme: "dark",
      preview: "assets/geek-wallpaper.png",
      wallpaper: "assets/geek-wallpaper.png",
      palette: { base: "#050c12", surface: "#0b1b26", sidebar: "#07131c", soft: "#102837", selected: "#0c354a", text: "#e0f3ff", muted: "#9dbacd", accent: "#36d5ff", border: "#285369", code: "#07131d" }
    },
    {
      id: "cyberdad",
      name: "\u8D5B\u535A\u8001\u7238 \xB7 \u79D1\u6280\u6DF1\u84DD",
      caption: "\u66F4\u667A\u80FD\uFF0C\u66F4\u53EF\u9760\uFF0C\u4E5F\u66F4\u8D34\u5FC3\u3002",
      scheme: "dark",
      preview: "assets/cyberdad-wallpaper.png",
      wallpaper: "assets/cyberdad-wallpaper.png",
      palette: { base: "#071321", surface: "#102339", sidebar: "#081a2d", soft: "#142c46", selected: "#164263", text: "#e1f2ff", muted: "#a4bbd1", accent: "#61cfff", border: "#345a7c", code: "#09182a" }
    },
    {
      id: "whalegirl",
      name: "\u9CB8\u9C7C\u5A18 \xB7 \u6DF1\u84DD\u9713\u8679",
      caption: "\u5728\u6DF1\u6D77\u5FAE\u5149\u91CC\uFF0C\u548C\u7075\u611F\u5E76\u80A9\u3002",
      scheme: "dark",
      preview: "assets/whalegirl-wallpaper.png",
      wallpaper: "assets/whalegirl-wallpaper.png",
      palette: { base: "#08121f", surface: "#101f32", sidebar: "#0b1725", soft: "#13293d", selected: "#173950", text: "#d8eeff", muted: "#93aec6", accent: "#65d9ff", border: "#31506b", code: "#0a1729" }
    },
    {
      id: "ice",
      name: "\u6E05\u900F\u51B0\u84DD",
      caption: "\u628A\u5DE5\u4F5C\uFF0C\u7559\u7ED9\u4E00\u7247\u6E05\u6F88\u3002",
      scheme: "light",
      preview: "assets/theme-ice.svg",
      palette: {
        base: "#f5faff",
        surface: "#ffffff",
        sidebar: "#eaf3fb",
        soft: "#edf5ff",
        selected: "#d8eaff",
        text: "#203449",
        muted: "#597087",
        accent: "#2868bd",
        border: "#d1dfed",
        code: "#edf4fb"
      }
    },
    {
      id: "night",
      name: "\u661F\u6CB3\u591C\u822A",
      caption: "\u591C\u6DF1\u4E86\uFF0C\u7075\u611F\u8FD8\u4EAE\u7740\u3002",
      scheme: "dark",
      preview: "assets/theme-night.svg",
      palette: {
        base: "#141d32",
        surface: "#1d2941",
        sidebar: "#172238",
        soft: "#23324e",
        selected: "#344668",
        text: "#e1e9f6",
        muted: "#acbbd2",
        accent: "#a9bcff",
        border: "#3b4b67",
        code: "#182239"
      }
    },
    {
      id: "forest",
      name: "\u68EE\u6797\u5976\u6CB9",
      caption: "\u7ED9\u5FD9\u788C\u7684\u65E5\u5E38\uFF0C\u4E00\u70B9\u547C\u5438\u3002",
      scheme: "light",
      preview: "assets/theme-forest.svg",
      palette: {
        base: "#faf9f1",
        surface: "#fffef9",
        sidebar: "#edf1e3",
        soft: "#f0f3e7",
        selected: "#dae8ca",
        text: "#2e4336",
        muted: "#607365",
        accent: "#3e7555",
        border: "#d5dfca",
        code: "#edf1e4"
      }
    }
  ];
  var splashes = [
    {
      id: "geek",
      name: "\u6781\u5BA2 \xB7 \u7CFB\u7EDF\u5524\u9192",
      caption: "\u4E00\u675F\u79D1\u6280\u84DD\u5149\uFF0C\u5F00\u542F\u4E13\u6CE8\u65F6\u523B\u3002",
      preview: "assets/geek-wallpaper.png",
      asset: "assets/geek-startup.mp4",
      scene: "geek",
      mediaType: "video",
      videoFit: "contain"
    },
    {
      id: "cyberdad",
      name: "\u8D5B\u535A\u8001\u7238 \xB7 \u84DD\u5149\u542F\u7A0B",
      caption: "\u79D1\u6280\u84DD\u7EBF\u6761\uFF0C\u7ED8\u51FA\u4ECA\u5929\u7684\u966A\u4F34\u3002",
      preview: "assets/cyberdad-wallpaper.png",
      asset: "assets/cyberdad-startup.mp4",
      scene: "cyberdad",
      mediaType: "video",
      videoFit: "contain"
    },
    {
      id: "whalegirl",
      name: "\u9CB8\u9C7C\u5A18 \xB7 \u6DF1\u84DD\u542F\u822A",
      caption: "\u4F60\u63D0\u4F9B\u7684\u52A8\u6001\u58C1\u7EB8\uFF0C\u966A\u4F34\u771F\u5B9E\u542F\u52A8\u3002",
      preview: "assets/whalegirl-wallpaper.png",
      asset: "assets/whalegirl-startup.mp4",
      scene: "whalegirl",
      mediaType: "video"
    },
    {
      id: "whale",
      name: "\u6E05\u900F\u84DD\u9CB8",
      caption: "\u8F7B\u8F7B\u6E38\u8FDB\u4ECA\u5929\u7684\u7075\u611F\u3002",
      preview: "assets/splash-whale.svg",
      asset: "assets/whale.svg",
      scene: "whale"
    },
    {
      id: "stars",
      name: "\u661F\u6CB3\u5FAE\u5149",
      caption: "\u661F\u5149\u6162\u6162\u9760\u8FD1\uFF0C\u597D\u70B9\u5B50\u4E5F\u662F\u3002",
      preview: "assets/splash-stars.svg",
      asset: "assets/stars.svg",
      scene: "stars"
    },
    {
      id: "forest",
      name: "\u68EE\u6797\u6668\u5149",
      caption: "\u5728\u4E00\u7F15\u6668\u5149\u91CC\uFF0C\u91CD\u65B0\u51FA\u53D1\u3002",
      preview: "assets/splash-forest.svg",
      asset: "assets/leaves.svg",
      scene: "forest"
    }
  ];
  var pets = [
    {
      id: "cyberdad",
      name: "\u8D5B\u535A\u8001\u7238",
      caption: "\u6234\u597D\u773C\u955C\uFF0C\u966A\u4F60\u5DE5\u4F5C\uFF0C\u4E5F\u966A\u4F60\u5077\u4E2A\u61D2\u3002",
      preview: "assets/cyberdad-atlas.png",
      asset: "assets/cyberdad-atlas.png",
      sprite: { columns: 4, rows: 2 }
    },
    {
      id: "whalegirl",
      name: "\u9CB8\u9C7C\u5A18",
      caption: "\u6253\u4E2A\u54C8\u6B20\uFF0C\u5403\u70B9\u96F6\u98DF\uFF0C\u518D\u966A\u4F60\u5DE5\u4F5C\u3002",
      preview: "assets/whalegirl-atlas.png",
      asset: "assets/whalegirl-atlas.png",
      sprite: { columns: 4, rows: 2 }
    },
    {
      id: "whale",
      name: "\u5C0F\u84DD\u9CB8",
      caption: "\u4E0D\u50AC\u4F60\uFF0C\u53EA\u966A\u4F60\u6162\u6162\u5411\u524D\u3002",
      preview: "assets/whale.svg",
      asset: "assets/whale.svg"
    },
    {
      id: "cat",
      name: "\u5976\u6CB9\u732B",
      caption: "\u8BA4\u771F\u6478\u9C7C\uFF0C\u5076\u5C14\u4F38\u4E2A\u61D2\u8170\u3002",
      preview: "assets/cat.svg",
      asset: "assets/cat.svg"
    }
  ];
  var defaults = {
    version: 1,
    enabled: true,
    theme: "whalegirl",
    splash: "whalegirl",
    pet: {
      id: "whalegirl",
      enabled: false,
      size: PET_SIZE.default,
      paused: false,
      sound: true,
      position: null
    }
  };

  // src/catalog.mjs
  var builtin = { theme: themes, splash: splashes, pet: pets };
  function catalogFor(state2, kind) {
    return [...builtin[kind] || [], ...Array.isArray(state2?.custom?.[kind]) ? state2.custom[kind] : []];
  }
  function customAssetId(path) {
    return typeof path === "string" ? /^custom-assets\/(custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.(?:png|jpg|webp|gif|svg)$/.exec(path)?.[1] || null : null;
  }
  function builtinAssetId(path) {
    return typeof path === "string" ? /^assets\/(whalegirl-(?:wallpaper|atlas)|cyberdad-(?:logo|atlas|wallpaper)|geek-wallpaper)\.png$/.exec(path)?.[1] || /^assets\/((?:whalegirl|cyberdad|geek)-startup)\.mp4$/.exec(path)?.[1] || null : null;
  }

  // plugin/startup.mjs
  var state = globalThis.__CYBERDADDY_APPEARANCE__;
  if (state?.enabled && state.splash !== "off") {
    const preset = catalogFor(state, "splash").find((x) => x.id === state.splash) || splashes.find((x) => x.id === defaults.splash);
    const assetURL = (path) => {
      const custom = customAssetId(path), builtin2 = builtinAssetId(path);
      return custom ? "/api/cyberdaddy/asset?id=" + encodeURIComponent(custom) : builtin2 ? "/api/cyberdaddy/builtin?id=" + encodeURIComponent(builtin2) : assets[path] || assets["assets/whale.svg"] || fallbackData;
    };
    if (preset.mediaType === "video" && builtinAssetId(preset.asset) && preset.asset.endsWith(".mp4")) mountVideoStartup(preset, assetURL, fallbackData);
    else mountSvgStartup(preset, assetURL);
  }
  function mountSvgStartup(preset, assetURL) {
    let root, decor, style, skip, seen = false, closed = false;
    function clean() {
      if (closed) return;
      closed = true;
      observer.disconnect();
      for (const image of decor?.querySelectorAll("img") || []) {
        image.onerror = null;
        image.removeAttribute("src");
      }
      decor?.remove();
      style?.remove();
      if (skip) {
        skip.onclick = null;
        skip.remove();
      }
      root?.removeAttribute("data-cyber-boot");
      globalThis.removeEventListener("pagehide", clean);
      root = decor = style = skip = null;
    }
    function update() {
      if (closed) return;
      if (seen && (!root.isConnected || !root.querySelector("[data-dsh-boot-spinner]"))) {
        clean();
        return;
      }
      if (seen) return;
      root = document.querySelector("[data-dsh-boot]");
      if (!root) return;
      if (!root.querySelector("[data-dsh-boot-spinner]")) {
        clean();
        return;
      }
      seen = true;
      root.dataset.cyberBoot = preset.scene;
      style = document.createElement("style");
      style.textContent = sceneCss + startupControlCss + `[data-cyber-boot]{background:linear-gradient(135deg,#fff,#e0f0ff)!important;isolation:isolate}[data-cyber-boot="stars"]{background:linear-gradient(135deg,#eeefff,#d8e7fb)!important}[data-cyber-boot="forest"]{background:linear-gradient(135deg,#fbf8ed,#dfefdb)!important}[data-cyber-boot]>:first-child{z-index:2;position:relative;background:#ffffffb8!important;color:#305273!important;backdrop-filter:blur(12px)}.cyber-boot-art{position:absolute;inset:0;pointer-events:none;z-index:0;display:grid;place-items:center}.cyber-boot-art .scene-art{position:absolute;width:190px;height:190px;top:12%;opacity:.9}[data-cyber-boot] .cyber-boot-skip{position:absolute;right:18px;bottom:18px;z-index:4}`;
      if (preset.custom && /^#[0-9a-f]{6}$/i.test(preset.background)) style.textContent += `[data-cyber-boot]{background:${preset.background}!important}.cyber-boot-art .scene-art{top:5%;width:85vw;max-width:900px;height:38vh;object-fit:contain}`;
      document.head.append(style);
      decor = document.createElement("div");
      decor.className = "cyber-boot-art scene-" + preset.scene;
      const image = document.createElement("img");
      image.className = "scene-art";
      image.alt = "";
      image.onerror = () => {
        image.onerror = null;
        image.src = fallbackData;
      };
      image.src = assetURL(preset.asset);
      decor.append(image);
      decor.insertAdjacentHTML("beforeend", '<div class="scene-orbs"><i></i><i></i><i></i></div>');
      skip = document.createElement("button");
      skip.className = "cyber-boot-skip";
      setStartupIcon(skip, "skip", "\u8DF3\u8FC7\u52A8\u753B");
      skip.onclick = clean;
      root.append(decor, skip);
    }
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    globalThis.addEventListener("pagehide", clean, { once: true });
    update();
  }
})();
