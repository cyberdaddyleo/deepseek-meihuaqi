import test from 'node:test';
import assert from 'node:assert/strict';
import { themes, defaults, themeTokens } from '../src/presets.mjs';
import { builtinAssetId } from '../src/catalog.mjs';
import { normalizeSettings } from '../src/settings-model.mjs';
import { setWallpaperAppearance, wallpaperTokenOverrides } from '../src/wallpaper-theme.mjs';
import { geekTokenOverrides } from '../src/geek-theme.mjs';

function documentStub() {
  const attrs = new Map([['data-theme', 'dark']]);
  return { documentElement: {
    getAttribute: name => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: name => attrs.delete(name),
  } };
}

test('geek appearance changes do not bind the splash and pet choices together', () => {
  const pet = { ...defaults.pet, id: 'cat', enabled: true, size: 120, position: { x: 32, y: 45 } };
  const skinOnly = normalizeSettings({ ...defaults, theme: 'geek', pet });
  assert.equal(skinOnly.theme, 'geek');
  assert.equal(skinOnly.splash, defaults.splash);
  assert.deepEqual(skinOnly.pet, pet);
  const videoOnly = normalizeSettings({ ...skinOnly, theme: 'forest', splash: 'geek' });
  assert.equal(videoOnly.theme, 'forest');
  assert.equal(videoOnly.splash, 'geek');
  assert.deepEqual(videoOnly.pet, pet);
  assert.equal(normalizeSettings({}).theme, 'whalegirl', 'adding a preset does not replace existing defaults');
});

test('geek wallpaper is removed on plain themes and disable, without leaking its tokens', () => {
  const doc = documentStub(), root = doc.documentElement;
  for (const id of ['whalegirl', 'cyberdad', 'ice', 'forest', 'night', 'default', null]) {
    setWallpaperAppearance('geek', doc);
    assert.equal(root.getAttribute('data-cyber-theme'), 'geek');
    setWallpaperAppearance(id, doc);
    assert.equal(root.getAttribute('data-cyber-theme'), ['whalegirl', 'cyberdad'].includes(id) ? id : null);
    assert.notStrictEqual(wallpaperTokenOverrides(id), geekTokenOverrides);
  }
  assert.equal(root.getAttribute('data-theme'), 'dark');
  assert.strictEqual(wallpaperTokenOverrides('geek'), geekTokenOverrides);
  for (const key of Object.keys(geekTokenOverrides)) {
    assert.doesNotMatch(key, /state-(?:success|error|warn)|syntax/, 'semantic status and syntax colors remain upstream-owned');
  }
});

function luminance(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

test('geek message, code, input and menu text remain readable on their actual token colors', () => {
  const palette = themes.find(t => t.id === 'geek').palette;
  const tokens = { ...themeTokens(palette), ...geekTokenOverrides };
  for (const background of ['--dsw-alias-bg-base', '--dsw-specific-input-major', '--dsw-specific-bubble', '--dsw-alias-markdown-code-block', '--dsw-specific-menu']) {
    for (const text of ['--dsw-alias-label-primary', '--dsw-alias-label-secondary']) {
      assert.ok(contrast(tokens[text], tokens[background]) >= 4.5, `${text} on ${background} meets normal-text contrast`);
    }
  }
  assert.ok(contrast(palette.accent, palette.surface) >= 4.5, 'links remain readable');
});

test('geek media resolver accepts only the two published filenames', () => {
  assert.equal(builtinAssetId('assets/geek-startup.mp4'), 'geek-startup');
  assert.equal(builtinAssetId('assets/geek-wallpaper.png'), 'geek-wallpaper');
  for (const path of ['assets/geek-atlas.png', 'assets/geek-reference.png', 'assets/geek-startup.mp4?x=1', 'assets/../assets/geek-wallpaper.png', '../assets/geek-wallpaper.png']) {
    assert.equal(builtinAssetId(path), null);
  }
});
