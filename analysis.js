const tbody=document.querySelector('#market-rows');
const input=document.querySelector('#analysis-search');
const segment=document.querySelector('#segment');
function renderMarket(){
  const term=input.value.trim().toLocaleLowerCase('ru');
  let rows=rinks.filter(r=>`${r.name} ${r.area} ${r.address}`.toLocaleLowerCase('ru').includes(term));
  if(segment.value==='published')rows=rows.filter(r=>r.priceSort!==null);
  if(segment.value==='pending')rows=rows.filter(r=>r.priceSort===null);
  if(segment.value==='free')rows=rows.filter(r=>r.adult==='Бесплатно'||r.adult.startsWith('Будни утром бесплатно'));
  tbody.innerHTML=rows.map(r=>`<tr class="${r.name==='Каток «Лужники»'?'luzhniki-row':''}"><th scope="row">${escapeHtml(r.name)}<small>${escapeHtml(r.area)}</small></th><td>${escapeHtml(r.status)}</td><td class="num">${escapeHtml(r.adult)}</td><td>${escapeHtml(r.child)}</td><td>${escapeHtml(r.rental)}</td><td>${escapeHtml(r.hours)}</td><td>${escapeHtml(r.address)}</td><td class="source-cell">${link('Официальный источник',r.source)}</td></tr>`).join('');
  document.querySelector('#table-count').textContent=`${rows.length} из ${rinks.length}`;
}
input.addEventListener('input',renderMarket);segment.addEventListener('change',renderMarket);renderMarket();
