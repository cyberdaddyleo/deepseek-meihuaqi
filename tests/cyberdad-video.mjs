// Reuse the complete startup lifecycle suite with the supplied Cyber Dad MP4.
process.env.CYBER_TEST_VIDEO_PRESET = 'cyberdad';
await import('./video-startup.mjs');
