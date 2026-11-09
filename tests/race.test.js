import test from 'node:test';import assert from 'node:assert/strict';import {newRace,step,at,nearest,LENGTH,order,recover} from '../src/race.js';
test('circuit sampling and projection agree',()=>{for(let s=0;s<LENGTH;s+=5){const p=at(s),n=nearest(p.x,p.y);assert.ok(n.dist<1e-7);assert.ok(Math.abs(n.s-s)<1e-6);}});
test('countdown locks the grid; acceleration and steering work',()=>{const r=newRace([{id:'p',name:'Test',car:'red'}]);const c=r.cars[0],x=c.x,y=c.y;for(let i=0;i<100;i++)step(r,{p:{throttle:true}},1/60);assert.equal(c.x,x);assert.equal(c.y,y);for(let i=0;i<120;i++)step(r,{p:{throttle:true,steer:1}},1/60);assert.ok(c.v>0);assert.ok(Math.hypot(c.x-x,c.y-y)>1);});
test('recovery preserves earned progress and lap',()=>{const r=newRace([{id:'p',name:'Test',car:'red'}]),c=r.cars[0];c.progress=LENGTH+45;c.lap=1;c.x=400;recover(c);assert.equal(c.progress,LENGTH+45);assert.equal(c.lap,1);assert.ok(nearest(c.x,c.y).dist<.001);});
test('crossing start line from grid does not count as lap',()=>{const r=newRace([{id:'p',name:'Test',car:'red'}]);r.time=0;const c=r.cars[0];Object.assign(c,at(-.1),{progress:-.1,lastS:LENGTH-.1,v:15});step(r,{p:{throttle:true}},1/60);assert.equal(c.lap,0);});
test('CPU tiers finish three laps at competitive pace without leaving the track',()=>{
 const times={};
 for(const difficulty of ['easy','normal','hard']){
  const r=newRace([],difficulty);let activeFrames=0,offFrames=0,maxSpeed=0;
  for(let i=0;i<60*300&&r.cars.some(c=>c.finish===null);i++){
   step(r,{},1/60);
   for(const c of r.cars)if(c.finish===null&&r.time>0){activeFrames++;offFrames+=Number(c.off);maxSpeed=Math.max(maxSpeed,c.v);}
  }
  assert.ok(r.cars.every(c=>c.finish!==null),difficulty+' CPU failed to finish');
  assert.ok(r.cars.every(c=>c.lap===3&&c.lapTimes.length===3));
  assert.ok(offFrames/activeFrames<.01,difficulty+' spends too long off track');
  assert.ok(maxSpeed<=52,'CPU exceeds the player speed limit');
  if(difficulty==='normal'){assert.ok(r.cars.every(c=>c.finish<90),'Club must remain competitive over a full race');assert.ok(maxSpeed>46);}
  if(difficulty==='hard'){assert.ok(r.cars.every(c=>c.finish<72),'Pro must challenge the player over a full race');assert.ok(maxSpeed>51);}
  times[difficulty]=order(r)[0].finish;
  const end=r.cars[0].progress;step(r,{},1/60);assert.equal(r.cars[0].progress,end);
 }
 assert.ok(times.hard<times.normal&&times.normal<times.easy,JSON.stringify(times));
 assert.ok(Math.abs(times.easy-165.6166667)<.1,'Rookie pace must remain unchanged');
 console.log('CPU three-lap finish times',times);
});
