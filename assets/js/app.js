
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
$$('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.tabs button').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  $$('.panel').forEach(x=>x.classList.remove('active'));
  $('#'+btn.dataset.tab).classList.add('active');
}));
function updateCountdown(){
  const dep=new Date('2026-07-19T10:15:00+02:00'), now=new Date(), diff=dep-now;
  const el=$('#countdown');
  if(diff<=0){el.textContent='Viaggio in corso o concluso';return}
  const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000);
  el.textContent=`Mancano ${d} giorni e ${h} ore`;
}
updateCountdown(); setInterval(updateCountdown,60000);
$$('[data-save]').forEach(i=>{
  i.checked=localStorage.getItem(i.dataset.save)==='1';
  i.addEventListener('change',()=>{localStorage.setItem(i.dataset.save,i.checked?'1':'0');progress()});
});
function progress(){
  const list=$$('#checklist input'), done=list.filter(x=>x.checked).length;
  const p=list.length?Math.round(done/list.length*100):0;
  $('#bar').style.width=p+'%'; $('#progressText').textContent=`${done} di ${list.length} completati (${p}%)`;
}
progress();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js')}
