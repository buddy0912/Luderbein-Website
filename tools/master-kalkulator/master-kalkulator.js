(function(){
  'use strict';
  const eur = new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'});
  const fmt = (n) => eur.format(Number.isFinite(n)?n:0);
  const defaults = {quantity:25, material:4.2, machine:28, minutes:8, setup:18, artwork:12, packaging:1.25, waste:8, margin:35, tax:19, rush:false, shipping:true};
  const state = {...defaults};
  const fields = document.querySelectorAll('[data-field]');
  const rows = document.querySelector('[data-result-rows]');
  const status = document.querySelector('[data-import-status]');
  function readField(el){ const key=el.dataset.field; if(el.type==='checkbox') state[key]=el.checked; else state[key]=Number(el.value)||0; }
  function sync(key,value,source){ document.querySelectorAll(`[data-field="${key}"]`).forEach((el)=>{ if(el===source) return; if(el.type==='checkbox') el.checked=!!value; else el.value=value; }); }
  function calc(){
    const q=Math.max(1,state.quantity); const unitBase=state.material+state.packaging+(state.machine*(state.minutes/60));
    const setupTotal=state.setup+state.artwork; const wasteFactor=1+(state.waste/100); const rushFactor=state.rush?1.2:1;
    const netUnit=((unitBase*wasteFactor)*rushFactor)+(setupTotal/q); const netTotal=netUnit*q; const profit=netTotal*(state.margin/100);
    const shipping=state.shipping?(netTotal+profit>=80?0:6.95):0; const subtotal=netTotal+profit+shipping; const tax=subtotal*(state.tax/100); const gross=subtotal+tax;
    return {q,unitBase,setupTotal,netUnit,netTotal,profit,shipping,subtotal,tax,gross};
  }
  function render(){ const r=calc();
    document.querySelector('[data-total]').textContent=fmt(r.gross); document.querySelector('[data-unit]').textContent=fmt(r.gross/r.q);
    document.querySelector('[data-net]').textContent=fmt(r.subtotal); document.querySelector('[data-tax]').textContent=fmt(r.tax);
    rows.innerHTML=[['Material/Verpackung/Maschine',r.unitBase*r.q],['Einrichtung & Datei',r.setupTotal],['Ausschuss / Puffer',r.netTotal-(r.unitBase*r.q)-r.setupTotal],['Marge',r.profit],['Versand',r.shipping],['USt.',r.tax],['Gesamt brutto',r.gross]].map(([l,v])=>`<tr><td data-label="Position">${l}</td><td data-label="Betrag">${fmt(v)}</td></tr>`).join('');
  }
  fields.forEach((el)=>{ readField(el); el.addEventListener('input',()=>{ readField(el); sync(el.dataset.field,state[el.dataset.field],el); render(); }); el.addEventListener('change',()=>{ readField(el); sync(el.dataset.field,state[el.dataset.field],el); render(); }); });
  document.querySelector('[data-export]').addEventListener('click',()=>{ document.querySelector('[data-json]').value=JSON.stringify(state,null,2); status.textContent='Export erstellt.'; });
  document.querySelector('[data-import]').addEventListener('click',()=>{ try{ const imported=JSON.parse(document.querySelector('[data-json]').value||'{}'); Object.keys(defaults).forEach((k)=>{ if(Object.prototype.hasOwnProperty.call(imported,k)) state[k]=imported[k]; sync(k,state[k],null); }); render(); status.textContent='Import übernommen.'; }catch(e){ status.textContent='Import nicht lesbar: Bitte gültiges JSON einfügen.'; } });
  document.querySelector('[data-reset]').addEventListener('click',()=>{ Object.assign(state,defaults); Object.keys(defaults).forEach((k)=>sync(k,state[k],null)); render(); status.textContent='Standardwerte geladen.'; });
  render();
})();
