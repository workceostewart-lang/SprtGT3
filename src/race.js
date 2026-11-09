export const CTRL=[[-105,-45],[-70,-82],[5,-93],[83,-77],[108,-36],[103,35],[96,115],[63,168],[4,176],[-60,160],[-78,125],[-28,99],[-20,66],[-80,39],[-113,0]];
const raw=[];
for(let i=0;i<CTRL.length;i++)for(let k=0;k<24;k++){const t=k/24,p=[-1,0,1,2].map(j=>CTRL[(i+j+CTRL.length)%CTRL.length]);raw.push([0,1].map(a=>.5*(2*p[1][a]+(-p[0][a]+p[2][a])*t+(2*p[0][a]-5*p[1][a]+4*p[2][a]-p[3][a])*t*t+(-p[0][a]+3*p[1][a]-3*p[2][a]+p[3][a])*t*t*t)));}
export const PATH=[...raw.slice(128),...raw.slice(0,128)];
export const LENGTHS=[0];for(let i=0;i<PATH.length;i++){const a=PATH[i],b=PATH[(i+1)%PATH.length];LENGTHS.push(LENGTHS.at(-1)+Math.hypot(b[0]-a[0],b[1]-a[1]));}
export const LENGTH=LENGTHS.at(-1),TAU=Math.PI*2;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function at(distance,lane=0){let s=((distance%LENGTH)+LENGTH)%LENGTH,i=0;while(LENGTHS[i+1]<s)i++;const a=PATH[i],b=PATH[(i+1)%PATH.length],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),t=(s-LENGTHS[i])/d;return{x:a[0]+dx*t-dy/d*lane,y:a[1]+dy*t+dx/d*lane,a:Math.atan2(dy,dx)};}
export function nearest(x,y){let best={dist:Infinity};for(let i=0;i<PATH.length;i++){const a=PATH[i],b=PATH[(i+1)%PATH.length],dx=b[0]-a[0],dy=b[1]-a[1],d2=dx*dx+dy*dy,t=clamp(((x-a[0])*dx+(y-a[1])*dy)/d2,0,1),px=a[0]+t*dx,py=a[1]+t*dy,d=Math.hypot(x-px,y-py);if(d<best.dist)best={dist:d,x:px,y:py,s:LENGTHS[i]+t*Math.sqrt(d2),a:Math.atan2(dy,dx)};}return best;}
export function newRace(players,difficulty='normal'){
 const roster=players.slice(0,4).map(p=>({...p,cpu:false}));while(roster.length<6){const i=roster.length;roster.push({id:'cpu'+i,name:['Vega','Sato','Reyes','Costa','Novak','Blake'][i],car:['red','yellow','blue'][i%3],cpu:true});}
 return {time:-3,difficulty,status:'racing',cars:roster.map((p,i)=>{const s=-6-Math.floor(i/2)*7,lane=i%2?3:-3;return {...p,...at(s,lane),v:0,progress:s,lastS:(s+LENGTH)%LENGTH,lap:0,lapStart:0,best:null,finish:null,off:false,resetCooldown:0,lapTimes:[],disconnected:false};})};
}
export function recover(c){const p=at(c.progress);Object.assign(c,p,{v:0,lastS:((c.progress%LENGTH)+LENGTH)%LENGTH,resetCooldown:3});}
// Pace in m/s; corner caution scales the speed reduction for upcoming bends.
// All drivers retain the same acceleration, braking and 52 m/s physical limit.
const CPU_TUNING={easy:{pace:25,caution:1.8},normal:{pace:48,caution:.95},hard:{pace:52,caution:.60}};
export function aiInput(c,race){
 const {pace,caution}=CPU_TUNING[race.difficulty]||CPU_TUNING.normal;
 const near=nearest(c.x,c.y),target=at(near.s+Math.max(10,c.v*.65),Math.sin(Number(c.id.replace('cpu',''))*2)*1.6);
 const bend=Math.abs(angle(at(near.s+30).a-at(near.s+5).a)),desired=pace/(1+bend*caution);
 const err=angle(Math.atan2(target.y-c.y,target.x-c.x)-c.a);
 return {throttle:c.v<desired,brake:c.v>desired+1,steer:clamp(err*2.4,-1,1)};
}
export function step(race,inputs,dt=1/60){
 race.time+=dt;if(race.time<0)return;
 for(const c of race.cars){if(c.finish!==null||c.disconnected)continue;c.resetCooldown=Math.max(0,c.resetCooldown-dt);const input=c.cpu?aiInput(c,race):(inputs[c.id]||{});if(input.reset&&c.resetCooldown===0)recover(c);
  let n=nearest(c.x,c.y);c.off=n.dist>9.5;const throttle=input.throttle?1:0,brake=input.brake?1:0;
  c.v=clamp(c.v+(throttle*13-brake*(c.v>1?24:7)-c.v*(c.off?.9:.11)-Math.sign(c.v)*.55)*dt,-8,c.off?23:52);
  const steer=clamp(Number(input.steer)||0,-1,1);c.a=angle(c.a+steer*clamp(c.v*.11,-.7,1.65)*dt);c.x+=Math.cos(c.a)*c.v*dt;c.y+=Math.sin(c.a)*c.v*dt;
  n=nearest(c.x,c.y);if(n.dist>23){const f=22.8/n.dist;c.x=n.x+(c.x-n.x)*f;c.y=n.y+(c.y-n.y)*f;c.v*=.55;}
  let delta=n.s-c.lastS;if(delta>LENGTH/2)delta-=LENGTH;if(delta<-LENGTH/2)delta+=LENGTH;
  if(n.dist<24&&Math.abs(delta)<Math.abs(c.v)*dt+2)c.progress+=delta;c.lastS=n.s;
  const completed=Math.max(0,Math.floor(c.progress/LENGTH));if(completed>c.lap){c.lap=completed;const lapTime=race.time-c.lapStart;c.lapStart=race.time;c.lapTimes.push(lapTime);c.best=Math.min(c.best||Infinity,lapTime);if(c.lap>=3){c.finish=race.time;c.v=0;}}
 }
 // Soft contact between cars. Progress is never advanced by collision resolution.
 for(let i=0;i<race.cars.length;i++)for(let j=i+1;j<race.cars.length;j++){const a=race.cars[i],b=race.cars[j];if(a.finish!==null||b.finish!==null||a.disconnected||b.disconnected)continue;const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d>0&&d<2.25){const push=(2.25-d)*.5;a.x+=dx/d*push;a.y+=dy/d*push;b.x-=dx/d*push;b.y-=dy/d*push;}}
}
export function order(race){return [...race.cars].sort((a,b)=>a.disconnected-b.disconnected||(a.finish??Infinity)-(b.finish??Infinity)||b.progress-a.progress);}
export function formatTime(t){if(t==null||!Number.isFinite(t))return '—';return Math.floor(t/60)+':'+(t%60).toFixed(2).padStart(5,'0');}
