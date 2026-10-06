// Exercise the complete startup lifecycle with the supplied Geek HUD MP4/audio.
process.env.CYBER_TEST_VIDEO_PRESET = 'geek';
await import('./video-startup.mjs');
