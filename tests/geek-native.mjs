// Run the shared regression against the real native Geek wallpaper and movie.
process.env.CYBER_TEST_NATIVE_PRESET = 'geek';
await import('./whalegirl-native.mjs');
