import test from 'node:test';
import assert from 'node:assert/strict';
import { PetBehavior } from '../src/pet-behavior.mjs';
const pet = (id='robot') => new PetBehavior({pet:id,now:0,random:()=>0});

test('starts quietly, enters drowsiness at 45 seconds, and sleeps at 120 seconds',()=>{
 const p=pet();assert.deepEqual(p.snapshot(),{mood:'awake',action:'idle',effect:'none',message:'',revision:0});
 assert.equal(p.tick(44999).mood,'awake');let s=p.tick(45000);assert.equal(s.mood,'drowsy');assert.equal(s.action,'yawn');
 assert.equal(p.tick(119999).mood,'drowsy');s=p.tick(120000);assert.equal(s.mood,'sleeping');assert.equal(s.action,'idle');assert.equal(s.effect,'sleep');
 const revision=s.revision;assert.deepEqual(p.tick(7*24*60*60*1000),s);assert.equal(p.snapshot().revision,revision);
});

test('the first autonomous action walks at 6–9 seconds, then walks alternate with cute actions every 10–16 seconds',()=>{
 const p=pet('cat');assert.equal(p.tick(5999).action,'idle');assert.equal(p.tick(6000).action,'walk');
 assert.equal(p.tick(11999).action,'walk');assert.equal(p.tick(12000).action,'idle');assert.equal(p.tick(15999).action,'idle');
 const firstCute=p.tick(16000).action;assert.ok(['look','stretch','wiggle','wave','dance','peek','shake'].includes(firstCute));
 assert.equal(p.tick(19500).action,'idle');assert.equal(p.tick(26000).action,'walk');assert.equal(p.tick(32000).action,'idle');
 const secondCute=p.tick(36000).action;assert.notEqual(secondCute,'walk');assert.notEqual(secondCute,firstCute);
 const slow=new PetBehavior({now:0,random:()=>1});assert.equal(slow.tick(8999).action,'idle');assert.equal(slow.tick(9000).action,'walk');assert.equal(slow.tick(15000).action,'idle');assert.equal(slow.tick(24999).action,'idle');assert.notEqual(slow.tick(25000).action,'idle');assert.notEqual(slow.snapshot().action,'walk');
});

test('drowsy random actions stay gentle; one click wakes before normal click feedback',()=>{
 const p=pet('cat');assert.equal(p.tick(45000).action,'yawn');assert.equal(p.tick(50000).action,'idle');
 assert.ok(['look','yawn'].includes(p.tick(57000).action));
 const wake=p.interact('click',60000);assert.equal(wake.mood,'awake');assert.equal(wake.action,'wake');
 const feedback=p.interact('click',60300);assert.notEqual(feedback.action,'wake');assert.equal(feedback.mood,'awake');
 assert.equal(p.tick(105299).mood,'awake');assert.equal(p.tick(105300).mood,'drowsy');
});

test('a click wakes a sleeping pet; an explicit menu wake responds even when already awake',()=>{
 const p=pet('whale');p.tick(120000);let s=p.interact('click',130000);assert.equal(s.mood,'awake');assert.equal(s.action,'wake');
 assert.equal(p.tick(135000).action,'idle');s=p.interact('wake',136000);assert.equal(s.action,'wake');assert.equal(s.mood,'awake');
 assert.equal(p.tick(180999).mood,'awake');assert.equal(p.tick(181000).mood,'drowsy');
});

test('three clicks in 700 ms are playful while feedback restarts are rate-limited to 200 ms',()=>{
 const p=pet();const first=p.interact('click',0);assert.notEqual(first.action,'idle');
 assert.equal(p.interact('click',100).revision,first.revision);
 const third=p.interact('click',200);assert.ok(['hop','spin'].includes(third.action));assert.equal(third.effect,'sparkle');assert.ok(third.revision>first.revision);
 for(let now=201;now<400;now+=10)assert.equal(p.interact('click',now).revision,third.revision);
 assert.ok(p.interact('click',400).revision>third.revision);
 const spread=pet();spread.interact('click',0);spread.interact('click',400);assert.ok(!['hop','spin'].includes(spread.interact('click',701).action));
 const exact=pet();exact.interact('click',0);exact.interact('click',350);assert.ok(['hop','spin'].includes(exact.interact('click',700).action));
});

test('playing and nap are explicit responses; nap remains asleep until a real interaction',()=>{
 const p=pet('whale');const play=p.interact('play',100);assert.equal(play.mood,'awake');assert.equal(play.action,'wave');assert.equal(play.effect,'bubbles');
 const sleep=p.interact('nap',200);assert.equal(sleep.mood,'sleeping');assert.equal(sleep.effect,'sleep');assert.equal(p.tick(300).mood,'sleeping');assert.equal(p.tick(200000).mood,'sleeping');
 const awake=p.interact('play',200001);assert.equal(awake.mood,'awake');assert.ok(['hop','spin'].includes(awake.action));
});

test('drag prevents idle actions and sleeping; release lands and restarts inactivity timing',()=>{
 const p=pet('cat');assert.equal(p.interact('drag-start',44000).action,'drag');
 for(const now of [60000,120000,500000]){const s=p.tick(now);assert.equal(s.action,'drag');assert.equal(s.mood,'awake');}
 let s=p.interact('drag-end',500100);assert.equal(s.action,'land');assert.equal(s.mood,'awake');
 assert.equal(p.tick(505100).action,'idle');assert.equal(p.tick(545099).mood,'awake');assert.equal(p.tick(545100).mood,'drowsy');
 const cancel=pet();cancel.interact('drag-start',0);s=cancel.interact('cancel',100);assert.equal(s.action,'idle');assert.equal(s.effect,'none');assert.equal(s.message,'');
 assert.equal(cancel.interact('drag-end',200).action,'idle');
});

test('pause freezes action and logical inactivity time, drops interactions, and does not queue bursts',()=>{
 const p=pet();p.interact('click',1000);const frozen=p.setPaused(true,1100);
 assert.deepEqual(p.tick(1_000_000),frozen);assert.deepEqual(p.interact('click',1_000_001),frozen);assert.deepEqual(p.interact('play',1_000_100),frozen);assert.deepEqual(p.interact('nap',1_000_200),frozen);
 assert.deepEqual(p.setPaused(false,1_000_300),frozen);assert.equal(p.tick(1_005_300).action,'idle');
 assert.equal(p.tick(1_045_199).mood,'awake');assert.equal(p.tick(1_045_200).mood,'drowsy');
 const burst=pet();burst.interact('click',0);burst.interact('click',200);burst.setPaused(true,250);burst.interact('click',500);burst.setPaused(false,600);const one=burst.interact('click',601);assert.ok(!['hop','spin'].includes(one.action));
});

test('dragging while paused never queues an action; a paused release cannot leave the model stuck dragging',()=>{
 const p=pet();const frozen=p.setPaused(true,0);assert.deepEqual(p.interact('drag-start',100),frozen);assert.deepEqual(p.interact('drag-end',200),frozen);assert.equal(p.setPaused(false,300).action,'idle');
 p.interact('drag-start',400);const dragging=p.setPaused(true,500);assert.equal(dragging.action,'drag');assert.deepEqual(p.interact('drag-end',700),dragging);assert.equal(p.setPaused(false,800).action,'idle');assert.equal(p.tick(900).action,'idle');
});

test('switching pets resets sleep and interaction history; custom IDs use a safe generic personality',()=>{
 const p=pet();p.interact('nap',0);let s=p.setPet('cat',100);assert.equal(s.mood,'awake');assert.equal(s.action,'idle');assert.equal(s.effect,'none');
 assert.notEqual(p.interact('click',200).message,'');s=p.setPet('custom-local-companion',300);assert.equal(s.action,'idle');
 for(const kind of ['click','play','wake','drag-start','drag-end','nap']){s=p.interact(kind,1000+['click','play','wake','drag-start','drag-end','nap'].indexOf(kind)*1000);assert.equal(typeof s.message,'string');assert.ok(!s.message.includes('undefined'));}
 assert.equal(p.setPet(null,9000).mood,'awake');
});

test('built-in personalities expose their own short Chinese reactions and effects',()=>{
 const cat=pet('cat'),robot=pet('robot'),whale=pet('whale');
 const messages=new Set([cat.interact('click',0).message,robot.interact('click',0).message,whale.interact('click',0).message]);assert.equal(messages.size,3);
 assert.equal(whale.snapshot().effect,'bubbles');
 const quiet=robot.snapshot();quiet.action='spin';assert.notEqual(robot.snapshot().action,'spin');const r=robot.tick(5000).revision;assert.equal(robot.tick(5001).revision,r);
});


test('paused actions resume their remaining duration, including the exact end boundary',()=>{
 const p=pet();p.interact('click',1000);assert.equal(p.setPaused(true,1100).action,'wave');p.setPaused(false,1_000_300);
 assert.equal(p.tick(1_001_699).action,'wave');assert.equal(p.tick(1_001_700).action,'idle');
});

test('all unknown IDs use generic behavior, backward time is harmless and invalid time is rejected',()=>{
 for(const id of ['constructor','toString','__proto__','custom-anything','not-built-in']){const p=pet(id);assert.equal(p.interact('play',100).action,'wave');assert.equal(p.interact('click',50).mood,'awake');assert.equal(p.tick(45099).mood,'awake');assert.equal(p.tick(45100).mood,'drowsy');}
 assert.throws(()=>new PetBehavior({now:Infinity}),/now/);assert.throws(()=>pet().tick(NaN),/now/);
});

test('only explicit local interactions reset inactivity; unknown signals never wake a nap',()=>{
 const p=pet();p.interact('pointer-move',20000);p.interact('keyboard',40000);assert.equal(p.tick(45000).mood,'drowsy');
 const sleeping=p.interact('nap',45001);assert.deepEqual(p.interact('pointer-move',50000),sleeping);assert.deepEqual(p.interact('unknown',60000),sleeping);
});


test('walking pauses at its current progress and resumes only its remaining logical duration',()=>{
 const p=pet();assert.equal(p.tick(6000).action,'walk');const frozen=p.setPaused(true,8000);assert.deepEqual(p.tick(80000),frozen);
 assert.deepEqual(p.interact('walk',90000),frozen);assert.deepEqual(p.setPaused(false,100000),frozen);assert.equal(p.tick(103999).action,'walk');assert.equal(p.tick(104000).action,'idle');
 assert.equal(p.tick(107999).action,'idle');assert.notEqual(p.tick(108000).action,'walk');assert.notEqual(p.snapshot().action,'idle');
});

test('clicks and drags interrupt walking, while due walks cannot overtake active feedback',()=>{
 const p=pet();p.tick(6000);const click=p.interact('click',7000);assert.notEqual(click.action,'walk');assert.equal(p.tick(7500).action,click.action);assert.equal(p.tick(12000).action,'idle');
 p.interact('walk',13000);assert.equal(p.interact('drag-start',14000).action,'drag');assert.equal(p.interact('walk',20000).action,'drag');assert.equal(p.tick(100000).action,'drag');assert.equal(p.interact('drag-end',100100).action,'land');
 const pending=pet();const response=pending.interact('click',6000);assert.notEqual(response.action,'walk');assert.equal(pending.tick(7499).action,response.action);assert.equal(pending.tick(7500).action,'idle');assert.equal(pending.tick(11999).action,'idle');assert.equal(pending.tick(12000).action,'walk');
});

test('explicit walk wakes a sleeper, resets inactivity, and queues no second walk immediately afterwards',()=>{
 const p=pet('whale');p.interact('nap',0);const s=p.interact('walk',1000);assert.equal(s.mood,'awake');assert.equal(s.action,'walk');assert.notEqual(s.message,'');
 assert.equal(p.tick(6999).action,'walk');assert.equal(p.tick(7000).action,'idle');assert.notEqual(p.tick(11000).action,'walk');
 assert.equal(p.tick(45999).mood,'awake');assert.equal(p.tick(46000).mood,'drowsy');assert.equal(p.tick(121000).mood,'sleeping');
});

test('autonomous walks never prevent drowsiness or sleep, and dormant pets never wander',()=>{
 const p=pet();for(let now=0;now<=45000;now+=500){const s=p.tick(now);if(now<45000)assert.equal(s.mood,'awake');else assert.equal(s.mood,'drowsy');}
 for(let now=45500;now<120000;now+=500){const s=p.tick(now);assert.ok(['idle','look','yawn'].includes(s.action));}
 const sleeping=p.tick(120000);assert.equal(sleeping.mood,'sleeping');assert.deepEqual(p.tick(9_000_000),sleeping);
 const nap=pet();const quiet=nap.interact('nap',0);assert.deepEqual(nap.tick(8000),quiet);assert.deepEqual(nap.tick(120000),quiet);
});

test('imported pets walk and use every new cute action with finite durations and local captions',()=>{
 for(const id of ['custom-my-image','__proto__']){const p=pet(id);assert.equal(p.tick(6000).action,'walk');assert.equal(p.tick(12000).action,'idle');}
 for(const [target,duration] of [['dance',2400],['peek',2200],['shake',1600]]){
   let matched=false;
   for(const value of [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]){
     const p=new PetBehavior({pet:'custom-any-image',now:0,random:()=>value});p.interact('play',0);const s=p.interact('play',3000);
     if(s.action!==target)continue;matched=true;assert.ok(s.message.length>0);assert.equal(p.tick(3000+duration-1).action,target);assert.equal(p.tick(3000+duration).action,'idle');break;
   }
   assert.equal(matched,true,target+' should be reachable from playful responses');
 }
});

test('a click immediately interrupts an explicit walk, then ordinary feedback throttling resumes',()=>{
 const p=pet();assert.equal(p.interact('walk',1000).action,'walk');
 const first=p.interact('click',1001);assert.equal(first.action,'wave');
 assert.equal(p.interact('click',1100).revision,first.revision);
 const third=p.interact('click',1201);assert.ok(['hop','spin'].includes(third.action));assert.ok(third.revision>first.revision);
});

test('whalegirl crawls first, then alternates varied idle activities without delaying sleep',()=>{
 const p=pet('whalegirl');assert.equal(p.tick(6000).action,'crawl');assert.equal(p.tick(11999).action,'crawl');assert.equal(p.tick(12000).action,'idle');
 assert.equal(p.tick(16000).action,'eat');assert.equal(p.tick(20000).action,'idle');assert.equal(p.tick(26000).action,'crawl');assert.equal(p.tick(32000).action,'idle');assert.equal(p.tick(36000).action,'work');
 assert.equal(p.tick(45000).mood,'drowsy');assert.equal(p.tick(120000).mood,'sleeping');
});

test('whalegirl menu activities have finite durations, wake naps, and are not accepted by other pets',()=>{
 for(const [kind,duration] of [['walk',6000],['eat',4000],['work',5000],['yawn',1800]]){
  const p=pet('whalegirl');p.interact('nap',0);const action=kind==='walk'?'crawl':kind;
  const s=p.interact(kind,1000);assert.equal(s.action,action);assert.equal(s.mood,'awake');assert.ok(s.message.length>0);
  assert.equal(p.tick(1000+duration-1).action,action);assert.equal(p.tick(1000+duration).action,'idle');
 }
 for(const id of ['robot','cat','whale','custom-local'])for(const kind of ['eat','work','yawn'])assert.equal(pet(id).interact(kind,100).action,'idle');
});

test('whalegirl long activities yield to the first click, then rate-limit ordinary feedback',()=>{
 for(const kind of ['walk','eat','work','yawn']){
  const p=pet('whalegirl');assert.equal(p.interact(kind,1000).action,kind==='walk'?'crawl':kind);const response=p.interact('click',1001);
  assert.ok(!['crawl','eat','work','yawn'].includes(response.action));assert.notEqual(response.action,'idle');
  assert.equal(p.interact('click',1100).revision,response.revision);
 }
});

test('whalegirl paused and dragging states reject menu activities; resume preserves remaining work',()=>{
 const p=pet('whalegirl');p.interact('work',0);const frozen=p.setPaused(true,1000);
 for(const kind of ['eat','work','yawn','walk'])assert.deepEqual(p.interact(kind,10000),frozen);
 p.setPaused(false,10000);assert.equal(p.tick(13999).action,'work');assert.equal(p.tick(14000).action,'idle');
 p.interact('drag-start',15000);for(const kind of ['eat','work','yawn','walk'])assert.equal(p.interact(kind,15001).action,'drag');
 assert.equal(p.interact('drag-end',16000).action,'land');p.interact('eat',17000);assert.equal(p.setPet('cat',17001).action,'idle');
});

test('cyberdad alternates little walks with cookies and work, then grows sleepy without input',()=>{
 const p=pet('cyberdad');assert.equal(p.tick(6000).action,'walk');assert.equal(p.tick(12000).action,'idle');
 assert.equal(p.tick(16000).action,'eat');assert.match(p.snapshot().message,/饼干/);assert.equal(p.tick(20000).action,'idle');
 assert.equal(p.tick(26000).action,'walk');assert.equal(p.tick(32000).action,'idle');assert.equal(p.tick(36000).action,'work');
 assert.match(p.snapshot().message,/工作/);assert.equal(p.tick(45000).action,'yawn');assert.equal(p.tick(120000).mood,'sleeping');
 const wake=p.interact('click',120001);assert.equal(wake.mood,'awake');assert.equal(wake.action,'wake');
});

test('cyberdad menu activities wake naps, end on time and yield immediately to a click',()=>{
 for(const [kind,duration] of [['walk',6000],['eat',4000],['work',5000],['yawn',1800]]){
  const p=pet('cyberdad');p.interact('nap',0);const s=p.interact(kind,1000);
  assert.equal(s.action,kind);assert.equal(s.mood,'awake');assert.ok(s.message.length>0);
  assert.equal(p.tick(1000+duration-1).action,kind);assert.equal(p.tick(1000+duration).action,'idle');
  p.interact(kind,10000);const response=p.interact('click',10001);assert.equal(response.action,'wave');
  assert.equal(p.interact('click',10100).revision,response.revision);
 }
});

test('cyberdad pause and drag reject menu activities; resume preserves the unfinished activity',()=>{
 const p=pet('cyberdad');p.interact('work',0);const frozen=p.setPaused(true,1000);
 for(const kind of ['eat','work','yawn','walk'])assert.deepEqual(p.interact(kind,10000),frozen);
 p.setPaused(false,10000);assert.equal(p.tick(13999).action,'work');assert.equal(p.tick(14000).action,'idle');
 p.interact('drag-start',15000);for(const kind of ['eat','work','yawn','walk'])assert.equal(p.interact(kind,15001).action,'drag');
 assert.equal(p.interact('drag-end',16000).action,'land');p.interact('nap',17000);assert.equal(p.setPet('cyberdad',18000).action,'idle');
});
