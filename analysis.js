const tbody=document.querySelector('#market-rows');
const input=document.querySelector('#analysis-search');
const segment=document.querySelector('#segment');

function tariffPreview(r){
  if(!r.tariffs.length)return '<span class="muted">Подробная сетка не опубликована</span>';
  const preview=r.tariffs.slice(0,2).map(([label,value])=>`<div class="tariff-preview-line"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`).join('');
  return `${preview}${r.tariffs.length>2?`<span class="muted">Остальные позиции: ${r.tariffs.length-2}</span>`:''}`;
}

function officialLinks(r){
  const photoLabel=/прежн|предыдущ/i.test(r.photoNote||'')?'Фото прежнего сезона':'Фото';
  const links=[['Источник',r.source],...(r.moreSources||[]),...(r.photo?[[photoLabel,r.photoSource||r.source]]:[]),...r.socials];
  const seen=new Set();
  return links.filter(([,url])=>{if(seen.has(url))return false;seen.add(url);return true;})
    .map(([label,url])=>link(label,url)).join('');
}

function detailsRow(r,index){
  const tariffs=r.tariffs.length
    ? `<section><h3>Тарифы сезона 2026/27</h3><dl class="market-tariffs">${r.tariffs.map(([label,value])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl></section>`
    : '<section><h3>Тарифы сезона 2026/27</h3><p>Подробная сетка не опубликована в указанном источнике.</p></section>';
  const facts=r.facts.length
    ? `<section><h3>Сведения оператора</h3><ul>${r.facts.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul></section>`
    : '';
  const fullTariffs=r.name==='ГУМ-каток'?gumTariffsHtml():'';
  return `<tr class="market-detail-row" id="market-detail-${index}" hidden><td colspan="9"><div class="market-detail-grid">${tariffs}${facts}</div>${fullTariffs}</td></tr>`;
}

function renderMarket(){
  const term=input.value.trim().toLocaleLowerCase('ru');
  let rows=rinks.map((r,index)=>({...r,index})).filter(r=>{
    const searchable=[r.name,r.area,r.address,r.status,r.hours,r.adult,r.child,r.rental,...r.facts,...r.tariffs.flat()].join(' ').toLocaleLowerCase('ru');
    return searchable.includes(term);
  });
  if(segment.value==='published')rows=rows.filter(r=>r.priceSort!==null);
  if(segment.value==='pending')rows=rows.filter(r=>r.priceSort===null);
  if(segment.value==='detailed')rows=rows.filter(r=>r.tariffs.length>0);
  if(segment.value==='free')rows=rows.filter(isFree);
  tbody.innerHTML=rows.map(r=>`<tr class="market-row ${r.name==='Каток «Лужники»'?'luzhniki-row':''}"><th scope="row">${escapeHtml(r.name)}<small>${escapeHtml(r.area)}</small><button class="detail-toggle" type="button" data-detail="${r.index}" aria-expanded="false" aria-controls="market-detail-${r.index}">Все сведения</button></th><td>${escapeHtml(r.status)}</td><td class="num">${escapeHtml(r.adult)}</td><td>${escapeHtml(r.child)}</td><td>${escapeHtml(r.rental)}</td><td class="tariff-preview">${tariffPreview(r)}</td><td>${escapeHtml(r.hours)}</td><td>${escapeHtml(r.address)}</td><td class="source-cell">${officialLinks(r)}</td></tr>${detailsRow(r,r.index)}`).join('');
  document.querySelector('#table-count').textContent=`${rows.length} из ${rinks.length}`;
}

tbody.addEventListener('click',event=>{
  const button=event.target.closest('button[data-detail]');
  if(!button)return;
  const detail=document.getElementById(`market-detail-${button.dataset.detail}`);
  detail.hidden=!detail.hidden;
  button.setAttribute('aria-expanded',String(!detail.hidden));
  button.textContent=detail.hidden?'Все сведения':'Свернуть сведения';
});
input.addEventListener('input',renderMarket);
segment.addEventListener('change',renderMarket);
renderMarket();
