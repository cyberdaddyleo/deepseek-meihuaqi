import { pets, defaults } from "../src/presets.mjs";
import { catalogFor } from "../src/catalog.mjs";
import { fallbackSvg } from "../src/asset-fallback.mjs";
import { alphaHit, localImagePoint } from "../src/image-hit.mjs";
import { PetBehavior } from "../src/pet-behavior.mjs";
import { PetSound } from "../src/pet-sound.mjs";

const api = window.cyberDressup, creature = document.querySelector("#creature");
const behavior = new PetBehavior({ now: performance.now() });
const sound = new PetSound();
let key = "", serial = 0, dragging = false, start, pointer, lastPointer;
let behaviorTimer, behaviorPaused = false, paintedRevision = -1;
let current, controller, latestState, disposed = false;

function paintBehavior(value = behavior.snapshot(), force = false) {
  if (disposed || (!force && paintedRevision === value.revision)) return;
  const body = document.body;
  // Consecutive responses can use the same animation. Restart only on a real
  // state change, never on settings polling or on each timer tick.
  if (body.dataset.action === value.action && value.action !== 'idle') {
    body.removeAttribute('data-action'); body.removeAttribute('data-effect');
    void creature.offsetWidth;
  }
  paintedRevision = value.revision;
  body.dataset.mood = value.mood; body.dataset.action = value.action; body.dataset.effect = value.effect;
  const caption = document.querySelector('#pet-caption');
  if (caption) caption.textContent = value.message;
  creature.setAttribute('aria-label', `${value.mood === 'sleeping' ? '睡觉中，点击叫醒' : value.mood === 'drowsy' ? '有点困了，点击互动' : '点击互动，拖动移动，右键打开菜单'}${value.message ? ' · ' + value.message : ''}`);
  freezeImage();
  paintSprite(value);
}

function paintSprite(value = behavior.snapshot()) {
  if (current?.kind !== 'sprite') return;
  const frame = value.mood === 'sleeping' ? 5 : ({yawn:1,eat:2,work:3,crawl:4,walk:4,drag:7,love:6,hop:6,spin:6,wave:6,dance:6,wake:6,surprise:6})[value.action] ?? 0;
  if (frame === current.frame) return;
  const {image,canvas,columns,rows} = current;
  const w=image.naturalWidth/columns,h=image.naturalHeight/rows;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(image,(frame%columns)*w,Math.floor(frame/columns)*h,w,h,0,0,canvas.width,canvas.height);
  current.mask={width:canvas.width,height:canvas.height,data:ctx.getImageData(0,0,canvas.width,canvas.height).data};
  current.frame=frame; canvas.dataset.frame=String(frame);
}

function scheduleBehavior() {
  clearInterval(behaviorTimer); behaviorTimer = undefined;
  if (disposed || behaviorPaused || document.hidden) return;
  // State scheduling is 2 Hz; CSS draws the motion. No per-frame JS loop.
  behaviorTimer = setInterval(() => {
    paintBehavior(behavior.tick(performance.now()));
    if (lastPointer && !dragging) hitTest(lastPointer);
  }, 500);
}

function interact(kind) {
  if (disposed) return;
  paintBehavior(behavior.interact(kind, performance.now()));
}

function release() {
  sound.stop();
  if (current?.kind === 'sprite') {
    current.image.removeAttribute('src');
    current.canvas.width = current.canvas.height = 0;
  }
  if (current?.kind === 'custom') {
    current.image.removeAttribute('src');
    current.frozen.width = current.frozen.height = 0;
  }
  current = undefined;
  creature.replaceChildren();
  api.hit(false);
}

function loadImage(src, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const clean = () => { image.onload = image.onerror = null; signal.removeEventListener('abort', abort); clearTimeout(timer); };
    const abort = () => { clean(); image.removeAttribute('src'); reject(new DOMException('Image load cancelled', 'AbortError')); };
    const timer = setTimeout(() => { clean(); image.removeAttribute('src'); reject(new Error('图片加载超时')); }, 10000);
    image.onload = () => { clean(); resolve(image); };
    image.onerror = () => { clean(); image.removeAttribute('src'); reject(new Error('图片无法解码')); };
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) { abort(); return; }
    image.src = src;
  });
}

function snapshot(image, canvas) {
  const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
  if (!Number.isFinite(scale) || !image.naturalWidth || !image.naturalHeight) throw new Error('图片尺寸无效');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, sourceWidth: image.naturalWidth, sourceHeight: image.naturalHeight, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
}

function sizeFrozen() {
  if (current?.kind !== 'custom') return;
  const { image, frozen } = current;
  // The capped canvas can have a rounded aspect ratio. Its displayed box must
  // retain the original image ratio, including very narrow or tall images.
  const scale = Math.min(creature.clientWidth / image.naturalWidth, creature.clientHeight / image.naturalHeight);
  frozen.style.width = `${image.naturalWidth * scale}px`;
  frozen.style.height = `${image.naturalHeight * scale}px`;
}

function freezeImage() {
  // GIF/WebP cannot be paused with CSS. Sleeping pets also hold a still image
  // while the outer body breathes, so an imported GIF does not keep dancing.
  const frozen = behaviorPaused || behavior.snapshot().mood === 'sleeping';
  if (current?.kind !== 'custom') return;
  current.frozen.setAttribute('aria-label',current.image.alt+(behaviorPaused?'（暂停）':'（睡觉中）'));
  if (current.paused === frozen) return;
  current.mask = frozen ? snapshot(current.image, current.frozen) : current.initialMask;
  current.image.hidden = frozen;
  current.frozen.hidden = !frozen;
  current.paused = frozen;
}

function applyPause(paused) {
  if (paused) sound.stop();
  document.body.classList.toggle('paused', paused);
  if (behaviorPaused !== paused) {
    behaviorPaused = paused;
    paintBehavior(behavior.setPaused(paused, performance.now()));
    // Movement can start while paused. Reconcile a still-held physical drag
    // when resuming, otherwise the logical pet could fall asleep in our hand.
    if (!paused && dragging && pointer?.moved) interact('drag-start');
    scheduleBehavior();
  }
  freezeImage();
}

async function bundledSvg(asset, signal) {
  for (const path of new Set([asset, 'assets/whale.svg'])) {
    try {
      const response = await fetch('../' + path, { signal });
      if (!response.ok) throw new Error('资源未找到');
      const doc = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      if (doc.documentElement.localName !== 'svg' || doc.querySelector('parsererror')) throw new Error('桌宠资源不是有效 SVG');
      return document.importNode(doc.documentElement, true);
    } catch (error) { if (signal.aborted) throw error; console.warn(error.message); }
  }
  return new DOMParser().parseFromString(fallbackSvg, 'image/svg+xml').documentElement;
}

async function render(state) {
  if (disposed) return;
  latestState = state;
  sound.setEnabled(state.pet.sound);
  const selected = catalogFor(state, 'pet').find(p => p.id === state.pet.id) || pets.find(p => p.id === defaults.pet.id);
  const nextKey = `${selected.id}:${selected.asset}`;
  document.body.classList.toggle('cat', selected.id === 'cat');
  applyPause(state.pet.paused);
  if (key === nextKey) return;
  cancelPointer();
  key = nextKey;
  document.body.dataset.pet = selected.custom ? 'custom' : selected.id;
  paintBehavior(behavior.setPet(selected.id, performance.now()));
  scheduleBehavior();
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal, seq = ++serial;
  release();
  try {
    if (selected.custom) {
      const src = await api.asset(selected.id);
      if (signal.aborted) return;
      if (typeof src !== 'string' || !/^data:image\/(?:png|jpeg|webp|gif|svg\+xml)[;,]/i.test(src)) throw new Error('图片资源格式不受支持');
      const image = await loadImage(src, signal);
      if (seq !== serial || disposed) { image.removeAttribute('src'); return; }
      const frozen = document.createElement('canvas');
      let initialMask;
      try { initialMask = snapshot(image, frozen); }
      catch (error) { image.removeAttribute('src'); frozen.width = frozen.height = 0; throw error; }
      image.className = 'pet-custom-image'; image.alt = selected.name; image.draggable = false;
      image.dataset.creature = selected.id;
      image.title = '动画图片的透明命中以载入帧为准；暂停显示当前帧快照。';
      frozen.className = 'pet-custom-frozen'; frozen.setAttribute('role', 'img'); frozen.setAttribute('aria-label', selected.name + '（暂停）'); frozen.hidden = true;
      current = { kind: 'custom', image, frozen, mask: initialMask, initialMask, paused: false };
      // User SVG remains a passive image; never insert its markup into this DOM.
      creature.replaceChildren(image, frozen);
      sizeFrozen();
      applyPause(latestState.pet.paused);
    } else if (selected.sprite) {
      const image = await loadImage('../' + selected.asset, signal);
      if (seq !== serial || disposed) { image.removeAttribute('src'); return; }
      const canvas=document.createElement('canvas');
      canvas.width=canvas.height=512;canvas.className='pet-sprite';
      canvas.dataset.creature=selected.id;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',selected.name);
      current={kind:'sprite',image,canvas,...selected.sprite,frame:-1};
      creature.replaceChildren(canvas);paintSprite();
    } else {
      const svg = await bundledSvg(selected.asset, signal);
      if (seq !== serial || disposed) return;
      current = { kind: 'builtin' }; creature.replaceChildren(svg);
    }
  } catch (error) {
    if (signal.aborted || seq !== serial || disposed) return;
    console.warn('桌宠资源加载失败，已使用内置小蓝鲸：' + error.message);
    release();
    const svg = await bundledSvg('assets/whale.svg', signal).catch(() => null);
    if (!svg || signal.aborted || seq !== serial || disposed) return;
    document.body.classList.remove('cat');
    document.body.dataset.pet = 'whale';
    paintBehavior(behavior.setPet('whale', performance.now()));
    current = { kind: 'builtin' }; creature.replaceChildren(svg);
  }
}

function isHit(e) {
  if (current?.kind === 'custom' || current?.kind === 'sprite') {
    const style = getComputedStyle(creature), origin = style.transformOrigin.split(' ').map(Number.parseFloat);
    const box = { width: creature.offsetWidth, height: creature.offsetHeight };
    const matrix = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
    const point = localImagePoint({ x: e.clientX, y: e.clientY }, creature.getBoundingClientRect(), box, matrix, { x: origin[0], y: origin[1] });
    return alphaHit(current.mask, box, point);
  }
  const node = document.elementFromPoint(e.clientX, e.clientY);
  return !!node?.closest('svg') && node.localName !== 'svg';
}
const hitTest = e => { lastPointer = {clientX:e.clientX,clientY:e.clientY}; if (!dragging) api.hit(isHit(e)); };
const offCursor = api.onCursor(hitTest);
window.addEventListener('resize', sizeFrozen);
window.addEventListener('mousemove', hitTest);
window.addEventListener('mouseleave', () => { lastPointer = undefined; if (!dragging) api.hit(false); });
creature.addEventListener('pointerdown', e => {
  if (e.button !== 0 || dragging || !isHit(e)) return;
  start = { x: e.screenX, y: e.screenY }; dragging = true;
  pointer = {id:e.pointerId,target:e.target,point:start,moved:false};
  document.body.classList.add('dragging'); e.target.setPointerCapture(e.pointerId);
  api.drag('start', start);
});
window.addEventListener('pointermove', e => {
  if (!dragging || e.pointerId !== pointer.id) return;
  pointer.point = {x:e.screenX,y:e.screenY};
  if (!pointer.moved && Math.hypot(e.screenX-start.x,e.screenY-start.y)>=5) {
    pointer.moved = true; interact('drag-start');
  }
  if (pointer.moved) api.drag('move', pointer.point);
});
window.addEventListener('pointerup', e => {
  if (!dragging || e.pointerId !== pointer.id) return;
  const previous=pointer; dragging=false;pointer=undefined;
  api.drag('end', previous.moved?{x:e.screenX,y:e.screenY}:start); document.body.classList.remove('dragging');
  if(previous.target.hasPointerCapture(previous.id))previous.target.releasePointerCapture(previous.id);
  interact(previous.moved?'drag-end':'click');
  if (e.isTrusted && !previous.moved) sound.play({enabled:latestState?.pet.sound,paused:behaviorPaused});
  hitTest(e);
});
function cancelPointer() {
  if (!dragging) return;
  const previous=pointer;dragging=false;pointer=undefined;document.body.classList.remove('dragging');
  api.drag('end',previous.moved?previous.point:start);interact('cancel');
  if(previous.target.hasPointerCapture(previous.id))previous.target.releasePointerCapture(previous.id);
}
window.addEventListener('pointercancel', cancelPointer);
window.addEventListener('lostpointercapture', cancelPointer);
window.addEventListener('contextmenu', e => { e.preventDefault(); if (isHit(e)) api.menu(); });
const offBehavior = api.onBehavior(kind => {
  if (behaviorPaused || dragging || !['walk','play','nap','wake','eat','work','yawn'].includes(kind)) return;
  interact(kind);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) sound.stop();
  if (!document.hidden && !disposed) paintBehavior(behavior.tick(performance.now()));
  scheduleBehavior();
});
let receivedChange = false;
const offChange = api.onChange(state => { receivedChange = true; void render(state); });
const initial = await api.get();
if (!receivedChange) void render(initial);
window.addEventListener('pagehide', () => { cancelPointer();disposed = true; controller?.abort(); clearInterval(behaviorTimer); offBehavior();offChange(); offCursor(); release(); sound.dispose(); }, { once: true });
