import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { _electron } from 'playwright';
import { Store } from '../desktop/settings.mjs';
import { root } from '../scripts/paths.mjs';

// An original static fixture, imported through the same validation and storage
// path as a user's file. Its transparent corners and non-square canvas exercise
// both alpha pixels and object-fit letterboxing in the actual pet renderer.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="200" viewBox="0 0 240 200">
  <defs><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffba5a"/></linearGradient></defs>
  <path d="M120 17 Q125 17 129 27 L147 65 L190 72 Q204 75 194 86 L162 117 L170 160 Q173 175 159 168 L120 147 L81 168 Q67 175 70 160 L78 117 L46 86 Q36 75 50 72 L93 65 L111 27 Q115 17 120 17Z" fill="url(#gold)" stroke="#9e6948" stroke-width="5" stroke-linejoin="round"/>
  <path d="M115 36 L102 70 L69 77" fill="none" stroke="#fff4cf" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="102" cy="99" rx="6" ry="8" fill="#4c4b63"/><ellipse cx="138" cy="99" rx="6" ry="8" fill="#4c4b63"/>
  <circle cx="104" cy="96" r="2" fill="#ffffff"/><circle cx="140" cy="96" r="2" fill="#ffffff"/>
  <ellipse cx="87" cy="113" rx="10" ry="5" fill="#f19582" fill-opacity="0.7"/><ellipse cx="153" cy="113" rx="10" ry="5" fill="#f19582" fill-opacity="0.7"/>
  <path d="M111 118 Q120 129 129 118" fill="none" stroke="#73504c" stroke-width="4" stroke-linecap="round"/>
  <path d="M194 25 L197 34 L206 37 L197 40 L194 49 L191 40 L182 37 L191 34Z" fill="#84c4da"/>
  <circle cx="44" cy="143" r="4" fill="#a5cbd9"/>
</svg>`;
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const data = mkdtempSync(join(tmpdir(), 'custom-pet-store-'));
const store = new Store(data);
const preset = store.addPreset({ kind: 'pet', name: '原创星星伙伴', image: { type: 'image/svg+xml', dataUrl } }).custom.pet[0];
store.update({ enabled: true, pet: { enabled: true, id: preset.id, size: 320, paused: true } });
const require = createRequire(join(root, 'package.json'));
const env = { ...process.env, CYBER_PET_DATA_DIR: data };
delete env.ELECTRON_RUN_AS_NODE;
const screenshot = join(root, 'docs/screenshots/custom-pet-star.png');
const app = await _electron.launch({ executablePath: require('electron'), args: [join(root, 'desktop/pet-main.mjs'), '--standalone'], env });
const child = app.process();
let page, processIds = [child.pid];

async function until(check, message, timeout = 5000) {
  const deadline = Date.now() + timeout;
  do {
    if (await check()) return;
    await delay(25);
  } while (Date.now() < deadline);
  assert.fail(message);
}
function alive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

try {
  page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('#creature canvas.pet-custom-frozen').waitFor({ state: 'visible' });
  assert.deepEqual(await page.locator('#creature img').evaluate(image => ({ width: image.naturalWidth, height: image.naturalHeight, complete: image.complete })), { width: 240, height: 200, complete: true });
  assert.equal(await page.locator('#creature svg').count(), 0, 'imported SVG stays a passive image');
  assert.equal(await page.evaluate(id => window.cyberDressup.asset(id), preset.id), dataUrl, 'real asset IPC returns the registered file bytes');
  assert.equal((await page.evaluate(() => window.cyberDressup.get())).pet.id, preset.id);
  assert.equal((await app.windows()).length, 1, 'only the isolated pet window exists');
  assert.deepEqual(await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0];
    return { top: window.isAlwaysOnTop(), focusable: window.isFocusable() };
  }), { top: true, focusable: false });

  // Observe real hit messages without replacing handlers, asset transport,
  // settings, or the native hit handler. Input targets this renderer via CDP.
  await app.evaluate(({ ipcMain }) => {
    globalThis.__customPetHits = [];
    ipcMain.on('cyber:hit', (_event, active) => globalThis.__customPetHits.push(active));
  });
  for (const [x, y, expected, region] of [[160, 10, false, 'letterbox'], [16, 160, false, 'transparent pixel'], [160, 160, true, 'star body']]) {
    await app.evaluate(() => { globalThis.__customPetHits = []; });
    await page.mouse.move(x, y);
    await until(() => app.evaluate(() => globalThis.__customPetHits.length > 0), `no renderer hit result for ${region}`);
    assert.equal(await app.evaluate(() => globalThis.__customPetHits.at(-1)), expected, region);
  }
  console.log('real Store → asset IPC → passive SVG and transparent alpha hits: PASS');

  const before = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getBounds());
  await page.mouse.move(160, 160);
  await page.mouse.down();
  await until(() => page.locator('body').evaluate(body => body.classList.contains('dragging')), 'renderer did not start a drag');
  await page.mouse.move(130, 140);
  await until(async () => {
    const bounds = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getBounds());
    return bounds.x !== before.x || bounds.y !== before.y;
  }, 'real drag IPC did not move the native window');
  await page.mouse.up();
  const moved = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getBounds());
  await until(() => {
    const position = JSON.parse(readFileSync(join(data, 'appearance.json'), 'utf8')).pet.position;
    return position?.x === moved.x && position?.y === moved.y;
  }, 'drag position was not persisted');
  assert.equal(await page.locator('body').evaluate(body => body.classList.contains('dragging')), false);

  // File-watcher propagation is real: no synthetic cyber:change messages.
  store.update({ pet: { paused: false } });
  await page.locator('#creature img.pet-custom-image').waitFor({ state: 'visible' });
  const firstTransform = await page.locator('#creature').evaluate(element => getComputedStyle(element).transform);
  await until(() => page.locator('#creature').evaluate((element, previous) => getComputedStyle(element).transform !== previous, firstTransform), 'idle feedback did not resume');
  mkdirSync(join(root, 'docs/screenshots'), { recursive: true });
  await page.screenshot({ path: screenshot, omitBackground: true, animations: 'disabled' });
  store.update({ pet: { paused: true } });
  await page.locator('#creature canvas.pet-custom-frozen').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#creature img').isVisible(), false);
  const frozen = await page.locator('#creature canvas').evaluate(canvas => canvas.toDataURL());
  await delay(150);
  assert.equal(await page.locator('#creature canvas').evaluate(canvas => canvas.toDataURL()), frozen, 'paused frame stays frozen');
  console.log('native drag, persisted position, pause/resume and isolated screenshot: PASS');

  store.removePreset({ kind: 'pet', id: preset.id });
  await page.locator('#creature canvas[data-creature="whalegirl"]').waitFor();
  assert.equal(await page.locator('#creature img').count(), 0);
  assert.equal((await page.evaluate(() => window.cyberDressup.get())).pet.id, 'whalegirl');
  await assert.rejects(() => page.evaluate(id => window.cyberDressup.asset(id), preset.id), /自定义素材不存在/);
  assert.equal(existsSync(join(data, preset.asset)), false);
  assert.deepEqual(errors, []);
  processIds = await app.evaluate(({ app }) => app.getAppMetrics().map(metric => metric.pid));
  assert.ok(processIds.includes(child.pid));
  console.log('real catalog removal → whalegirl fallback and revoked asset access: PASS');
} finally {
  const exited = new Promise((resolve, reject) => {
    if (child.exitCode !== null) { resolve(child.exitCode); return; }
    const timer = setTimeout(() => reject(new Error('isolated pet did not exit within 5 seconds')), 5000);
    child.once('exit', code => { clearTimeout(timer); resolve(code); });
  });
  try {
    // Playwright's main-process debugger otherwise keeps Electron 44 alive.
    await app.evaluate(() => { const inspector = process.getBuiltinModule('node:inspector'); setTimeout(() => inspector.close(), 0); }).catch(() => {});
    if (page && !page.isClosed()) await page.evaluate(() => { void window.cyberDressup.action('quit').catch(() => {}); }).catch(() => {});
    assert.equal(await exited, 0, 'isolated pet quits normally');
    await until(() => processIds.every(pid => !alive(pid)), 'isolated Electron processes remain after exit');
    assert.equal(existsSync(join(data, 'pet.pid')), false, 'pid marker removed on quit');
    console.log('quit exit 0; no isolated Electron processes or pid marker remain: PASS');
  } catch (error) {
    // This handle is exclusively the process launched above, never a user's app.
    if (child.exitCode === null) child.kill('SIGKILL');
    throw error;
  } finally {
    if (child.exitCode !== null) rmSync(data, { recursive: true, force: true });
  }
}
console.log(`screenshot: ${screenshot}`);
