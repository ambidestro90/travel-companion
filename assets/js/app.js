
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
$$('.tabs button').forEach(btn=>btn.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$$('.panel').forEach(x=>x.classList.remove('active'));$('#'+btn.dataset.tab).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})});
function countdown(){const dep=new Date('2026-07-19T10:15:00+02:00'),d=dep-new Date(),el=$('#countdown');if(d<=0){el.textContent='Viaggio iniziato o concluso';return}el.textContent=`Mancano ${Math.floor(d/86400000)} giorni e ${Math.floor(d%86400000/3600000)} ore`}
countdown();setInterval(countdown,60000);
$$('[data-save]').forEach(i=>{i.checked=localStorage.getItem(i.dataset.save)==='1';i.onchange=()=>{localStorage.setItem(i.dataset.save,i.checked?'1':'0');progress()}});
$$('[data-text]').forEach(i=>{i.value=localStorage.getItem(i.dataset.text)||'';i.oninput=()=>localStorage.setItem(i.dataset.text,i.value)});
function progress(){const l=$$('#checklist input'),n=l.filter(x=>x.checked).length,p=l.length?Math.round(n/l.length*100):0;$('#bar').style.width=p+'%';$('#progressText').textContent=`${n} di ${l.length} completati (${p}%)`}progress();
$('#resetDaily').onclick=()=>{$$('[data-save^="daily-"]').forEach(i=>{i.checked=false;localStorage.removeItem(i.dataset.save)})};
$$('[data-copy]').forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);const t=b.textContent;b.textContent='Copiato';setTimeout(()=>b.textContent=t,1000)});

$('#tripNotes').value=localStorage.getItem('tripNotes')||'';
$('#saveNotes').onclick=()=>{localStorage.setItem('tripNotes',$('#tripNotes').value);$('#noteStatus').textContent='Salvato';setTimeout(()=>$('#noteStatus').textContent='',1500)};

let expenses=JSON.parse(localStorage.getItem('expenses')||'[]');
function renderExpenses(){const box=$('#expenseList');box.innerHTML='';let total=0;expenses.forEach((e,i)=>{total+=Number(e.amount)||0;const row=document.createElement('div');row.className='expense-item';row.innerHTML=`<span>${e.desc}<br><b>€ ${Number(e.amount).toFixed(2).replace('.',',')}</b></span>`;const del=document.createElement('button');del.textContent='Elimina';del.onclick=()=>{expenses.splice(i,1);saveExpenses()};row.append(del);box.append(row)});$('#expenseTotal').textContent=total.toFixed(2).replace('.',',')}
function saveExpenses(){localStorage.setItem('expenses',JSON.stringify(expenses));renderExpenses()}
$('#addExpense').onclick=()=>{const desc=$('#expenseDesc').value.trim(),amount=parseFloat($('#expenseAmount').value);if(!desc||isNaN(amount))return alert('Inserisci descrizione e importo');expenses.push({desc,amount});$('#expenseDesc').value='';$('#expenseAmount').value='';saveExpenses()};renderExpenses();

let db;const req=indexedDB.open('TravelCompanionDocs',1);req.onupgradeneeded=e=>e.target.result.createObjectStore('docs',{keyPath:'id',autoIncrement:true});req.onsuccess=e=>{db=e.target.result;renderDocs()};
function renderDocs(){if(!db)return;const r=db.transaction('docs','readonly').objectStore('docs').getAll();r.onsuccess=()=>{const box=$('#docList');box.innerHTML='';r.result.forEach(d=>{const row=document.createElement('div');row.className='fileitem';const a=document.createElement('a');a.textContent='📎 '+d.name;a.href=URL.createObjectURL(d.blob);a.target='_blank';const del=document.createElement('button');del.textContent='Elimina';del.onclick=()=>db.transaction('docs','readwrite').objectStore('docs').delete(d.id).onsuccess=renderDocs;row.append(a,del);box.append(row)})}}
$('#saveDoc').onclick=()=>{const f=$('#docFile').files[0];if(!f)return alert('Seleziona un file');const name=$('#docName').value.trim()||f.name;db.transaction('docs','readwrite').objectStore('docs').add({name,blob:f,created:Date.now()}).onsuccess=()=>{$('#docName').value='';$('#docFile').value='';renderDocs()}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js');
