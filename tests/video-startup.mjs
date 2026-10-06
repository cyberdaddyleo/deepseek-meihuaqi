// Controlled BootPage lifecycle fixture with the real built startup bundle and
// the user-provided MP4. This is not a replacement Harness or a demo screenshot.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { root } from '../scripts/paths.mjs';
import { builtinMediaResponse } from '../plugin/builtin-media.mjs';

// Per-preset entrypoints run the same real decoding / cleanup regression suite
// against every shipped movie, including its actual soundtrack.
const presetId = process.env.CYBER_TEST_VIDEO_PRESET || 'whalegirl';
const expected = {
  whalegirl: { duration: 7.081995, sha256: '4a64573135f1bdc4941a10e6ae8c1f34dfd2d87bd9d2a795e9c68a98d37c8490' },
  cyberdad: { duration: 7.072, width: 1918, height: 1080, sha256: 'e179d0f7050a15ff4f569c27d453d13b84ffc0902dafdf8b65ee9ae0bae27231' },
  geek: { duration: 7.071995, width: 3184, height: 1792, fit: 'contain', sha256: 'a14d054783a89e9514c94ca9fb89da0211540fd2c1eebe8fb5cac5df868b785c' },
}[presetId];
assert.ok(expected, 'the video regression suite only selects a shipped preset');
assert.equal(createHash('sha256').update(readFileSync(join(root, 'assets', presetId + '-startup.mp4'))).digest('hex'), expected.sha256, 'the verified startup movie and soundtrack are unchanged');
const mediaId = presetId + '-startup';
const html = '<!doctype html><html><body><main id="root"><div data-dsh-boot><div>HARNESS<div data-dsh-boot-spinner></div><p>Loading plugins…</p></div></div></main></body></html>';
const timers = new Set();
const server = createServer(async (req, res) => {
  if (!req.url.startsWith('/api/cyberdaddy/builtin')) {
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
  }
  const scenario = new URL(req.headers.referer || 'http://local/').pathname.slice(1);
  if (req.url.includes('id=' + mediaId) && scenario.startsWith('missing')) {
    res.writeHead(404); res.end(); return;
  }
  const send = async () => {
    if (res.destroyed) return;
    const result = builtinMediaResponse(new Request('http://local' + req.url, { headers: req.headers }), root);
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  };
  if (req.url.includes('id=' + mediaId) && (scenario.startsWith('slow') || scenario === 'early-ready')) {
    const timer = setTimeout(() => { timers.delete(timer); void send(); }, scenario.startsWith('slow') ? 7000 : 350);
    timers.add(timer); res.once('close', () => { clearTimeout(timer); timers.delete(timer); });
  } else await send();
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;

async function fixture(scenario, { hidden = false } = {}) {
  const page = await browser.newPage({ reducedMotion: scenario === 'reduced' ? 'reduce' : 'no-preference' });
  page.setDefaultTimeout(8000);
  await page.goto(origin + '/' + scenario);
  await page.evaluate(({ scenario, hidden, presetId, mediaId }) => {
    globalThis.__CYBERDADDY_APPEARANCE__ = { enabled: true, splash: presetId };
    // Test visibility transitions without minimizing or stealing a user's app.
    // hasFocus=false deliberately reproduces background/automation focus while
    // the document remains visible; focus must not gate startup completion.
    globalThis.__visibility = hidden ? 'hidden' : 'visible';
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => globalThis.__visibility });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => globalThis.__visibility !== 'visible' });
    document.hasFocus = () => false;
    if (scenario === 'blocked') HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay test block', 'NotAllowedError'));
    if (scenario === 'audio-blocked') {
      const originalPlay = HTMLMediaElement.prototype.play;
      // Playwright's evaluate can itself count as activation. Model the policy
      // explicitly until an actual trusted click reaches the sound control.
      let audioGesture = false;
      document.addEventListener('click', event => { if (event.isTrusted && event.target.closest('.cyber-boot-sound')) audioGesture = true; }, true);
      HTMLMediaElement.prototype.play = function () {
        if (!this.muted && !audioGesture) return Promise.reject(new DOMException('Sound needs a click', 'NotAllowedError'));
        return originalPlay.call(this);
      };
    }
    globalThis.__rapidTimers=0;const nativeTimeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>{if(ms<=5)globalThis.__rapidTimers++;return nativeTimeout(fn,ms,...args);};
    const trace = globalThis.__trace = { added: 0, removed: null, firstFrame: null, firstVisibleFrame: null, firstVisibleTime: null, frames: 0, mediaTime: null, duration: null, width: null, height: null, endedAt: null, endedTime: null, pause: 0, load: 0, video: null, blobsCreated: [], blobsRevoked: [], fetches: [] };
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = blob => { const url = create(blob); trace.blobsCreated.push(url); return url; };
    URL.revokeObjectURL = url => { trace.blobsRevoked.push(url); return revoke(url); };
    const fetchMedia = window.fetch.bind(window);
    window.fetch = (input, options) => {
      if (!String(input?.url || input).includes('id=' + mediaId)) return fetchMedia(input, options);
      const attempt = { pending: true, abortedWhilePending: false }; trace.fetches.push(attempt);
      const signal = options?.signal || input?.signal;
      signal?.addEventListener('abort', () => { if (attempt.pending) attempt.abortedWhilePending = true; }, { once: true });
      return fetchMedia(input, options).finally(() => { attempt.pending = false; });
    };
    if (scenario === 'native-unseekable') {
      // Narrow reproduction of the native custom protocol's observed seek
      // clamp. The decoder, seek events, MP4 and Blob path remain real.
      const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
      Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
        ...descriptor,
        set(value) { return descriptor.set.call(this, this.src.startsWith('blob:') ? value : 0); },
      });
    }
    for (const method of ['pause', 'load']) {
      const original = HTMLMediaElement.prototype[method];
      HTMLMediaElement.prototype[method] = function (...args) { trace[method]++; return original.apply(this, args); };
    }
    new MutationObserver(() => {
      const overlay = document.querySelector('[data-cyber-video-startup]');
      if (overlay && !trace.overlay) { trace.overlay = overlay; trace.added++; }
      if (trace.overlay && !trace.overlay.isConnected && trace.removed === null) trace.removed = performance.now();
      const video = document.querySelector('.cyber-boot-video');
      if (video && !trace.video) {
        trace.video = video;
        video.addEventListener('loadedmetadata', () => { trace.duration = video.duration; trace.width = video.videoWidth; trace.height = video.videoHeight; }, { once: true });
        video.addEventListener('ended', () => { trace.endedAt = performance.now(); trace.endedTime = video.currentTime; trace.audioBytes = video.webkitAudioDecodedByteCount; trace.muted = video.muted; trace.volume = video.volume; }, { once: true });
        const frame = (time, metadata) => {
          trace.frames++; trace.mediaTime = metadata.mediaTime;
          if (trace.firstFrame === null) trace.firstFrame = time;
          const layer = document.querySelector('[data-cyber-video-startup]');
          if (document.visibilityState === 'visible' && layer?.hasAttribute('data-frame') && Number(getComputedStyle(video).opacity) > 0) {
            trace.firstVisibleFrame ??= time; trace.firstVisibleTime ??= metadata.mediaTime;
          }
          if (video.isConnected) video.requestVideoFrameCallback(frame);
        };
        video.requestVideoFrameCallback(frame);
      }
    }).observe(document, { childList: true, subtree: true });
  }, { scenario, hidden, presetId, mediaId });
  await page.addScriptTag({ path: join(root, 'lib/startup.js') });
  return page;
}

async function mountWork(page) {
  await page.evaluate(() => {
    const editor = document.createElement('div'); editor.id = 'fixture-editor'; editor.contentEditable = 'true'; editor.textContent = '初始化中的草稿';
    globalThis.__sendAttempts = 0;
    editor.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.defaultPrevented) globalThis.__sendAttempts++; });
    document.querySelector('#root').replaceChildren(editor);
  });
}
async function firstVisibleFrame(page) {
  await page.waitForFunction(() => globalThis.__trace.firstVisibleFrame !== null);
}
async function assertIconButton(button, label) {
  const actual = await button.evaluate(el => {
    const icon = el.querySelector('svg'), bounds = el.getBoundingClientRect(), iconBounds = icon?.getBoundingClientRect();
    return { text: el.textContent.trim(), label: el.getAttribute('aria-label'), icons: el.querySelectorAll('svg').length, size: [bounds.width, bounds.height], iconSize: iconBounds && [iconBounds.width, iconBounds.height] };
  });
  assert.deepEqual(actual, { text: '', label, icons: 1, size: [30, 30], iconSize: [16, 16] }, 'startup controls are compact icons with accessible names');
}
async function assertQuietFooter(page) {
  assert.equal(await page.locator('.cyber-video-footer').innerText(), '', 'the decorative startup footer contains no visible control or initialization text');
  assert.equal(await page.locator('.cyber-video-footer .cyber-video-status, .cyber-video-footer [role="status"]').count(), 0, 'the duplicate initialization status is not rendered');
}
async function cleaned(page, timeout = 10500) {
  await page.waitForFunction(() => !document.querySelector('[data-cyber-video-startup]'), null, { timeout });
  const trace = await page.evaluate(() => {
    const t = globalThis.__trace, v = t.video;
    return { added: t.added, removed: t.removed, firstFrame: t.firstFrame, firstVisibleFrame: t.firstVisibleFrame, firstVisibleTime: t.firstVisibleTime, frames: t.frames, mediaTime: t.mediaTime, duration: t.duration, width: t.width, height: t.height, endedAt: t.endedAt, endedTime: t.endedTime, audioBytes: t.audioBytes, muted: t.muted, volume: t.volume, pause: t.pause, load: t.load, paused: v?.paused, src: v?.getAttribute('src'), readyState: v?.readyState, blobsCreated: t.blobsCreated, blobsRevoked: t.blobsRevoked, fetches: t.fetches };
  });
  assert.deepEqual([...trace.blobsRevoked].sort(), [...trace.blobsCreated].sort(), 'every allocated video Blob URL is revoked exactly once');
  if (trace.firstFrame !== null) {
    assert.equal(trace.blobsCreated.length, 1, 'startup decodes one seekable Blob rather than the native unseekable route');
    assert.equal(trace.fetches.length, 1, 'the local MP4 is fetched once');
    assert.equal(trace.paused, true, 'cleanup pauses the actual media element');
    assert.equal(trace.src, null, 'cleanup clears the actual media source');
    assert.ok(trace.pause > 0 && trace.load > 0, 'cleanup aborts media decoding and requests');
    await page.waitForFunction(() => globalThis.__trace.video?.readyState === 0);
  }
  return trace;
}
function assertFullMovie(trace, description) {
  assert.ok(trace.firstVisibleTime >= 0 && trace.firstVisibleTime < .25, description + ': original opening is preserved');
  assert.ok(Math.abs(trace.duration - expected.duration) < .02, description + ': original movie duration is unchanged');
  if (expected.width) assert.deepEqual([trace.width, trace.height], [expected.width, expected.height], description + ': original video dimensions are unchanged');
  assert.ok(trace.endedAt !== null, description + ': natural ended event must happen before cleanup');
  assert.ok(trace.endedTime >= trace.duration - .02, description + ': playback reaches the end');
  assert.ok(trace.mediaTime >= trace.duration - .15 && trace.frames > 150, description + ': actual frames advance through the full movie');
  assert.ok(trace.removed >= trace.endedAt && trace.removed - trace.endedAt < 600, description + ': cleanup follows ended with a short fade');
  assert.ok(trace.endedAt - trace.firstVisibleFrame >= 6600, description + ': ready must not shorten normal-speed playback');
  assert.equal(trace.muted, false, description + ': original soundtrack is enabled');
  assert.equal(trace.volume, 1, description + ': source volume is preserved');
  assert.ok(trace.audioBytes > 0, description + ': the real AAC soundtrack is decoded');
}

try {
  // Match Electron's default policy; the audio-blocked fixture separately
  // exercises a browser policy that requires a trusted gesture for sound.
  browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const audioCheck = await browser.newPage();
  await audioCheck.goto(origin + '/audio-integrity');
  const signal = await audioCheck.evaluate(async mediaId => {
    const data = await (await fetch('/api/cyberdaddy/builtin?id=' + mediaId)).arrayBuffer();
    const pcm = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(data);
    let peak = 0, sum = 0, tail = 0, tailCount = 0;
    for (let c = 0; c < pcm.numberOfChannels; c++) {
      const samples = pcm.getChannelData(c);
      for (let i = 0; i < samples.length; i++) {
        peak = Math.max(peak, Math.abs(samples[i])); sum += samples[i] ** 2;
        if (i >= samples.length - .05 * pcm.sampleRate) { tail += samples[i] ** 2; tailCount++; }
      }
    }
    return { peak, rms: Math.sqrt(sum / (pcm.length * pcm.numberOfChannels)), tailRms: Math.sqrt(tail / tailCount), duration: pcm.duration };
  }, mediaId);
  // A decoder byte count alone also passes for an all-silent AAC stream.
  assert.ok(signal.peak > .05 && signal.rms > .005, 'the shipped soundtrack must contain actual non-silent audio samples');
  if (presetId === 'whalegirl') assert.ok(signal.tailRms < .002, 'the replacement sound ends gently before the complete intro finishes');
  console.log(presetId + ' real soundtrack PCM energy PASS', JSON.stringify(signal));
  await audioCheck.close();
  const ready = await fixture('ready');
  assert.equal(await ready.locator('[data-cyber-video-startup]').count(), 1, 'startup must survive the native BootPage handoff in its own overlay');
  await firstVisibleFrame(ready);
  assert.ok(await ready.evaluate(() => globalThis.__trace.firstVisibleTime < .25), 'the original intro must start at time zero, without skipping its opening');
  assert.deepEqual(await ready.locator('video').evaluate(v => ({muted:v.muted, volume:v.volume})), {muted:false, volume:1});
  await assertIconButton(ready.getByRole('button', { name: '跳过动画', exact: true }), '跳过动画');
  await assertIconButton(ready.getByRole('button', { name: '关闭启动声音', exact: true }), '关闭启动声音');
  assert.equal(await ready.locator('.cyber-boot-sound').getAttribute('aria-pressed'), 'true');
  await assertQuietFooter(ready);
  if (expected.fit) assert.equal(await ready.locator('video').evaluate(v => getComputedStyle(v).objectFit), expected.fit, 'the complete HUD frame remains visible');
  await mountWork(ready);
  assert.equal(await ready.locator('[data-cyber-video-startup]').count(), 1, 'fast ready must not remove video before the original movie ends');
  assert.equal(await ready.locator('#fixture-editor').innerText(), '初始化中的草稿', 'the real mount is not delayed');
  await ready.locator('#fixture-editor').focus(); await ready.keyboard.type('abc');
  await ready.keyboard.press('Enter');
  assert.equal(await ready.locator('[data-cyber-video-startup]').count(), 1, 'ordinary typing must not accidentally skip the intro');
  assert.equal(await ready.locator('#fixture-editor').innerText(), '初始化中的草稿', 'the covered editor must not receive blind typing');
  assert.equal(await ready.evaluate(() => globalThis.__sendAttempts), 0, 'Enter must not submit the covered native editor');
  assert.deepEqual(await ready.locator('#fixture-editor').evaluate(editor => [
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true })),
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })),
  ]), [true, true], 'Meta and Ctrl application shortcuts remain unblocked');
  await assertIconButton(ready.getByRole('button', { name: '跳过动画', exact: true }), '跳过动画');
  await assertQuietFooter(ready);
  await ready.waitForFunction(() => globalThis.__trace.video?.currentTime >= 3);
  assert.equal(await ready.locator('[data-cyber-video-startup]').count(), 1, 'the original 1.8-second cutoff must not return');
  if (process.env.CYBER_TEST_VIDEO_SCREENSHOT) await ready.screenshot({ path: process.env.CYBER_TEST_VIDEO_SCREENSHOT });
  const timing = await cleaned(ready);
  assertFullMovie(timing, 'fast native ready');
  await ready.locator('#fixture-editor').focus(); await ready.keyboard.press('Enter');
  assert.equal(await ready.evaluate(() => globalThis.__sendAttempts), 1, 'normal editor keyboard handling resumes after the intro');
  await ready.locator('#fixture-editor').fill('保留草稿');
  await ready.evaluate(() => document.querySelector('#root').append(document.createElement('aside')));
  assert.equal(await ready.locator('[data-cyber-video-startup]').count(), 0, 'partial UI changes must not replay startup');
  assert.equal(await ready.locator('#fixture-editor').innerText(), '保留草稿');
  console.log(presetId + ' video startup full original movie + fast ready + ordinary typing + unfocused document + no replay PASS', JSON.stringify(timing));
  await ready.close();

  // The original bug can occur before decoding, not only during a playing
  // video's handoff. Native readiness must not shorten a movie that is still
  // loading from the local route; the loading request itself remains bounded.
  const early = await fixture('early-ready');
  await mountWork(early);
  assert.equal(await early.locator('[data-cyber-video-startup]').count(), 1);
  await firstVisibleFrame(early);
  const earlyTrace = await cleaned(early);
  assertFullMovie(earlyTrace, 'ready before first decode');
  assert.equal(await early.locator('#fixture-editor').innerText(), '初始化中的草稿');
  console.log('video startup ready before delayed first decode PASS', JSON.stringify(earlyTrace)); await early.close();

  const native = await fixture('native-unseekable');
  await mountWork(native);
  await firstVisibleFrame(native);
  const nativeTrace = await cleaned(native);
  assertFullMovie(nativeTrace, 'native media transport');
  console.log('video startup complete native movie uses a released Blob PASS', JSON.stringify(nativeTrace)); await native.close();

  for (const action of ['skip', 'keyboard-skip', 'escape', 'failure', 'pagehide']) {
    const page = await fixture(action);
    await firstVisibleFrame(page);
    const before = await page.evaluate(() => performance.now());
    if (action === 'skip') await page.locator('.cyber-boot-skip').click();
    if (action === 'keyboard-skip') {
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.cyber-boot-skip').evaluate(el => el === document.activeElement), true, 'Tab directs focus to the visible skip button');
      await page.keyboard.press('Enter');
    }
    if (action === 'escape') await page.keyboard.press('Escape');
    if (action === 'failure') await page.locator('[data-dsh-boot-spinner]').evaluate(el => el.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Native failure: STARTUP_TEST_ERROR' })));
    if (action === 'pagehide') await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
    const trace = await cleaned(page, 500);
    assert.ok(trace.removed - before < 500, action + ' must not wait for the decorative timer');
    if (['skip', 'keyboard-skip', 'escape'].includes(action)) assert.equal(await page.locator('[data-dsh-boot-spinner]').count(), 1, 'skip keeps native loading state');
    if (action === 'failure') assert.equal(await page.getByText('Native failure: STARTUP_TEST_ERROR').isVisible(), true);
    console.log('video startup immediate ' + action + ' + resource release PASS'); await page.close();
  }

  for (const action of ['missing', 'blocked', 'slow', 'reduced']) {
    const page = await fixture(action);
    if (action === 'missing' || action === 'blocked') await page.waitForTimeout(150);
    await mountWork(page);
    const trace = await cleaned(page, action === 'slow' ? 3000 : 500);
    assert.equal(await page.locator('#fixture-editor').isVisible(), true, action + ' media must not delay a ready app');
    if (action === 'slow') {
      assert.equal(trace.firstFrame, null, 'the hanging request never needs to finish');
      assert.ok(trace.fetches.some(x => x.abortedWhilePending), 'decode timeout aborts the pending fetch');
    }
    if (action === 'reduced') assert.equal(await page.locator('video').count(), 0);
    console.log('video startup ' + action + ' media does not delay ready PASS'); await page.close();
  }

  const audio = await fixture('audio-blocked');
  await firstVisibleFrame(audio);
  assert.equal(await audio.locator('video').evaluate(v => v.muted), true, 'policy rejection falls back to a playing silent movie');
  await assertIconButton(audio.getByRole('button', { name: '开启启动声音', exact: true }), '开启启动声音');
  assert.equal(await audio.locator('.cyber-boot-sound').getAttribute('aria-pressed'), 'false');
  await assertQuietFooter(audio);
  await audio.getByRole('button', {name:'开启启动声音'}).click();
  await audio.waitForFunction(() => {const v=document.querySelector('video');return !v.muted && !v.paused && v.webkitAudioDecodedByteCount > 0;});
  await assertIconButton(audio.getByRole('button', { name: '关闭启动声音', exact: true }), '关闭启动声音');
  assert.equal(await audio.locator('.cyber-boot-sound').getAttribute('aria-pressed'), 'true');
  const soundTime = await audio.locator('video').evaluate(v => v.currentTime);
  await audio.getByRole('button', {name:'关闭启动声音'}).click();
  assert.equal(await audio.locator('video').evaluate(v => v.muted), true);
  await assertIconButton(audio.getByRole('button', { name: '开启启动声音', exact: true }), '开启启动声音');
  assert.equal(await audio.locator('.cyber-boot-sound').getAttribute('aria-pressed'), 'false');
  await audio.keyboard.press('Tab');
  assert.equal(await audio.locator('.cyber-boot-skip').evaluate(el => el===document.activeElement), true);
  await audio.keyboard.press('Shift+Tab');
  assert.equal(await audio.locator('.cyber-boot-sound').evaluate(el => el===document.activeElement), true);
  await audio.keyboard.press('Enter');
  assert.equal(await audio.locator('video').evaluate(v => v.muted), false, 'keyboard enables sound');
  assert.equal(await audio.locator('.cyber-boot-sound').getAttribute('aria-pressed'), 'true');
  assert.ok(await audio.locator('video').evaluate(v => v.currentTime) >= soundTime, 'sound toggling does not restart the movie');
  await audio.evaluate(() => {globalThis.__visibility='hidden';document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await audio.locator('video').evaluate(v => v.paused), true, 'hidden window pauses audio and video');
  await audio.evaluate(() => {globalThis.__visibility='visible';document.dispatchEvent(new Event('visibilitychange'));});
  await audio.waitForFunction(() => !document.querySelector('video').paused);
  await audio.locator('.cyber-boot-skip').click();
  await cleaned(audio, 500);
  console.log('video startup sound policy fallback, trusted unmute, sound toggle, keyboard, hidden pause and skip cleanup PASS');
  await audio.close();

  for (const action of ['skip', 'pagehide']) {
    const page = await fixture('slow-' + action);
    await page.waitForFunction(() => globalThis.__trace.fetches.some(x => x.pending));
    if (action === 'skip') await page.locator('.cyber-boot-skip').click();
    else await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
    const trace = await cleaned(page, 500);
    assert.ok(trace.fetches.some(x => x.abortedWhilePending), action + ' aborts an in-flight MP4 fetch');
    assert.equal(trace.blobsCreated.length, 0, 'a cancelled request must not create an orphaned Blob');
    await page.waitForFunction(() => globalThis.__trace.fetches.every(x => !x.pending));
    assert.equal(await page.locator('[data-dsh-boot-spinner]').count(), 1);
    console.log('video startup pending fetch abort on ' + action + ' PASS'); await page.close();
  }

  const pending = await fixture('pending-initialization');
  await firstVisibleFrame(pending);
  const pendingTrace = await cleaned(pending);
  assertFullMovie(pendingTrace, 'initialization still pending');
  assert.equal(await pending.locator('[data-dsh-boot-spinner]').count(), 1, 'after the whole movie the real loading state remains visible');
  console.log('video startup naturally ended movie preserves pending native loading PASS', JSON.stringify(pendingTrace)); await pending.close();

  const stalled = await fixture('stalled');
  await firstVisibleFrame(stalled);
  await stalled.locator('video').evaluate(v => v.pause());
  const stalledTrace = await cleaned(stalled, 16500);
  assert.equal(stalledTrace.endedAt, null, 'the paused movie never produces a false natural completion');
  assert.ok(stalledTrace.removed - stalledTrace.firstVisibleFrame >= 13500 && stalledTrace.removed - stalledTrace.firstVisibleFrame < 16500, 'a stuck decoder has a finite watchdog with ample headroom for the original movie');
  assert.equal(await stalled.locator('[data-dsh-boot-spinner]').count(), 1);
  console.log('video startup stalled playback watchdog preserves real loading PASS', JSON.stringify(stalledTrace)); await stalled.close();

  const missingPending = await fixture('missing-pending');
  await cleaned(missingPending);
  assert.equal(await missingPending.locator('[data-dsh-boot-spinner]').count(),1);
  assert.ok(await missingPending.evaluate(()=>globalThis.__rapidTimers<25),'failed media must not spin a 1ms polling loop during slow native initialization');
  console.log('video startup missing media + pending initialization stays bounded and quiet PASS');await missingPending.close();

  const hidden = await fixture('visibility', { hidden: true });
  await mountWork(hidden);
  await hidden.waitForTimeout(400);
  assert.equal(await hidden.locator('[data-cyber-video-startup]').count(), 1, 'a hidden document must not spend its visible presentation before being shown');
  await hidden.evaluate(() => { globalThis.__visibility = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await firstVisibleFrame(hidden);
  const visibleTrace = await cleaned(hidden);
  assertFullMovie(visibleTrace, 'initially hidden window');
  console.log('video startup controlled visibility transition PASS', JSON.stringify(visibleTrace)); await hidden.close();

  const fetchingHidden = await fixture('early-ready', { hidden: true });
  await mountWork(fetchingHidden);
  await fetchingHidden.waitForTimeout(50);
  assert.ok(await fetchingHidden.evaluate(() => globalThis.__trace.fetches.some(x => x.pending)), 'the visibility change happens before the delayed local movie arrives');
  await fetchingHidden.evaluate(() => { globalThis.__visibility = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await firstVisibleFrame(fetchingHidden);
  const fetchedTrace = await cleaned(fetchingHidden);
  assertFullMovie(fetchedTrace, 'window shown during Blob fetch');
  console.log('video startup visible while Blob source is pending still plays the complete movie PASS', JSON.stringify(fetchedTrace)); await fetchingHidden.close();
} finally {
  await browser?.close();
  for (const timer of timers) clearTimeout(timer);
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
