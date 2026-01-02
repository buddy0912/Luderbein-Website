// Luderbein – thumb-rotator.js v1.1
(function(){
function setup(el){
  const imgs=[...el.querySelectorAll("img")];
  if(imgs.length<=1)return;
  let i=0;
  imgs.forEach((img,idx)=>img.style.opacity=idx?0:1);
  const fade=650,delay=4200;
  const tick=()=>{imgs[i].style.opacity=0;i=(i+1)%imgs.length;imgs[i].style.opacity=1;};
  let timer=setInterval(tick,delay);
  document.addEventListener("visibilitychange",()=>document.hidden?clearInterval(timer):(timer=setInterval(tick,delay)));
}
document.addEventListener("DOMContentLoaded",()=>document.querySelectorAll(".thumbslider").forEach(setup));
})();
