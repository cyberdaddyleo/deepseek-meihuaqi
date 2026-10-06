import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeSettings, clampBounds, Store } from "../desktop/settings.mjs";
import { pets, defaults } from "../src/presets.mjs";
import { catalogFor } from "../src/catalog.mjs";
import { fallbackSvg, fallbackData } from "../src/asset-fallback.mjs";

test('last-resort artwork stays a local whale without resurrecting the retired robot', () => {
  assert.match(fallbackSvg, /data-creature="whale"/);
  assert.doesNotMatch(fallbackSvg, /robot/);
  assert.equal(decodeURIComponent(fallbackData.split(',')[1]), fallbackSvg);
});

test('retired robot pet is absent from catalogs and old settings preserve independent choices', () => {
  assert.equal(pets.some(pet => pet.id === 'robot'), false);
  assert.equal(catalogFor({}, 'pet').some(pet => pet.id === 'robot'), false);
  const dir = mkdtempSync(join(tmpdir(), 'retired-pet-'));
  const old = {
    version: 1, enabled: false, theme: 'forest', splash: 'stars',
    pet: {id:'robot', enabled:true, paused:true, sound:false, size:105, position:{x:-240,y:180}},
  };
  writeFileSync(join(dir, 'appearance.json'), JSON.stringify(old));
  const expected = {...old, pet:{...old.pet, id:defaults.pet.id}};
  assert.deepEqual(normalizeSettings(old), expected);
  for (let restart = 0; restart < 2; restart++) {
    const {custom, ...actual} = new Store(dir).get();
    assert.deepEqual(actual, expected);
    assert.deepEqual(custom, {theme:[], splash:[], pet:[]});
  }
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'appearance.json'), 'utf8')), expected);
});

test("corrupt preset ids and sizes fall back, without dropping independent valid choices", () => {
  const s = normalizeSettings({
    theme: "forest",
    splash: "no-such-preset",
    pet: { id: "cat", size: Infinity, enabled: true },
  });
  assert.equal(s.theme, "forest");
  assert.equal(s.splash, "whalegirl");
  assert.equal(s.pet.id, "cat");
  assert.equal(s.pet.size, 120);
  assert.equal(s.pet.enabled, true);
});
test('small pet sizes persist independently and out-of-range values stay usable', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pet-size-'));
  const store = new Store(dir);
  store.update({theme:'forest',pet:{id:'cat',size:80,position:{x:100,y:200}}});
  const small = new Store(dir).get();
  assert.equal(small.pet.size,80);
  assert.equal(small.pet.id,'cat');assert.equal(small.theme,'forest');
  assert.deepEqual(small.pet.position,{x:100,y:200});
  assert.equal(store.update({pet:{size:-1}}).pet.size,80);
  assert.equal(store.update({pet:{size:500}}).pet.size,320);
  assert.equal(store.update({pet:{size:105}}).pet.size,105);
  store.reset();assert.equal(store.get().pet.size,120);
});
test("negative-coordinate displays stay usable; removed display returns pet fully into work area", () => {
  assert.deepEqual(
    clampBounds({ x: -1700, y: 100, width: 180, height: 180 }, [
      { x: -1920, y: 25, width: 1920, height: 1055 },
    ]),
    { x: -1700, y: 100, width: 180, height: 180 },
  );
  assert.deepEqual(
    clampBounds({ x: 4000, y: 2000, width: 180, height: 180 }, [
      { x: 0, y: 25, width: 1440, height: 875 },
    ]),
    { x: 1260, y: 720, width: 180, height: 180 },
  );
});
test("local settings survive restart; reset never deletes a neighboring Harness file", () => {
  const dir = mkdtempSync(join(tmpdir(), "dressup-"));
  writeFileSync(join(dir, "sessions.json"), "KEEP");
  const store = new Store(dir);
  store.update({
    theme: "night",
    splash: "forest",
    pet: { id: "cat", enabled: true, size: 240 },
  });
  assert.equal(new Store(dir).get().theme, "night");
  assert.equal(new Store(dir).get().pet.size, 240);
  store.reset();
  assert.equal(store.get().theme, "whalegirl");
  assert.equal(readFileSync(join(dir, "sessions.json"), "utf8"), "KEEP");
});
test("broken settings are kept as a backup before safe defaults are saved", () => {
  const dir = mkdtempSync(join(tmpdir(), "dressup-"));
  writeFileSync(join(dir, "appearance.json"), "{bad");
  const s = new Store(dir);
  assert.equal(s.get().theme, "whalegirl");
  assert.ok(readdirSync(dir).some((x) => x.startsWith("appearance.broken-")));
});
test('invalid schema metadata recovers, but a future numeric schema is preserved', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dressup-'));
  const file = join(dir, 'appearance.json');
  writeFileSync(file, JSON.stringify({ version: 'broken', theme: 'forest' }));
  assert.equal(new Store(dir).get().theme, 'forest');
  const future = JSON.stringify({ version: 2, theme: 'night' });
  writeFileSync(file, future);
  assert.throws(() => new Store(dir), /配置版本较新/);
  assert.equal(readFileSync(file, 'utf8'), future);
});

test('stale crash lock recovers and concurrent writers preserve independent fields', async () => {
  const {mkdirSync,utimesSync}=await import('node:fs');
  const {spawn}=await import('node:child_process');
  const dir=mkdtempSync(join(tmpdir(),'dressup-writers-'));
  const store=new Store(dir);mkdirSync(store.file+'.lock');
  const past=new Date(Date.now()-20000);utimesSync(store.file+'.lock',past,past);
  store.update({theme:'forest'});assert.equal(store.get().theme,'forest');
  const moduleUrl=new URL('../desktop/settings.mjs',import.meta.url).href;
  const run=body=>new Promise((resolve,reject)=>{
    const p=spawn(process.execPath,['--input-type=module','-e',`import {Store} from ${JSON.stringify(moduleUrl)};const s=new Store(${JSON.stringify(dir)});${body}`],{stdio:['ignore','ignore','pipe']});let error='';p.stderr.on('data',d=>error+=d);p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(error)));
  });
  await Promise.all([run("for(let i=0;i<30;i++)s.update({theme:'night'});"),run("for(let i=0;i<30;i++)s.update({pet:{size:240,position:{x:i,y:80}}});")]);
  assert.equal(store.get().theme,'night');assert.equal(store.get().pet.position.x,29);assert.equal(store.get().pet.size,240);
});
