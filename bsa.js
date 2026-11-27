(() => {
  const arenas = window.MOSCOW_ARENAS || [];
  const root = document.getElementById('bsa-content');
  if (!root) return;
  const page = location.pathname.split('/').pop();
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (url,label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const heading = (title,subtitle) => `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle} · 27 ноября 2026</p></div><span>5 стадионов</span></div>`;
  function catalog() {
    root.innerHTML = heading('Каталог стадионов Москвы','БСА «Лужники» и другие футбольные арены') + `<label class="bsa-search">Поиск <input id="bsa-search" type="search" placeholder="Найти стадион или адрес"></label><div id="bsa-cards" class="bsa-cards"></div>`;
    const cards = document.getElementById('bsa-cards');
    const render = () => {const q=document.getElementById('bsa-search').value.toLocaleLowerCase('ru').trim();cards.innerHTML=arenas.filter(a=>(a.name+' '+a.address).toLocaleLowerCase('ru').includes(q)).map(a=>`<article class="bsa-card"><img src="${esc(a.photo)}" alt="${esc(a.name)}" loading="lazy" onerror="this.hidden=true"><div class="bsa-card-body"><h2>${esc(a.name)}</h2><p>${esc(a.address)}</p><dl><div><dt>Футбольный матч</dt><dd>${esc(a.capacity)} зрителей</dd></div><div><dt>Концерт / мероприятие</dt><dd>${esc(a.concert)}</dd></div><div><dt>Форматы</dt><dd>${esc(a.formats)}</dd></div><div><dt>Аренда стадиона</dt><dd>${esc(a.rent)}</dd></div></dl><p>${link(a.site,'О стадионе')} · ${link(a.service,'Мероприятия и услуги')} · ${link(a.photoSource,'Источник фото')}</p></div></article>`).join('') || '<p>Ничего не найдено.</p>'};document.getElementById('bsa-search').addEventListener('input',render);render();
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
