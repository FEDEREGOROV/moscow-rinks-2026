const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (label,url,cls='') => `<a${cls?` class="${cls}"`:''} href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
const isFree = r => r.adult === 'Бесплатно' || r.adult.startsWith('Будни утром бесплатно');
const cards = document.querySelector('#cards');
const countHeading = document.querySelector('#heading-count');
if (countHeading) {
  const n = rinks.length;
  const form = n % 10 === 1 && n % 100 !== 11 ? 'площадка' : [2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100) ? 'площадки' : 'площадок';
  countHeading.textContent = `${n} ${form}`;
}
function gumTariffsHtml() {
  const types = {0:'Взрослый',1:'Дети 7–12 лет',2:'Пенсионеры, участники СВО и члены семей, многодетные 13+',3:'Дети до 6 лет',5:'Льготные категории'};
  return `<section class="dialog-detail"><h4>Полная таблица ГУМ-катка</h4><p>Колонки: будни 10:00–14:30 · будни 15:00–22:00 · выходные и праздники 10:00–22:00.</p>${gumFullTariffs.map((period,i)=>`<details class="tariff-period" ${i===0?'open':''}><summary>${escapeHtml(period.period)}</summary><div class="tariff-scroll"><table><thead><tr><th>Услуга</th><th>Будни до 14:30</th><th>Будни после 15:00</th><th>Выходные/праздники</th></tr></thead><tbody>${period.items.map(row=>{const title=`${row.title}${types[row.type]?` · ${types[row.type]}`:''}`;const cells=Array.isArray(row.prices)?row.prices.map(p=>`<td>${escapeHtml(p===null?'Бесплатно':`${p} ₽`)}</td>`).join(''):`<td colspan="3">${escapeHtml(row.prices===-1?'Бесплатно при покупке взрослого билета':row.prices??'—')}</td>`;return `<tr><th>${escapeHtml(title)}</th>${cells}</tr>`}).join('')}</tbody></table></div>${link('Официальная таблица',period.source)}</details>`).join('')}</section>`;
}
if (cards) {
  const search=document.querySelector('#search');
  const sort=document.querySelector('#sort');
  const resultCount=document.querySelector('#result-count');
  const empty=document.querySelector('#empty');
  const dialog=document.querySelector('#details');
  const content=document.querySelector('#details-content');
  let filter='all';
  function render(){
    const term=search.value.trim().toLocaleLowerCase('ru');
    let items=rinks.map((r,index)=>({...r,index})).filter(r=>{
      const match=`${r.name} ${r.area} ${r.address}`.toLocaleLowerCase('ru').includes(term);
      return match && (filter==='all'||filter==='open'&&r.statusType==='open'||filter==='free'&&isFree(r)||filter==='pending'&&r.statusType!=='open');
    });
    if(sort.value==='price')items.sort((a,b)=>(a.priceSort??Infinity)-(b.priceSort??Infinity)||a.name.localeCompare(b.name,'ru'));
    if(sort.value==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    cards.innerHTML=items.map(r=>`<article class="card">${r.photo?`<div class="card-visual"><img src="${escapeHtml(r.photo)}" alt="${escapeHtml(r.name)}" loading="lazy" referrerpolicy="no-referrer"><span class="photo-credit">${escapeHtml(r.photoNote||'Фото организатора')}</span></div>`:`<div class="card-visual missing-photo">Фото площадки на официальном сайте не найдено</div>`}<div class="card-body"><span class="card-location">${escapeHtml(r.area)} · ${escapeHtml(r.address)}</span><h2>${escapeHtml(r.name)}</h2><p class="card-status-text">${escapeHtml(r.status)}</p><div class="card-bottom"><div class="price"><small>Взрослый вход</small><strong class="${r.priceSort===null?'unknown':''}">${escapeHtml(r.adult)}</strong></div><div class="date"><small>Прокат</small>${escapeHtml(r.rental)}</div></div><button class="card-link" type="button" data-index="${r.index}">Все сведения и источники</button></div></article>`).join('');
    cards.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const el=img.closest('.card-visual');el.classList.add('missing-photo');el.textContent='Фото недоступно';}));
    resultCount.textContent=`Показано: ${items.length} из ${rinks.length}`;
    empty.hidden=items.length!==0;
  }
  function showDetails(r){
    const facts=[['Статус',r.status],['Адрес',r.address],['Часы',r.hours],['Взрослый вход',r.adult],['Детский билет',r.child],['Прокат',r.rental]];
    content.innerHTML=`${r.photo?`<img class="dialog-photo" src="${escapeHtml(r.photo)}" alt="${escapeHtml(r.name)}" referrerpolicy="no-referrer"><p class="photo-source">${escapeHtml(r.photoNote||'Фото организатора')} · ${link('источник фото',r.photoSource||r.source)}</p>`:''}<p class="dialog-kicker">${escapeHtml(r.area)}</p><h2 class="dialog-title">${escapeHtml(r.name)}</h2><div class="facts-list">${facts.map(([k,v])=>`<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</div>${r.tariffs.length?`<section class="dialog-detail"><h4>Тарифы сезона 2026/27</h4><div class="tariffs">${r.tariffs.map(([k,v])=>`<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</div></section>`:''}${r.name==='ГУМ-каток'?gumTariffsHtml():''}${r.facts.length?`<section class="dialog-detail"><h4>Сведения площадки</h4><ul>${r.facts.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul></section>`:''}<div class="dialog-detail"><h4>Официальные ссылки</h4><div class="dialog-actions">${link('Страница или документ катка',r.source)}${(r.moreSources||[]).map(([label,url])=>link(label,url)).join('')}${r.socials.map(([label,url])=>link(label,url)).join('')}</div></div>`;
    content.querySelector('.dialog-photo')?.addEventListener('error',e=>{e.target.hidden=true;});
    dialog.showModal();
  }
  document.querySelectorAll('.chip').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('.chip').forEach(c=>{c.classList.toggle('active',c===button);c.setAttribute('aria-pressed',String(c===button));});render();}));
  search.addEventListener('input',render);sort.addEventListener('change',render);
  cards.addEventListener('click',e=>{const button=e.target.closest('[data-index]');if(button)showDetails(rinks[Number(button.dataset.index)]);});
  document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  render();
}
