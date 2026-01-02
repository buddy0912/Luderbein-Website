// Luderbein – site.js v1.1
(function(){
"use strict";
function ready(fn){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn):fn();}
ready(function(){
  const btn=document.querySelector("[data-nav-toggle]");
  const nav=document.querySelector("[data-nav]");
  const menu=document.querySelector('nav[aria-label="Hauptmenü"]');

  const isOpen=()=>nav?.dataset.open==="true";
  const setNav=(s)=>{nav.dataset.open=s?"true":"false";btn.setAttribute("aria-expanded",s);};
  btn&&btn.addEventListener("click",()=>setNav(!isOpen()));
  document.addEventListener("keydown",e=>e.key==="Escape"&&setNav(false));
  document.addEventListener("click",e=>{
    if(e.target.closest("[data-nav]")||e.target.closest("[data-nav-toggle]"))return;
    setNav(false);
  });

  // aria-current Auto
  if(menu){
    const links=[...menu.querySelectorAll("a[href]")];
    const current=location.pathname.replace(/index\.html$/i,"")||"/";
    links.forEach(a=>{
      const href=new URL(a.getAttribute("href"),location.origin).pathname.replace(/index\.html$/i,"")||"/";
      if(href!=="/"&&current.startsWith(href))a.setAttribute("aria-current","page");
    });
  }
});
})();
