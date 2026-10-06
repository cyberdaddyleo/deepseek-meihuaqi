import test from 'node:test';
import assert from 'node:assert/strict';
import { setWallpaperAppearance, wallpaperTokenOverrides } from '../src/wallpaper-theme.mjs';
import { whalegirlTokenOverrides } from '../src/whalegirl-theme.mjs';

function documentStub() {
  const attrs = new Map([['data-theme', 'dark']]);
  return { documentElement: {
    getAttribute: (name) => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: (name) => attrs.delete(name),
  } };
}

test('wallpaper transitions remove old styling on plain themes and disable', () => {
  const doc = documentStub(), root = doc.documentElement;
  setWallpaperAppearance('whalegirl', doc);
  setWallpaperAppearance('cyberdad', doc);
  assert.equal(root.getAttribute('data-cyber-theme'), 'cyberdad');
  setWallpaperAppearance('forest', doc);
  assert.equal(root.getAttribute('data-cyber-theme'), null);
  setWallpaperAppearance('cyberdad', doc);
  setWallpaperAppearance(null, doc);
  assert.equal(root.getAttribute('data-cyber-theme'), null);
  assert.equal(root.getAttribute('data-theme'), 'dark', 'upstream attributes are retained');
});

test('cleanup only removes a wallpaper marker owned by this plugin', () => {
  const doc = documentStub(), root = doc.documentElement;
  root.setAttribute('data-cyber-theme', 'another-plugin');
  setWallpaperAppearance(null, doc);
  assert.equal(root.getAttribute('data-cyber-theme'), 'another-plugin');
});

test('new wallpaper tokens remain isolated from whalegirl and ordinary themes', () => {
  assert.strictEqual(wallpaperTokenOverrides('whalegirl'), whalegirlTokenOverrides);
  const cyberdad = wallpaperTokenOverrides('cyberdad');
  assert.notEqual(cyberdad['--dsw-specific-input-major'], whalegirlTokenOverrides['--dsw-specific-input-major']);
  for (const id of ['default', 'ice', 'forest', 'night', 'custom-test', null]) {
    assert.deepEqual(wallpaperTokenOverrides(id), {}, `${id} retains only its own base tokens`);
  }
});
