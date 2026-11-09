// Each finger owns its input, so releasing one finger never releases another.
export function installTouchControls(container,onChange){
 const pointers=new Map();
 const emit=()=>onChange(new Set([...pointers.values()].map(b=>b.dataset.key.toLowerCase())));
 const release=id=>{const button=pointers.get(id);pointers.delete(id);if(button&&![...pointers.values()].includes(button))button.classList.remove('is-pressed');emit();};
 const clear=()=>{for(const button of pointers.values())button.classList.remove('is-pressed');pointers.clear();emit();};
 for(const button of container.querySelectorAll('[data-key]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);pointers.set(e.pointerId,button);button.classList.add('is-pressed');emit();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>release(e.pointerId));
  button.addEventListener('contextmenu',e=>e.preventDefault());
 }
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 return {clear};
}
