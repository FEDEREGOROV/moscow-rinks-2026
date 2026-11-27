(() => {
  const arenas = window.MOSCOW_ARENAS || [];
  const root = document.getElementById('bsa-content');
  if (!root) return;
  const page = location.pathname.split('/').pop();
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (url,label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const heading = (title,subtitle) => `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle} · 27 ноября 2026</p></div><span>5 стадионов</span></div>`;
  function catalog() {
    root.innerHTML = heading('Каталог стадионов Москвы','БСА «Лужники» и другие футбольные арены') + `<section class="catalog" aria-label="Список стадионов"><div class="filters"><label class="searchbox"><span class="sr-only">Поиск</span><input id="bsa-search" type="search" placeholder="Название или адрес"></label><label class="sort-label">Порядок <select id="bsa-sort"><option value="catalog">По каталогу</option><option value="name">По названию</option><option value="capacity">По вместимости</option></select></label></div><div class="catalog-meta"><span id="bsa-result-count" aria-live="polite"></span><span>Данные операторов · 27 ноября 2026</span></div><div id="bsa-cards" class="cards"></div><p class="empty" id="bsa-empty" hidden>Ничего не найдено.</p></section><dialog id="bsa-catalog-dialog"><button class="close" type="button" aria-label="Закрыть">×</button><div id="bsa-catalog-content"></div></dialog>`;
    const cards = document.getElementById('bsa-cards');
    const dialog=document.getElementById('bsa-catalog-dialog');
    const render = () => {
      const q=document.getElementById('bsa-search').value.toLocaleLowerCase('ru').trim();
      const items=arenas.filter(a=>(a.name+' '+a.address).toLocaleLowerCase('ru').includes(q));
      const sort=document.getElementById('bsa-sort').value;
      if(sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
      if(sort==='capacity')items.sort((a,b)=>Number(b.capacity.replace(/\D/g,''))-Number(a.capacity.replace(/\D/g,'')));
      cards.innerHTML=items.map(a=>`<article class="card"><div class="card-visual"><img src="${esc(a.photo)}" alt="${esc(a.name)}" loading="lazy"><span class="photo-credit">Фото организатора</span></div><div class="card-body"><span class="card-location">${esc(a.address)}</span><h2>${esc(a.name)}</h2><p class="card-status-text">Футбольная арена</p><p class="card-desc">${esc(a.formats)}</p><div class="card-bottom"><div class="price"><small>Футбольный матч</small><strong>${esc(a.capacity)} мест</strong></div><div class="date"><small>Аренда арены</small>Цена не опубликована</div></div><button class="card-link" type="button" data-id="${esc(a.id)}">Все сведения и источники</button></div></article>`).join('');
      cards.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const box=img.closest('.card-visual');box.classList.add('missing-photo');box.textContent='Фото недоступно'}));
      document.getElementById('bsa-result-count').textContent=`Показано: ${items.length} из ${arenas.length}`;
      document.getElementById('bsa-empty').hidden=items.length!==0;
    };
    document.getElementById('bsa-search').addEventListener('input',render);document.getElementById('bsa-sort').addEventListener('change',render);render();
    cards.addEventListener('click',e=>{const button=e.target.closest('[data-id]');if(!button)return;const a=arenas.find(x=>x.id===button.dataset.id);document.getElementById('bsa-catalog-content').innerHTML=`<img class="dialog-photo" src="${esc(a.photo)}" alt="${esc(a.name)}"><p class="photo-source">Фото: ${link(a.photoSource,'официальный сайт')}</p><p class="dialog-kicker">${esc(a.address)}</p><h2 class="dialog-title">${esc(a.name)}</h2><div class="facts-list"><div><dt>Вместимость · футбольный матч</dt><dd>${esc(a.capacity)} зрителей</dd></div><div><dt>Концерт / мероприятие</dt><dd>${esc(a.concert)}</dd></div><div><dt>Форматы</dt><dd>${esc(a.formats)}</dd></div><div><dt>Аренда арены</dt><dd>${esc(a.rent)}</dd></div></div><section class="dialog-detail"><h4>Официальные ссылки</h4><div class="dialog-actions">${link(a.site,'Об арене')}${link(a.service,'Мероприятия и услуги')}</div></section>`;document.querySelector('#bsa-catalog-content .dialog-photo')?.addEventListener('error',e=>{e.target.hidden=true});dialog.showModal()});
    dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  }
  function mapPage() {
    root.innerHTML = heading('Стадионы на карте','Адреса площадок') + `<div class="bsa-map-layout"><div id="bsa-map" role="region" aria-label="Карта стадионов Москвы"></div><div class="bsa-map-list">${arenas.map(a=>`<button type="button" data-id="${a.id}"><strong>${esc(a.name)}</strong><span>${esc(a.address)}</span></button>`).join('')}</div></div><p class="table-note">Картографическая основа — ${link('https://www.openstreetmap.org/copyright','OpenStreetMap')}.</p>`;
    if (!window.L) {document.getElementById('bsa-map').textContent='Не удалось загрузить карту.';return}
    const map=L.map('bsa-map').setView([55.77,37.59],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);
    const markers=new Map();for(const a of arenas){const m=L.marker(a.coords).addTo(map).bindPopup(`<strong>${esc(a.name)}</strong><br>${esc(a.address)}<br>${link(a.site,'Официальный сайт')}`);markers.set(a.id,m)}
    document.querySelector('.bsa-map-list').addEventListener('click',e=>{const btn=e.target.closest('[data-id]');if(!btn)return;const a=arenas.find(x=>x.id===btn.dataset.id);map.setView(a.coords,14);markers.get(a.id).openPopup()});
  }
  function promotions() {
    const rows = [
      ['«ЛУКОЙЛ Арена»','Владельцам абонемента сезона 2026/27 — 20% на один билет на экскурсию','Сезон 2026/27','Абонемент РПЛ или РПЛ и Кубок России','https://spartak.com/more/subscriptions/abonements-spartak'],
      ['«ВЭБ Арена»','Дети до 6 лет включительно посещают экскурсию бесплатно','Опубликовано в FAQ; срок не указан','Билет на экскурсию приобретают онлайн или в кассах арены','https://pfc-cska.com/ru/fans/faq/'],
      ['«РЖД Арена»','10% на билеты домашних матчей ФК «Локомотив» по карте «Локомотив»','До 31 мая 2027','Оплата картой «Локомотив»; промокод ЛОКОКАРД','https://www.fclm.ru/lokocard/']
    ];
    root.innerHTML=heading('Акции и льготы стадионов','Опубликованные условия на официальных сайтах')+`<div class="table-scroll"><table class="market-table bsa-promo-table"><thead><tr><th>Стадион</th><th>Предложение</th><th>Период</th><th>Условия</th><th>Источник</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${link(r[4],'Официальная страница')}</td></tr>`).join('')}</tbody></table></div><p class="table-note">На проверенных страницах БСА «Лужники» и стадиона «Динамо» отдельные акции для аренды стадиона не опубликованы. Указанные предложения относятся к экскурсиям или матчам, а не к аренде арены.</p>`;
  }
  function reviews() {
    const lead=arenas[0];root.innerHTML=heading('Отзывы о стадионах','Виджеты Яндекс Карт')+`<h2>БСА «Лужники»</h2><iframe class="reviews-widget" title="Отзывы о БСА Лужники в Яндекс Картах" src="https://yandex.ru/maps-reviews-widget/${lead.yandex}?comments" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><h2 class="bsa-subtitle">Другие стадионы</h2><div class="bsa-review-list">${arenas.slice(1).map(a=>`<div class="bsa-review-row"><div><strong>${esc(a.name)}</strong><small>${esc(a.address)}</small></div><button type="button" data-id="${a.id}">Открыть</button></div>`).join('')}</div><dialog id="bsa-dialog" class="bsa-dialog"><button class="close" type="button" aria-label="Закрыть">×</button><div id="bsa-dialog-content"></div></dialog>`;
    const dialog=document.getElementById('bsa-dialog');document.querySelector('.bsa-review-list').addEventListener('click',e=>{const btn=e.target.closest('[data-id]');if(!btn)return;const a=arenas.find(x=>x.id===btn.dataset.id);document.getElementById('bsa-dialog-content').innerHTML=`<h2>${esc(a.name)}</h2><p>${esc(a.address)}</p><iframe class="reviews-widget" title="Отзывы: ${esc(a.name)}" src="https://yandex.ru/maps-reviews-widget/${a.yandex}?comments" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;dialog.showModal()});dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  }
  ({'bsa.html':catalog,'bsa-map.html':mapPage,'bsa-promotions.html':promotions,'bsa-reviews.html':reviews})[page]?.();
})();
