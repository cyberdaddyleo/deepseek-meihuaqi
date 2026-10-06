// Run the shared real native wallpaper/video regression against Cyber Dad.
process.env.CYBER_TEST_NATIVE_PRESET = 'cyberdad';
await import('./whalegirl-native.mjs');
