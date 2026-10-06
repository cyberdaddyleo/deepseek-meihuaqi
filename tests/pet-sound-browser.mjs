import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// Render into an in-memory buffer; this test never opens an audio device or
// makes the user's computer play the click sound.
const source=await readFile(new URL('../src/pet-sound.mjs',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 const result=await page.evaluate(async source=>{
  const {PetSound}=await import('data:text/javascript;base64,'+btoa(source));
  const rate=48000,context=new OfflineAudioContext(1,rate/2,rate);
  // Offline rendering runs faster than wall time. Keep graph scheduling ahead
  // of startRendering instead of resuming its audio thread mid-construction.
  const graph={state:'running',currentTime:0,destination:context.destination,createGain:()=>context.createGain(),createOscillator:()=>context.createOscillator()};
  const sound=new PetSound({createContext:()=>graph,now:()=>1000});
  const accepted=sound.play();
  const buffer=await context.startRendering(),samples=buffer.getChannelData(0);
  let peak=0,energy=0,tailPeak=0;
  for(let i=0;i<samples.length;i++){
   peak=Math.max(peak,Math.abs(samples[i]));energy+=samples[i]**2;
   if(i>=rate*.24)tailPeak=Math.max(tailPeak,Math.abs(samples[i]));
  }
  sound.dispose();
  return {accepted,peak,energy,tailPeak,finite:samples.every(Number.isFinite)};
 },source);
 assert.equal(result.accepted,true);
 assert.equal(result.finite,true);
 assert.ok(result.energy>0,'real Web Audio renders a non-silent click');
 assert.ok(result.peak>0&&result.peak<=.044,'the combined waveform stays below the gain cap');
 assert.equal(result.tailPeak,0,'the click ends before 240 ms with no trailing audio');
 console.log('offline Web Audio synthesis PASS',result);
} finally {
 await browser.close();
}
