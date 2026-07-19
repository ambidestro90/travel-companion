
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function switchTab(id){
  $$('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  $$('.panel').forEach(x=>x.classList.toggle('active',x.id===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('[data-open]').forEach(b=>b.onclick=()=>switchTab(b.dataset.open));

function countdown(){
  const dep=new Date('2026-07-19T10:15:00+02:00'), diff=dep-new Date(), el=$('#countdown');
  if(diff<=0){el.textContent='Viaggio in corso o concluso';return}
  el.textContent=`Mancano ${Math.floor(diff/86400000)} giorni e ${Math.floor(diff%86400000/3600000)} ore`;
}
function localTime(){
  const fmt=new Intl.DateTimeFormat('it-IT',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit'});
  $('#localTime').textContent=`Sharm ${fmt.format(new Date())}`;
}
countdown();localTime();setInterval(()=>{countdown();localTime()},60000);

$$('[data-save]').forEach(i=>{i.checked=localStorage.getItem(i.dataset.save)==='1';i.onchange=()=>localStorage.setItem(i.dataset.save,i.checked?'1':'0')});
$$('[data-text]').forEach(i=>{i.value=localStorage.getItem(i.dataset.text)||'';i.oninput=()=>localStorage.setItem(i.dataset.text,i.value)});
$('#resetDaily').onclick=()=>{$$('[data-save^="daily-"]').forEach(i=>{i.checked=false;localStorage.removeItem(i.dataset.save)})};
$$('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy)}catch{}const old=b.textContent;b.textContent='Copiato';setTimeout(()=>b.textContent=old,1000)});

const personItems={
 giuseppe:['Documenti','Farmaci personali','Costumi','Abbigliamento sera','Caricabatterie','Occhiali da sole'],
 gloria:['Documenti','Farmaci personali','Costumi','Abbigliamento sera','Creme e prodotti personali','Caricabatterie'],
 gioele:['Documento','Costumi','Cappellino','Crema solare','Braccioli/maschera','Giochi e intrattenimento','Farmaci'],
 ginevra:['Documento','Costumi','Cappellino','Crema solare','Braccioli','Cambio completo','Salviette e snack','Farmaci']
};
let activePerson='giuseppe';
function renderPerson(){
 const box=$('#personChecklist');box.innerHTML='';
 personItems[activePerson].forEach((label,i)=>{
   const key=`person-${activePerson}-${i}`,row=document.createElement('label');row.className='check';
   row.innerHTML=`<input type="checkbox" ${localStorage.getItem(key)==='1'?'checked':''}>${label}`;
   row.querySelector('input').onchange=e=>localStorage.setItem(key,e.target.checked?'1':'0');box.append(row);
 });
}
$$('.person').forEach(b=>b.onclick=()=>{$$('.person').forEach(x=>x.classList.remove('active'));b.classList.add('active');activePerson=b.dataset.person;renderPerson()});renderPerson();

let expenses=JSON.parse(localStorage.getItem('expenses-v1')||'[]');
function renderExpenses(){
 const box=$('#expenseList');box.innerHTML='';let total=0;
 expenses.forEach((e,i)=>{total+=Number(e.amount)||0;const row=document.createElement('div');row.className='expense-item';
 row.innerHTML=`<span><b>${e.desc}</b><br><small>${e.category}</small></span><span>€ ${Number(e.amount).toFixed(2).replace('.',',')}</span>`;
 const del=document.createElement('button');del.textContent='✕';del.onclick=()=>{expenses.splice(i,1);saveExpenses()};row.append(del);box.append(row)});
 $('#expenseTotal').textContent=total.toFixed(2).replace('.',',');
}
function saveExpenses(){localStorage.setItem('expenses-v1',JSON.stringify(expenses));renderExpenses()}
$('#addExpense').onclick=()=>{const desc=$('#expenseDesc').value.trim(),amount=parseFloat($('#expenseAmount').value),category=$('#expenseCategory').value;if(!desc||isNaN(amount))return alert('Inserisci descrizione e importo');expenses.push({desc,amount,category});$('#expenseDesc').value='';$('#expenseAmount').value='';saveExpenses()};renderExpenses();

function convert(){const rate=parseFloat($('#exchangeRate').value)||0,eur=parseFloat($('#eurValue').value)||0;localStorage.setItem('exchangeRate',rate);$('#egpResult').textContent=(rate*eur).toFixed(2).replace('.',',')+' EGP'}
$('#exchangeRate').value=localStorage.getItem('exchangeRate')||55;$('#exchangeRate').oninput=convert;$('#eurValue').oninput=convert;convert();

const today=new Date().toISOString().slice(0,10);$('#diaryDate').value=today;
function noteKey(){return 'diary-'+$('#diaryDate').value}
function loadNote(){$('#tripNotes').value=localStorage.getItem(noteKey())||''}
$('#diaryDate').onchange=loadNote;loadNote();
$('#saveNotes').onclick=()=>{localStorage.setItem(noteKey(),$('#tripNotes').value);$('#noteStatus').textContent='Salvato';setTimeout(()=>$('#noteStatus').textContent='',1500)};

let db;const req=indexedDB.open('TravelCompanionDocs',2);
req.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('docs'))d.createObjectStore('docs',{keyPath:'id',autoIncrement:true})};
req.onsuccess=e=>{db=e.target.result;renderDocs()};
function renderDocs(){
 if(!db)return;const r=db.transaction('docs','readonly').objectStore('docs').getAll();
 r.onsuccess=()=>{const q=$('#docSearch').value.toLowerCase(),box=$('#docList');box.innerHTML='';
 r.result.filter(d=>(d.name+' '+(d.category||'')).toLowerCase().includes(q)).forEach(d=>{
 const row=document.createElement('div');row.className='fileitem';const a=document.createElement('a');a.textContent=`📎 ${d.name} · ${d.category||'Altro'}`;a.href=URL.createObjectURL(d.blob);a.target='_blank';
 const del=document.createElement('button');del.textContent='Elimina';del.onclick=()=>db.transaction('docs','readwrite').objectStore('docs').delete(d.id).onsuccess=renderDocs;row.append(a,del);box.append(row)})}
}
$('#docSearch').oninput=renderDocs;
$('#saveDoc').onclick=()=>{const f=$('#docFile').files[0];if(!f)return alert('Seleziona un file');const name=$('#docName').value.trim()||f.name,category=$('#docCategory').value;
db.transaction('docs','readwrite').objectStore('docs').add({name,category,blob:f,created:Date.now()}).onsuccess=()=>{$('#docName').value='';$('#docFile').value='';renderDocs()}};

$('#askAssistant').onclick=()=>{
 const q=$('#assistantQuery').value.toLowerCase();let a='Non ho trovato una risposta. Prova con volo, Parkos, hotel, assicurazione, emergenze o spese.';
 if(q.includes('parcheg')||q.includes('parkos'))a='Hai prenotato il P3 Smart, Via Campo Grande a Bergamo. Codice 643HF8M, PIN UX4749. Non usare la corsia Telepass.';
 else if(q.includes('volo')||q.includes('parte'))a='Convocazione alle 07:45. Partenza prevista da Bergamo alle 10:15 e arrivo a Sharm alle 17:20.';
 else if(q.includes('hotel')||q.includes('resort'))a='Il resort è il Coral Sea Holiday Resort, nella zona di Nabq Bay.';
 else if(q.includes('male')||q.includes('medic')||q.includes('assicur'))a='Chiama Europ Assistance al +39 02 58 28 60 00 e comunica il riferimento AL2937488.';
 else if(q.includes('emerg')||q.includes('ambul'))a='Ambulanza 123, Polizia 122, Polizia turistica 126, Vigili del fuoco 180.';
 else if(q.includes('spes')||q.includes('totale'))a=`Hai registrato spese per € ${$('#expenseTotal').textContent}.`;
 $('#assistantAnswer').textContent=a;
};

if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js');
