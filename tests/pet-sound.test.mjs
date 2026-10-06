import test from 'node:test';
import assert from 'node:assert/strict';
import {PetSound} from '../src/pet-sound.mjs';

function fixture({resume}={}) {
 let now=1000,created=0;
 const oscillators=[],gains=[];
 const param=()=>({events:[],setValueAtTime(value,time){this.events.push({value,time});},exponentialRampToValueAtTime(value,time){this.events.push({value,time});},linearRampToValueAtTime(value,time){this.events.push({value,time});}});
 const context={currentTime:2,state:resume?'suspended':'running',destination:{},resume:resume||(()=>Promise.resolve()),close(){this.state='closed';return Promise.resolve();},createGain(){const node={gain:param(),connect(){},disconnect(){this.disconnected=true;}};gains.push(node);return node;},createOscillator(){const node={frequency:param(),connect(){},disconnect(){this.disconnected=true;},start(time){this.startAt=time;},stop(time){this.stopAt=time;},onended:null};oscillators.push(node);return node;}};
 const sound=new PetSound({createContext:()=>{created++;return context;},now:()=>now});
 return {sound,context,oscillators,gains,setNow:value=>now=value,get created(){return created;}};
}

test('sound stays lazy and silent when disabled or paused, and limits click rate to 200 ms',()=>{
 const f=fixture();assert.equal(f.created,0);assert.equal(f.sound.play({enabled:false}),false);assert.equal(f.sound.play({paused:true}),false);assert.equal(f.created,0);
 assert.equal(f.sound.play({enabled:true,paused:false}),true);assert.equal(f.created,1);
 f.setNow(1199);assert.equal(f.sound.play(),false);f.setNow(1200);assert.equal(f.sound.play(),true);assert.equal(f.created,1);
});

test('click synthesis uses short low-volume envelopes and releases ended nodes',()=>{
 const f=fixture();f.sound.play();assert.ok(f.oscillators.length>0);
 for(const node of f.oscillators){assert.ok(node.stopAt-node.startAt>0&&node.stopAt-node.startAt<=.35);assert.ok(node.frequency.events.every(e=>e.value>=80&&e.value<=2000));node.onended();assert.equal(node.disconnected,true);}
 const peak=f.gains.reduce((sum,g)=>sum+Math.max(...g.gain.events.map(e=>e.value)),0);assert.ok(peak>0&&peak<=.05,'combined oscillator gain remains softly capped');assert.ok(f.gains.every(g=>g.disconnected));
});

test('stop, mute and dispose release current voices and prevent later playback',()=>{
 const f=fixture();f.sound.play();f.sound.stop();assert.ok(f.oscillators.every(o=>o.disconnected));
 f.setNow(1300);f.sound.play();f.sound.setEnabled(false);assert.ok(f.oscillators.every(o=>o.disconnected));f.setNow(1600);assert.equal(f.sound.play({enabled:true}),false,'persistent mute is not bypassed by a caller');
 f.sound.setEnabled(true);assert.equal(f.sound.play(),true);f.sound.dispose();assert.equal(f.context.state,'closed');f.setNow(1900);assert.equal(f.sound.play(),false);f.sound.dispose();
});

test('unsupported audio and rejected resume are contained without leaking voices',async()=>{
 const unavailable=new PetSound({createContext:()=>{throw Error('unavailable');}});assert.equal(unavailable.play(),false);unavailable.dispose();
 const f=fixture({resume:()=>Promise.reject(Error('blocked'))});assert.equal(f.sound.play(),true);await Promise.resolve();await Promise.resolve();assert.ok(f.oscillators.every(o=>o.disconnected));f.sound.dispose();
});
