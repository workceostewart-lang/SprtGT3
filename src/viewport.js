// CSS owns the visible size; WebGL follows it without writing inline pixel sizes.
export function installViewport({root, renderer, camera, fullscreenButton}) {
 let frame=0, width=0, height=0, pixelRatio=0;
 const sync=()=>{
  frame=0;
  const nextWidth=Math.max(1,root.clientWidth),nextHeight=Math.max(1,root.clientHeight);
  const nextRatio=Math.min(window.devicePixelRatio||1,1.6);
  if(nextWidth===width&&nextHeight===height&&nextRatio===pixelRatio)return;
  width=nextWidth;height=nextHeight;pixelRatio=nextRatio;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
 };
 const resize=()=>{if(!frame)frame=requestAnimationFrame(sync);};
 new ResizeObserver(resize).observe(root);
 window.addEventListener('resize',resize);
 window.visualViewport?.addEventListener('resize',resize);
 window.screen.orientation?.addEventListener('change',resize);
 window.addEventListener('orientationchange',resize);

 const current=()=>document.fullscreenElement||document.webkitFullscreenElement;
 const request=root.requestFullscreen||root.webkitRequestFullscreen;
 const supported=!!request&&(document.fullscreenEnabled??document.webkitFullscreenEnabled??true);
 const updateFullscreen=()=>{
  const active=!!current();
  fullscreenButton.hidden=!supported;
  fullscreenButton.textContent=active?'Exit full screen':'Full screen';
  fullscreenButton.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');
  fullscreenButton.setAttribute('aria-pressed',String(active));
  resize();
 };
 async function enterFullscreen(){
  if(!supported||current())return;
  try{await request.call(root,{navigationUI:'hide'});}catch{
   // Some mobile browsers only allow the viewport-filling layout, or deny the request.
  }
 }
 fullscreenButton.addEventListener('click',async()=>{
  if(current()){
   try{await (document.exitFullscreen||document.webkitExitFullscreen).call(document);}catch{}
  }else await enterFullscreen();
  updateFullscreen();
 });
 document.addEventListener('fullscreenchange',updateFullscreen);
 document.addEventListener('webkitfullscreenchange',updateFullscreen);
 updateFullscreen();sync();
 return {enterFullscreen};
}
