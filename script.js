const overview = 'https://www.sravni.ru/novost/2026/11/24/gde-katatsya-na-konkah-v-moskve-zimoj-2026-27/';
const rink = (name, area, district, date, price, desc, extra = {}) => ({name, area, district, date, price, desc, source:overview, sourceLabel:'Обзор сезона 2026/27', evidence:'По городскому обзору', details:'Указана минимальная опубликованная стоимость входа. Точная цена зависит от даты и сеанса; прокат и льготы проверяйте при покупке.', rental:'Стоимость проката уточняйте при покупке билета.', ...extra});
const rinks = [
  rink('Северный речной вокзал','Север','Речной вокзал','20 ноября',450,'Просторный каток в парке у воды: прогулка по льду рядом с историческим зданием вокзала.',{open:true,source:'https://i.transport.mos.ru/katoksrv',sourceLabel:'Официальная страница катка',evidence:'Открытие подтверждено оператором; цена — по обзору',details:'Сезон заявлен с 20 ноября по 28 февраля. Сеансы: вт–чт 10:00–15:00 и 17:00–22:00; пт–вс вечерний сеанс до 23:00. Вход от 450 ₽ по обзору.'}),
  rink('ВДНХ','Северо-Восток','ВДНХ','24 ноября',500,'Большой каток вокруг центральных павильонов. Несколько павильонов проката, длинные сеансы и праздничная программа.',{open:true,source:'https://vdnh.ru/katok/',sourceLabel:'Официальный сайт ВДНХ',evidence:'Подтверждено оператором',rental:'Прокат коньков — 800 ₽; защита — 400 ₽; заточка — 500 ₽.',details:'Взрослый: вт–чт 500 ₽ утром / 800 ₽ вечером; пятница 600 / 1000 ₽; выходные 750 / 850 / 1000 ₽. Детский билет — 300–400 ₽ в обычные дни. Понедельник — технический день. Льготные и бесплатные билеты доступны отдельным категориям по правилам ВДНХ.'}),
  rink('Лужники','Центр','Спортивная','27 ноября',300,'Мультимедийный ледовый парк с разными форматами посещения: от стандартного до бизнес-павильона.',{source:'https://katok.luzhniki.ru/',sourceLabel:'Официальный сайт Лужников',evidence:'Подтверждено оператором',rental:'Прокат и заточка доступны; стоимость уточняется при выборе сеанса.',details:'Стандарт: взрослый 14+ от 300 ₽, дети 3–6 лет бесплатно, 7–13 лет — льготный тариф. Комфорт: взрослый от 700 ₽, дети 7–13 лет от 600 ₽. Бизнес: от 2500 ₽. Для отдельных социальных категорий — бесплатный билет. Итоговая цена зависит от сеанса.'}),
  rink('«Лёд» в Сокольниках','Восток','Сокольники','27 ноября',250,'Искусственный лёд на Фестивальной площади в одном из самых известных парков Москвы.'),
  rink('«Серебряный лёд»','Восток','Партизанская','27 ноября',275,'Парковый каток в Измайлове для прогулочного катания с друзьями и семьёй.'),
  rink('ГУМ-каток','Центр','Охотный Ряд','29 ноября',900,'Катание на Красной площади среди зимних огней и исторической архитектуры.',{source:'https://gum-katok.ru/',sourceLabel:'Официальный сайт ГУМ-катка',evidence:'Дата подтверждена оператором; цена — по обзору',free:true,rental:'Прокат оплачивается дополнительно в кассе катка.',details:'Сезон: 29 ноября 2026 — 28 февраля 2027. По городскому обзору, платные взрослые сеансы — от 900 ₽, детские — от 350 ₽. Утренние сеансы в будни могут быть бесплатными; наличие и исключения проверяйте при бронировании.'}),
  rink('Парк Горького','Центр','Парк культуры','4 декабря',300,'Более 18 000 м² льда: аллеи, пространство вокруг фонтана и участок Пушкинской набережной.',{source:'https://parkgorkogo.ru/rinks/',sourceLabel:'Официальный сайт Парка Горького',evidence:'Описание и услуги — оператор; дата и цена — по обзору',rental:'Прокат коньков — 800 ₽; билеты и услуги приобретаются онлайн.',details:'Дневной сеанс 10:00–15:00, вечерний 17:00–23:00. Вход от 300 ₽ по городскому обзору; цена конкретного сеанса видна при покупке. Есть льготные билеты для детей и отдельных категорий граждан.'}),
  rink('Царская набережная','Юг','Коломенская','27 ноября',300,'Протяжённый маршрут на льду вдоль Москвы-реки в музее-заповеднике «Коломенское».'),
  rink('Сад «Эрмитаж»','Центр','Чеховская','27 ноября',280,'Уютный каток в центре города с камерной атмосферой зимнего сада.'),
  rink('Сад имени Баумана','Центр','Красные Ворота','27 ноября',200,'Небольшая городская площадка для спокойного катания после работы или учёбы.'),
  rink('Парк «Красная Пресня»','Центр','Улица 1905 года','27 ноября',300,'Каток в парке рядом с деловым центром, удобный для короткого вечернего визита.'),
  rink('Парк 50-летия Октября','Запад','Проспект Вернадского','27 ноября',300,'Районный парковый каток для семейного отдыха на западе Москвы.'),
  rink('Каток на Таганке','Центр','Таганская','27 ноября',245,'Городской лёд рядом с Таганским парком и жилыми кварталами.'),
  rink('Live! Каток','Юго-Запад','Воронцовская','27 ноября',350,'Каток с искусственным льдом в усадьбе Воронцово.'),
  rink('Парк имени Юрия Лужкова','Юг','Каширская','27 ноября',350,'Парковый каток для жителей юга Москвы с вечерними сеансами.'),
  rink('Парк «Дубки»','Север','Тимирязевская','1 декабря',140,'Небольшой каток в зелёном районном парке.'),
  rink('Ангарские пруды','Север','Селигерская','1 декабря',140,'Лёд в парке у прудов для прогулочного и семейного катания.'),
  rink('Лианозовский парк','Северо-Восток','Алтуфьево','1 декабря',140,'Доступный районный каток в парковой зоне Лианозова.'),
  rink('«Метелица»','Северо-Восток','Бабушкинская','1 декабря',150,'Каток в Бабушкинском парке для жителей соседних районов.'),
  rink('Старопетровский проезд','Север','Войковская','1 декабря',140,'Локальная ледовая площадка для катания рядом с домом.'),
  rink('Ходынское поле','Север','ЦСКА','1 декабря',null,'Каток в современном ландшафтном парке; тариф сезона пока уточняется.'),
  rink('«Льдинка» в Митине','Северо-Запад','Митино','5 декабря',200,'Парковый каток для семейного катания в Митине.'),
  rink('«Северное сияние»','Северо-Запад','Митино','Ожидается',null,'Хоккейная коробка в парке Митино. Оператор пока сообщает о закрытии до нового сезона.',{source:'https://mitino.bapark.ru/dosug-i-razvlechenie/sport/hokkejnaya-korobka-severnoe-siyanie/',sourceLabel:'Официальная страница парка',evidence:'Дата и цена нового сезона не подтверждены оператором',details:'В обзоре сезона указано открытие 5 декабря и вход от 75 ₽, но официальная страница парка сообщает о закрытии до следующего зимнего сезона и показывает иной прежний тариф. Пока не включаем спорную цену в сравнение.'}),
  rink('Парк «Кузьминки»','Юго-Восток','Кузьминки','5 декабря',350,'Ледовая площадка в большом лесопарке на юго-востоке города.'),
  rink('Болотная площадь','Центр','Третьяковская','Ожидается',null,'Городская площадка прошлых сезонов. Открытие и регистрация на 2026/27 пока не подтверждены.',{free:true,details:'Дата открытия, расписание и порядок бесплатной регистрации на сезон 2026/27 пока не опубликованы. Не планируйте поездку без проверки городского сервиса.'}),
  rink('Московские сезоны','По всему городу','Разные районы','Ожидается',null,'Сеть бесплатных районных катков. Адреса и бронирование сезона 2026/27 ожидаются.',{free:true,details:'В прошлом сезоне работали 25 бесплатных катков. Список адресов и расписание на сезон 2026/27 пока не опубликованы; прошлогоднюю сеть не считаем открытой сейчас.'}),
  rink('Парк «Яуза»','Северо-Восток','Разные станции','Ожидается',null,'Несколько площадок вдоль Яузы. По городскому обзору, семь катков заливают к сезону.',{free:true,details:'Семь площадок готовят к сезону, но даты открытия и расписание пока не объявлены. Условия бесплатного катания и проката нужно уточнить после публикации расписания.'})
];
// Архивные снимки конкретных площадок. null означает, что подходящее фото не подтверждено.
const photos = [
  ['https://www.mos.ru/upload/newsfeed/articles/IVA_3526.jpg','https://moscowseasons.com/news/na-severnom-rechnom-vokzale-otkrylsia-besplatnyi-katok/','mos.ru'],
  ['https://s3.vdnh.ru/vdnhru/cache/2026/01/26/f2a7c3a0f9bddbc255592874e493a9ed2e42056c.jpg/c7a57dd23efc2828fdbf3267b82aef27.webp','https://vdnh.ru/places/pavilion-6/','ВДНХ'],
  ['https://aif-s3.aif.ru/images/044/303/4a8cc52c39c6d133e5c608225fd51fca.webp','https://aif.ru/society/gallery/mer-moskvy-sergey-sobyanin-otkryl-multimediynyy-katok-v-luzhnikah','АиФ'],
  ['https://wowhaus.ru/storage/app/uploads/public/1fd/c3e/ebb/thumb__1280_0_0_0_auto.jpg','https://wowhaus.ru/project/park-sokolniki','Wowhaus'],
  ['https://kudamoscow.ru/uploads/77bff98f103356996521fe65488e362f.jpg','https://kudamoscow.ru/event/katok-serebrjanyj-led-v-izmajlovskom-parke-2023-2024/','KudaMoscow'],
  ['https://gumrussia.com/upload/iblock/5c1/1400x1400.jpg','https://gumrussia.com/news/35136897/30.11.2023/','ГУМ'],
  ['https://kudamoscow.ru/uploads/129c3834ac7462f2af0eba1fc80bff33.jpg','https://kudamoscow.ru/event/katok-v-parke-gorkogo-20252026/','KudaMoscow'],
  ['https://www.m24.ru/b/d/nBkSUhL2h1Iuns6_JL6BrNOp2Z318Ji-mifGnuWR9mOBdDebBizCnTY8qdJf6ReJ58vU9meMMok3Ee2nhSR6ISeO9G1N_wjJ%3DBcuKgHQvol_fuktWBzs6uA.jpg','https://www.m24.ru/news/mehr-Moskvy/06012026/861887','Москва 24'],
  ['https://traveloo.ru/images/Moskva/Katki_2023/katkiMoscou_2022-2023_53.jpg','https://traveloo.ru/katki-moscow-2022-2023-datyi-otkryitiya-cenyi-grafik-rabotyi.html','Traveloo'],
  ['https://kudamoscow.ru/uploads/e91d1f5d21d6f9aea47b6c843fc86e08.jpeg','https://kudamoscow.ru/event/katok-v-sadu-imeni-baumana-2021-2022/','KudaMoscow'],
  ['https://kudamoscow.ru/uploads/69622a6c29b9d46a02fad1c470888a94.jpg','https://kudamoscow.ru/event/city-katok-v-parke-krasnaja-presnja-2021-2022/','KudaMoscow'],
  ['https://kudamoscow.ru/uploads/81b1a9a8071f352b518370b8a366a39d.jpg','https://kudamoscow.ru/event/katok-druzhby-v-parke-50-letija-oktjabrja-2023-2024/','KudaMoscow'],
  ['https://kudamoscow.ru/uploads/3e88c724501ca50c4caa261ed8eb119c.jpg','https://kudamoscow.ru/event/katok-v-taganskom-parke-20232024/','KudaMoscow'],
  ['https://www.usadba-vorontsovo.ru/upload/medialibrary/b76/sd1japn9kg2023hif2m41gv45jd1vkpv/Foto_258_resized.jpg','https://usadba-vorontsovo.ru/live-katok/','Усадьба Воронцово'],
  ['https://kudamoscow.ru/uploads/0a824dee2b48f09242771077eb8f3dbf.jpg','https://kudamoscow.ru/event/katok-v-parke-imeni-jurija-luzhkova-2024-2025/','KudaMoscow / mos.ru'],
  ['https://megaice-construction.ru/images/portfolio/gallery/full/park_dubki1.jpeg','https://megaice-construction.ru/portfolio/mobilnii-katok-park-kulturi-i-otdiha-dubki/','Mega Ice'],
  ['https://kudamoscow.ru/uploads/9aeeff825dc6bb970648dd9acca8f0cb.jpg','https://kudamoscow.ru/event/katok-v-parke-angarskie-prudy-2022-2023/','KudaMoscow'],
  ['https://cdn-imgproxy.mamado.su/cL6CHgXcd4BrPdnoJOR5M-CwogeYzvTEGuG2fpy15rg/rs%3Afit%3A2000%3A2000%3A1/g%3Ace/q%3A90/czM6Ly9tYW1hZG8t/YXBpLXByb2R1Y3Rp/b24vc3RvcmFnZS8x/MzI1Mjk0L3A1aXd1/THBYUVdJLmpwZw.webp','https://mamado.su/moskva/lianozovskii-park-kultury-i-otdyxa-id167753','Mamado'],
  ['https://kudamoscow.ru/uploads/4a2935020d435482159fb7ddd1a38b5a.jpg','https://kudamoscow.ru/event/katok-metelitsa-v-babushkinskom-parke-2022-2023/','KudaMoscow'],
  null,
  ['https://parkhodynka.ru/uploads/03e32778d34fd96ea313c06794b66eb3/ice.jpg','https://parkhodynka.ru/view.php?p=103','Парк «Ходынское поле»'],
  ['https://kudamoscow.ru/uploads/384d9e12e05cea26ddd654dc70aae2bc.jpg','https://kudamoscow.ru/event/katok-ldinka-v-parke-mitino-2022-2023/','KudaMoscow'],
  null,
  ['https://cdn-imgproxy.mamado.su/Tk-loaxc6i5GW-RTg0dK-iUs2TAyhk88S64YKLhsHq0/rs%3Afit%3A2000%3A2000%3A1/g%3Ace/q%3A90/czM6Ly9tYW1hZG8t/YXBpLXByb2R1Y3Rp/b24vc3RvcmFnZS8x/MzYxNTA3L2QwMzlk/OGU3NWU1YWM2NTE1/ZjAwYWJjNjllM2Y5/NjZmLmpwZw.webp','https://mamado.su/rossiya/e/katok-v-parke-kuzminki-id7544','Mamado'],
  ['https://live.mosmolodezh.ru/b/d/a35Vp9Tgu4ci9owR-pJHzB4WQ1otX69BK_YJonruioQoEnwoJvUA9yRzQamFU9yVcBI1koktVj1EqSLHfklJbFwowQiFJg%3D8jZeBh7f0lZFv7W2DsEtGg.jpg','https://live.mosmolodezh.ru/news/1522','mos.ru / Молодёжная редакция'],
  ['https://www.mos.ru/upload/newsfeed/articles/444acd326a9045396928862468c2f451/katki-serebryakova_068.jpg','https://www.mos.ru/news/item/134107073/','mos.ru / площадка сети'],
  ['https://park-yauza.info/upload/iblock/f69/jegmixf6mx1nb0b2v9zc2o3a47demzen/katok_v_sviblovo.jpg','https://park-yauza.info/katki/','Парк Яуза / Свиблово']
];
// Фото сети «Московские сезоны» показывает одну из площадок прошлых сезонов.
rinks.forEach((r,i)=>{r.photo=photos[i];});

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const priceText = r => r.price === null ? 'Не опубликована' : `от ${r.price} ₽`;
const gradients = ['linear-gradient(135deg,#387d89,#174458)','linear-gradient(135deg,#528e99,#244f69)','linear-gradient(135deg,#1e6679,#0c354d)','linear-gradient(135deg,#667fa0,#274766)'];
const cards = document.querySelector('#cards');
if (cards) {
  const search = document.querySelector('#search');
  const sort = document.querySelector('#sort');
  const resultCount = document.querySelector('#result-count');
  const empty = document.querySelector('#empty');
  const dialog = document.querySelector('#details');
  const detailsContent = document.querySelector('#details-content');
  let filter = 'all';
  function render() {
    const term = search.value.trim().toLocaleLowerCase('ru');
    let items = rinks.map((r,i)=>({...r,index:i})).filter(r => {
      const matches = `${r.name} ${r.area} ${r.district}`.toLocaleLowerCase('ru').includes(term);
      return matches && (filter==='all' || filter==='open'&&r.open || filter==='free'&&r.free || filter==='upcoming'&&!r.open);
    });
    if(sort.value==='price') items.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity) || a.name.localeCompare(b.name,'ru'));
    if(sort.value==='name') items.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    cards.innerHTML = items.map(r=>{
      const photo = r.photo;
      return `<article class="card"><div class="card-visual" style="--visual:${gradients[r.index%gradients.length]}">
        ${photo?`<img src="${escapeHtml(photo[0])}" alt="${escapeHtml(r.name)} — архивное фото площадки" loading="lazy" referrerpolicy="no-referrer">`:''}
        <span class="card-mark" aria-hidden="true">✳</span><span class="card-status ${r.open?'open':''}">${r.open?'Открыт 26 ноября':r.date==='Ожидается'?'Дата уточняется':'Открытие '+escapeHtml(r.date)}</span>
        <span class="photo-credit">${photo?`Архивное фото · ${escapeHtml(photo[2])}`:'Проверенное фото не найдено'}</span></div>
        <div class="card-body"><span class="card-location">${escapeHtml(r.area)} · ${escapeHtml(r.district)}</span><h3>${escapeHtml(r.name)}</h3>
        <p class="card-desc">${escapeHtml(r.desc)}</p><div class="card-bottom"><div class="price"><small>Взрослый вход</small><strong class="${r.price===null?'unknown':''}">${priceText(r)}</strong></div>
        <div class="date"><small>Данные</small>${r.evidence==='Подтверждено оператором'?'Оператор':r.evidence==='По городскому обзору'?'Обзор сезона':'Обзор + оператор'}</div></div>
        <button class="card-link" data-index="${r.index}" type="button" aria-label="Подробнее: ${escapeHtml(r.name)}">Тарифы, фото и источник</button></div></article>`;
    }).join('');
    cards.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.closest('.card-visual').classList.add('photo-error');}));
    resultCount.textContent = `Показано: ${items.length} из ${rinks.length}`;
    empty.hidden = items.length !== 0;
  }
  function showDetails(r){
    const photo = r.photo;
    detailsContent.innerHTML = `${photo?`<img class="dialog-photo" src="${escapeHtml(photo[0])}" alt="${escapeHtml(r.name)} — архивное фото" referrerpolicy="no-referrer">`:''}
      <p class="dialog-kicker">${escapeHtml(r.area)} · ${escapeHtml(r.district)}</p><h3 class="dialog-title">${escapeHtml(r.name)}</h3>
      ${photo?`<p class="photo-source">Архивное фото: <a href="${escapeHtml(photo[1])}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo[2])}</a>. Оформление сезона 2026/27 может отличаться.</p>`:'<p class="photo-source">Проверенное фото этой площадки не найдено.</p>'}
      <p class="dialog-description">${escapeHtml(r.desc)}</p><div class="dialog-grid"><div class="dialog-fact"><small>Статус на 26.11.2026</small><strong>${r.open?'Открыт':'Открытие: '+escapeHtml(r.date)}</strong></div>
      <div class="dialog-fact"><small>Взрослый вход</small><strong>${priceText(r)}</strong></div></div><div class="dialog-detail"><h4>Тарифы и посещение</h4><p>${escapeHtml(r.details)}</p></div>
      <div class="dialog-detail"><h4>Прокат</h4><p>${escapeHtml(r.rental)}</p></div><div class="dialog-detail"><h4>Качество данных</h4><p>${escapeHtml(r.evidence)}. Проверено 26 ноября 2026 года. Условия могут измениться.</p></div>
      <div class="dialog-actions"><a href="${escapeHtml(r.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.sourceLabel)}</a>
      ${r.source!==overview&&r.evidence!=='Подтверждено оператором'?`<a class="secondary" href="${overview}" target="_blank" rel="noopener noreferrer">Источник стартовой цены</a>`:''}
      <a class="secondary" href="https://yandex.ru/maps/?text=${encodeURIComponent('каток '+r.name+' Москва')}" target="_blank" rel="noopener noreferrer">Найти на карте</a></div>`;
    detailsContent.querySelector('.dialog-photo')?.addEventListener('error',e=>e.target.hidden=true);
    dialog.showModal();
  }
  document.querySelectorAll('.chip').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.filter;
    document.querySelectorAll('.chip').forEach(c=>{c.classList.toggle('active',c===button);c.setAttribute('aria-pressed',String(c===button));});
    render();
  }));
  search.addEventListener('input',render); sort.addEventListener('change',render);
  cards.addEventListener('click',e=>{const button=e.target.closest('[data-index]');if(button)showDetails(rinks[Number(button.dataset.index)]);});
  document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  render();
}
