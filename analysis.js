const segmentDirect = new Set([0,1,2,3,4,5,6,7]);
const childPrice = {1:'от 300 ₽',2:'3–6 лет бесплатно; 7–13 льгота',5:'от 350 ₽*'};
const rentalPrice = {1:800,6:800};
const distinct = {
  0:'Парк у воды; длинный вечерний сеанс',1:'Масштаб, подробная сетка тарифов',2:'Мультимедиа; три уровня сервиса',
  3:'Крупный парковый каток',4:'Парковое катание в Измайлове',5:'Красная площадь; утро бесплатно*',
  6:'2,3 км дорожек; билеты онлайн',7:'Длинный маршрут у реки',8:'Камерная локация в центре',
  9:'Центр; спокойное катание',10:'После работы рядом с «Москва-Сити»',11:'Семейный районный парк',
  12:'Центральное расположение',13:'Усадебная среда',14:'Районный парк на юге',15:'Низкий стартовый вход',
  16:'Низкий стартовый вход',17:'Районная доступность',18:'Семейный формат',19:'Локальная площадка',
  20:'Парк Ходынское поле',21:'Семейный районный каток',22:'Хоккейная коробка; цена спорная',
  23:'Лесопарковая среда',24:'Бесплатный формат ожидает анонса',25:'Сеть районных площадок; анонс ожидается',
  26:'Семь площадок готовят к сезону'
};
const tbody = document.querySelector('#market-rows');
const input = document.querySelector('#analysis-search');
const segment = document.querySelector('#segment');
function sourceCell(r) {
  const official = r.source!==overview;
  const status = r.evidence==='Подтверждено оператором'?'Оператор':official?'Оператор + обзор':'Обзор сезона';
  return `<a href="${escapeHtml(r.source)}" target="_blank" rel="noopener noreferrer">${status}</a>${official&&r.evidence!=='Подтверждено оператором'?`<a href="${overview}" target="_blank" rel="noopener noreferrer">Цена / дата</a>`:''}`;
}
function renderMarket() {
  const term = input.value.trim().toLocaleLowerCase('ru');
  const rows = rinks.map((r,i)=>({...r,index:i})).filter(r=>{
    const matches=`${r.name} ${r.area} ${r.district}`.toLocaleLowerCase('ru').includes(term);
    return matches && (segment.value==='all' || segment.value==='direct'&&segmentDirect.has(r.index) || segment.value==='local'&&!segmentDirect.has(r.index) || segment.value==='pending'&&r.price===null);
  });
  tbody.innerHTML=rows.map(r=>{
    const rental=rentalPrice[r.index];
    const basket=rental!==undefined && r.price!==null ? `от ${r.price+rental} ₽†` : 'Н/д';
    return `<tr class="${r.index===2?'luzhniki-row':''}"><th scope="row"><strong>${escapeHtml(r.name)}</strong><small>${segmentDirect.has(r.index)?'Крупный конкурент':'Районный / ожидается'}</small></th>
      <td class="num">${priceText(r)}${r.index===5?'*':''}</td><td>${childPrice[r.index]??'Н/д'}</td><td>${rental!==undefined?`${rental} ₽`:'Н/д'}</td>
      <td class="num">${basket}</td><td>${r.open?'Открыт 26.11':escapeHtml(r.date)}</td><td>${escapeHtml(distinct[r.index])}</td><td class="source-cell">${sourceCell(r)}</td></tr>`;
  }).join('');
  document.querySelector('#table-count').textContent=`${rows.length} из ${rinks.length} площадок`;
}
input.addEventListener('input',renderMarket);
segment.addEventListener('change',renderMarket);
renderMarket();
