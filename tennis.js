(() => {
  const venues = window.MOSCOW_TENNIS || [];
  const root = document.getElementById('tennis-content');
  if (!root) return;
  const page = location.pathname.split('/').pop();
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const heading = (title, subtitle) => `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle} · данные проверены 27 ноября 2026</p></div><span>5 объектов</span></div>`;
  function catalog() {
    root.innerHTML = heading('Теннисные центры Москвы','Дворец тенниса «Лужники» и четыре центра') + `<label class="tennis-search">Поиск <input id="tennis-search" type="search" placeholder="Название или адрес"></label><div id="tennis-cards" class="tennis-cards"></div>`;
    const cards = document.getElementById('tennis-cards');
    const render = () => {
      const q = document.getElementById('tennis-search').value.toLocaleLowerCase('ru').trim();
      cards.innerHTML = venues.filter(v => (v.name+' '+v.address).toLocaleLowerCase('ru').includes(q)).map(v => `<article class="tennis-card"><img src="${esc(v.photo)}" alt="${esc(v.name)}" loading="lazy"><div><h2>${esc(v.name)}</h2><dl><dt>Адрес</dt><dd>${esc(v.address)}</dd><dt>Корты</dt><dd>${esc(v.courts)}</dd><dt>Покрытие</dt><dd>${esc(v.surface)}</dd><dt>Время работы</dt><dd>${esc(v.hours)}</dd><dt>Будни</dt><dd>${esc(v.weekday)}</dd><dt>Выходные</dt><dd>${esc(v.weekend)}</dd><dt>Игровой час</dt><dd>${esc(v.duration)}</dd></dl><p class="tennis-extra">${esc(v.extra)}</p><p class="tennis-links">${link(v.site,'Официальный сайт')} · ${link(v.price,'Тарифы')} · ${link(v.photoSource,'Источник фото')}</p></div></article>`).join('') || '<p>Ничего не найдено.</p>';
    };
    document.getElementById('tennis-search').addEventListener('input', render); render();
  }
  function comparison() {
    root.innerHTML = heading('Сравнение теннисных центров','Аренда крытых кортов по официальным тарифам') + `<div class="table-scroll"><table class="market-table tennis-compare"><thead><tr><th>Центр</th><th>Корты и покрытие</th><th>Будни</th><th>Выходные</th><th>Игровой час</th><th>Адрес</th><th>Источник</th></tr></thead><tbody>${venues.map(v=>`<tr class="${v.id==='luzhniki'?'luzhniki-row':''}"><th>${esc(v.name)}</th><td>${esc(v.courts)}</td><td>${esc(v.weekday)}</td><td>${esc(v.weekend)}</td><td>${esc(v.duration)}</td><td>${esc(v.address)}</td><td>${link(v.price,'Тариф оператора')}</td></tr>`).join('')}</tbody></table></div><p class="table-note">Указаны тарифы аренды корта, без тренера. Условия и длительность игрового часа приведены по каждому центру отдельно.</p><h2 class="tennis-subtitle">Тарифы по времени</h2><label class="tennis-search">Центр <select id="tennis-select">${venues.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('')}</select></label><div id="tennis-detail"></div>`;
    const select = document.getElementById('tennis-select');
    const detail = document.getElementById('tennis-detail');
    const render = () => {const v=venues.find(x=>x.id===select.value);detail.innerHTML=`<p><strong>${esc(v.name)}</strong> · ${esc(v.duration)}. ${esc(v.extra)}</p><div class="table-scroll"><table class="market-table tennis-tariff"><thead><tr><th>Корт / день</th><th>Часы по порядку</th><th>Цена за каждый интервал по порядку</th></tr></thead><tbody>${v.tariffs.map(t=>`<tr><th>${esc(t[0])}</th><td>${esc(t[1])}</td><td>${esc(t[2])}</td></tr>`).join('')}</tbody></table></div><p class="table-note">${link(v.price,'Официальный тариф')}</p>`};select.addEventListener('change',render);render();
  }
  function mapPage() {
    root.innerHTML = heading('Теннисные центры на карте','Адреса объектов') + `<div class="tennis-map-layout"><div id="tennis-map" role="region" aria-label="Карта теннисных центров Москвы"></div><div class="tennis-map-list">${venues.map(v=>`<button type="button" data-id="${esc(v.id)}"><strong>${esc(v.name)}</strong><small>${esc(v.address)}</small></button>`).join('')}</div></div><p class="table-note">Точки на карте ориентировочные. Основа: ${link('https://www.openstreetmap.org/copyright','OpenStreetMap')}.</p>`;
    if (!window.L) {document.getElementById('tennis-map').textContent='Карта не загрузилась.';return}
    const map=L.map('tennis-map').setView([55.76,37.56],10);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);
    const markers=new Map();for(const v of venues){markers.set(v.id,L.marker(v.coords).addTo(map).bindPopup(`<strong>${esc(v.name)}</strong><br>${esc(v.address)}<br>${link(v.site,'Официальный сайт')}`))}
    document.querySelector('.tennis-map-list').addEventListener('click',e=>{const btn=e.target.closest('[data-id]');if(!btn)return;const v=venues.find(x=>x.id===btn.dataset.id);map.setView(v.coords,14);markers.get(v.id).openPopup()});
  }
  function promotions() {
    const rows=[
      ['Дворец тенниса «Лужники»','Социальная аренда крытого корта','4 000 ₽ / 55 минут','Пн 12–14; ср, пт 13–14; пн, ср–вс 07–08. Многодетные семьи, пенсионеры, люди с инвалидностью, участники СВО и указанные в прайсе категории; подтверждающий документ; не более 1 часа в неделю',venues[0].price],
      ['«Мегаспорт Теннис»','Семейная скидка на занятия','10% каждому','Когда в клубе занимаются два человека из одной семьи; не скидка на аренду корта','https://www.mstennis.ru/price.aspx'],
      ['«СпортВсегда Янтарь»','Скидка на аренду корта','5%','При оплате аренды от трёх месяцев; только физическим лицам','https://tennisclubstrogino.ru/arenda/']
    ];
    root.innerHTML=heading('Акции и льготные тарифы','Опубликованные условия операторов')+`<div class="table-scroll"><table class="market-table tennis-promo"><thead><tr><th>Центр</th><th>Предложение</th><th>Размер</th><th>Условия</th><th>Источник</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${link(r[4],'Официальная страница')}</td></tr>`).join('')}</tbody></table></div><p class="table-note">Для «Спартака» и НТЦ на проверенных страницах аренды отдельные действующие акции не указаны.</p>`;
  }
  function reviews() {
    const lead=venues[0];root.innerHTML=heading('Отзывы о теннисных центрах','Виджеты Яндекс Карт')+`<h2>${esc(lead.name)}</h2><iframe class="reviews-widget" title="Отзывы о Дворце тенниса Лужники" src="https://yandex.ru/maps-reviews-widget/${lead.yandex}?comments" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><h2 class="tennis-subtitle">Другие центры</h2><div class="tennis-review-list">${venues.slice(1).map(v=>`<div class="tennis-review-row"><div><strong>${esc(v.name)}</strong><small>${esc(v.address)}</small></div><button type="button" data-id="${esc(v.id)}">Открыть</button></div>`).join('')}</div><dialog id="tennis-dialog" class="tennis-dialog"><button class="close" type="button" aria-label="Закрыть">×</button><div id="tennis-dialog-content"></div></dialog>`;
    const dialog=document.getElementById('tennis-dialog');document.querySelector('.tennis-review-list').addEventListener('click',e=>{const btn=e.target.closest('[data-id]');if(!btn)return;const v=venues.find(x=>x.id===btn.dataset.id);document.getElementById('tennis-dialog-content').innerHTML=`<h2>${esc(v.name)}</h2><p>${esc(v.address)}</p><iframe class="reviews-widget" title="Отзывы: ${esc(v.name)}" src="https://yandex.ru/maps-reviews-widget/${v.yandex}?comments" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;dialog.showModal()});dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>{document.getElementById('tennis-dialog-content').innerHTML=''});
  }
  ({'tennis.html':catalog,'tennis-analysis.html':comparison,'tennis-map.html':mapPage,'tennis-promotions.html':promotions,'tennis-reviews.html':reviews})[page]?.();
})();
