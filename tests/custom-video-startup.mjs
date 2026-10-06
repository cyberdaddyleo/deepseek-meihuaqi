// Real decoder regression using a time-scaled copy of a shipped MP4. The copy
// exists only in memory: published artwork/soundtracks are never rewritten.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../scripts/paths.mjs';

const id = 'custom-11111111-1111-4111-8111-111111111111';
const movie = Buffer.from(readFileSync(join(root, 'assets/whalegirl-startup.mp4')));
function stretchClocks(start = 0, end = movie.length) {
  for (let at = start; at + 8 <= end;) {
    const size = movie.readUInt32BE(at), kind = movie.toString('ascii', at + 4, at + 8);
    assert.ok(size >= 8 && at + size <= end, 'fixture MP4 boxes are valid');
    if (['moov', 'trak', 'mdia'].includes(kind)) stretchClocks(at + 8, at + size);
    if (kind === 'mvhd' || kind === 'mdhd') {
      const offset = at + (movie[at + 8] === 1 ? 28 : 20);
      movie.writeUInt32BE(Math.round(movie.readUInt32BE(offset) / 3), offset);
    }
    at += size;
  }
}
stretchClocks();
const html = '<!doctype html><body><main id="root"><div data-dsh-boot><div data-dsh-boot-spinner></div></div></main></body>';
const pending = new Set();
const requests = [];
const server = createServer((req, res) => {
  if (!req.url.startsWith('/api/')) { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
  requests.push(req.url);
  if (!req.url.includes('variant=video')) { res.setHeader('Content-Type', 'image/svg+xml'); res.end('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="30" fill="#8ac"/></svg>'); return; }
  const scenario = new URL(req.headers.referer).pathname.slice(1);
  if (scenario === 'missing') { res.writeHead(404); res.end(); return; }
  const send = () => { if (!res.destroyed) { res.setHeader('Content-Type', 'video/mp4'); res.end(movie); } };
  if (scenario.startsWith('slow')) {
    const timer = setTimeout(() => { pending.delete(timer); send(); }, 3500);
    pending.add(timer); res.on('close', () => { clearTimeout(timer); pending.delete(timer); });
  } else send();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
async function fixture(scenario) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/${scenario}`);
  await page.evaluate(id => {
    globalThis.__CYBERDADDY_APPEARANCE__ = { enabled: true, splash: id, custom: { splash: [{id, custom: true, name: '我的长视频', scene: 'whale', mediaType: 'video', videoFit: 'contain', duration: 21.3, asset: `custom-assets/${id}.mp4`, preview: `custom-assets/${id}.jpg`}] } };
    const trace = window.trace = { created: [], revoked: [], ended: false, duration: null, video: null, pending: false, aborted: false };
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL), fetcher = window.fetch.bind(window);
    URL.createObjectURL = value => { const url = create(value); trace.created.push(url); return url; };
    URL.revokeObjectURL = url => { trace.revoked.push(url); return revoke(url); };
    window.fetch = (url, options) => {
      trace.pending = true;
      options.signal?.addEventListener('abort', () => { if (trace.pending) trace.aborted = true; });
      return fetcher(url, options).finally(() => { trace.pending = false; });
    };
    new MutationObserver(() => {
      const video = document.querySelector('.cyber-boot-video');
      if (!video || trace.video) return;
      trace.video = video;
      video.addEventListener('ended', () => { trace.ended = true; trace.endedTime = video.currentTime; });
      video.addEventListener('loadedmetadata', () => { trace.duration = video.duration; });
    }).observe(document, {subtree:true, childList:true});
  }, id);
  await page.addScriptTag({path:join(root, 'lib/startup.js')});
  assert.equal(await page.locator('[data-cyber-video-startup]').count(), 1, 'an imported MP4 uses the native video startup pipeline');
  return page;
}
async function cleaned(page, timeout = 1000) {
  await page.waitForFunction(() => !document.querySelector('[data-cyber-video-startup]'), null, {timeout});
  const trace = await page.evaluate(() => ({...window.trace, video: undefined, src: window.trace.video?.getAttribute('src'), paused: window.trace.video?.paused}));
  assert.deepEqual(trace.revoked, trace.created, 'all video Blob URLs are released');
  assert.equal(trace.src, null); assert.equal(trace.paused, true);
  return trace;
}
try {
  browser = await chromium.launch({headless:true, args:['--autoplay-policy=no-user-gesture-required']});
  const long = await fixture('long');
  await long.waitForFunction(() => document.querySelector('video')?.currentTime > .1);
  await long.evaluate(() => { document.querySelector('#root').innerHTML = '<div contenteditable="true">原生草稿保留</div>'; });
  assert.ok(await long.evaluate(() => window.trace.duration > 20), 'decoder recognizes a genuinely longer-than-15-second movie');
  await long.waitForFunction(() => window.trace.video.currentTime > 16, null, {timeout:22000});
  assert.equal(await long.locator('[data-cyber-video-startup]').count(), 1, 'native readiness and the old 15-second watchdog do not cut the imported movie short');
  const completed = await cleaned(long, 12000);
  assert.equal(completed.ended, true); assert.ok(completed.endedTime > 20);
  assert.equal(await long.locator('[contenteditable]').innerText(), '原生草稿保留');
  await long.close(); console.log('custom video: full >20-second real decode, fast ready and release PASS');

  for (const action of ['skip','escape','native-error','media-error','stalled','slow-skip','slow-load','missing']) {
    const page = await fixture(action);
    if (!action.startsWith('slow') && action !== 'missing') await page.waitForFunction(() => document.querySelector('video')?.currentTime > .1);
    if (action === 'slow-load') { await page.waitForFunction(() => document.querySelector('video')?.currentTime > .1); await page.locator('.cyber-boot-skip').click(); }
    if (action === 'skip' || action === 'slow-skip') await page.locator('.cyber-boot-skip').click();
    if (action === 'escape') await page.keyboard.press('Escape');
    if (action === 'native-error') await page.evaluate(() => document.querySelector('[data-dsh-boot-spinner]').replaceWith(Object.assign(document.createElement('p'), {textContent:'原生错误：插件初始化失败'})));
    if (action === 'media-error') await page.locator('video').evaluate(v => v.dispatchEvent(new Event('error')));
    if (action === 'stalled') await page.locator('video').evaluate(v => v.pause());
    const trace = await cleaned(page, action === 'stalled' ? 11000 : action === 'missing' || action === 'media-error' ? 5000 : 1000);
    if (action === 'slow-skip') assert.equal(trace.aborted, true, 'skip aborts the pending local media fetch');
    if (action === 'native-error') assert.equal(await page.getByText('原生错误：插件初始化失败').isVisible(), true);
    else assert.equal(await page.locator('[data-dsh-boot-spinner]').count(), 1, 'decorative failure never replaces native loading');
    await page.close(); console.log(`custom video: ${action} and cleanup PASS`);
  }
  assert.ok(requests.some(url => url === `/api/cyberdaddy/asset?id=${id}&variant=video`));
} finally {
  await browser?.close(); for (const timer of pending) clearTimeout(timer);
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
