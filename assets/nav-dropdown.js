// Luderbein – nav-dropdown.js v1.1
(function(){
  function ready(fn){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn):fn();}
  ready(function(){
    const drops=[...document.querySelectorAll(".navdrop[data-navdrop]")];
    drops.forEach(dd=>{
      const sum=dd.querySelector(".navdrop__sum");
      const panel=dd.querySelector(".navdrop__panel");
      if(!sum||!panel)return;
      const toggle=(state)=>{
        dd.dataset.open=state?"true":"false";
        sum.setAttribute("aria-expanded",state);
      };
      sum.addEventListener("click",e=>{
        e.preventDefault();
        const willOpen=dd.dataset.open!=="true";
        drops.forEach(o=>o.dataset.open="false");
        toggle(willOpen);
      });
    });
    document.addEventListener("click",e=>{
      if(e.target.closest(".navdrop"))return;
      drops.forEach(dd=>dd.dataset.open="false");
    });
  });
})();
