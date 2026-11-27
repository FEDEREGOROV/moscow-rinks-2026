(() => {
  const tools = window.reviewToolkit;
  const luzhniki = rinks.find(rink => rink.name === 'Каток «Лужники»');
  const otherRinks = rinks.map((rink, index) => ({ rink, index })).filter(({ rink }) => rink !== luzhniki);
  const stored = new Map();
  let ratings = {};
  const directory = document.getElementById('rink-reviews-list');
  const search = document.getElementById('rink-reviews-search');
  const directoryCount = document.getElementById('other-rinks-count');
  const ratingsDate = document.getElementById('ratings-date');
  const dialog = document.getElementById('rink-reviews-dialog');
  const title = document.getElementById('rink-reviews-title');
  const address = document.getElementById('rink-reviews-address');
  const modalFile = document.getElementById('rink-reviews-file');
  const modalError = document.getElementById('rink-reviews-error');
  const modalEmpty = document.getElementById('rink-reviews-empty');
  const modalView = document.getElementById('rink-reviews-data-view');
  const modalSort = document.getElementById('rink-reviews-sort');
  const modalCount = document.getElementById('rink-reviews-count');
  const modalList = document.getElementById('rink-reviews-items');
  const modalWidget = document.getElementById('rink-reviews-widget-view');
  const modalWidgetSlot = document.getElementById('rink-reviews-widget-slot');
  const luzhnikiFile = document.getElementById('luzhniki-2gis-file');
  const luzhnikiError = document.getElementById('luzhniki-2gis-error');
  const luzhnikiEmpty = document.getElementById('luzhniki-2gis-empty');
  const luzhnikiView = document.getElementById('luzhniki-2gis-view');
  const luzhnikiSort = document.getElementById('luzhniki-2gis-sort');
  const luzhnikiCount = document.getElementById('luzhniki-2gis-count');
  const luzhnikiList = document.getElementById('luzhniki-2gis-list');
  let activeRink = null;
  let activeProvider = 'yandex';

  const key = (rinkName, provider) => `${rinkName}\u0000${provider}`;
  const sourceName = provider => provider === '2gis' ? '2ГИС' : 'Яндекс Картах';

  function setReviews(rinkName, provider, rows) {
    const parsed = tools.normalize(rows, provider);
    stored.set(key(rinkName, provider), parsed);
  }

  async function readFile(file, provider) {
    const content = await file.text();
    const parsed = file.name.toLowerCase().endsWith('.csv') ? tools.csvRows(content) : JSON.parse(content);
    const rows = Array.isArray(parsed) ? parsed : parsed.reviews;
    const normalized = tools.normalize(rows, provider);
    if (!normalized.length) throw new Error('В файле нет отзывов.');
    return normalized;
  }

  function draw(target, empty, count, list, sort, items, provider) {
    const available = Boolean(items?.length);
    target.hidden = !available;
    empty.hidden = available;
    if (!available) return;
    count.textContent = tools.reviewCount(items.length);
    tools.renderList(list, tools.sortReviews(items, sort.value), sourceName(provider));
  }

  function renderLuzhniki2Gis() {
    draw(luzhnikiView, luzhnikiEmpty, luzhnikiCount, luzhnikiList, luzhnikiSort, stored.get(key(luzhniki.name, '2gis')), '2gis');
  }

  function renderModal() {
    if (!activeRink) return;
    title.textContent = activeRink.name;
    address.textContent = `${activeRink.area} · ${activeRink.address}`;
    dialog.querySelectorAll('[data-review-provider]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.reviewProvider === activeProvider));
    });
    const source = activeProvider === '2gis' ? '2ГИС' : 'Яндекс Карт';
    modalEmpty.textContent = `Данные отзывов ${source} для этой площадки не загружены.`;
    const items = stored.get(key(activeRink.name, activeProvider));
    draw(modalView, modalEmpty, modalCount, modalList, modalSort, items, activeProvider);
    const yandexId = activeProvider === 'yandex' && !items?.length ? YANDEX_REVIEW_WIDGET_IDS[activeRink.name] : null;
    modalWidget.hidden = !yandexId;
    modalEmpty.hidden = Boolean(yandexId) || Boolean(items?.length);
    if (yandexId) {
      const iframe = document.createElement('iframe');
      iframe.className = 'reviews-widget';
      iframe.title = `Отзывы о катке ${activeRink.name} в Яндекс Картах`;
      iframe.src = `https://yandex.ru/maps-reviews-widget/${yandexId}?comments`;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      modalWidgetSlot.replaceChildren(iframe);
    } else {
      modalWidgetSlot.replaceChildren();
    }
  }

  function renderDirectory() {
    const term = search.value.trim().toLocaleLowerCase('ru');
    const matches = otherRinks.filter(({ rink }) => `${rink.name} ${rink.area} ${rink.address}`.toLocaleLowerCase('ru').includes(term));
    directoryCount.textContent = `${matches.length} из ${otherRinks.length}`;
    const fragment = document.createDocumentFragment();
    matches.forEach(({ rink, index }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rink-review-row';
      button.dataset.rinkIndex = String(index);
      const info = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = rink.name;
      const location = document.createElement('small');
      location.textContent = `${rink.area} · ${rink.address}`;
      info.append(name, location);
      const action = document.createElement('span');
      action.className = 'review-open';
      action.textContent = 'Открыть';
      const side = document.createElement('span');
      side.className = 'review-row-side';
      const rating = ratings[rink.name];
      if (rating) {
        const badge = document.createElement('span');
        badge.className = 'rink-review-rating';
        badge.title = 'Яндекс Карты · проверено ' + rating.checkedAt;
        badge.setAttribute('aria-label', 'Рейтинг Яндекс Карт: ' + rating.scoreText + ' из 5; ' + rating.countsText);
        const summary = document.createElement('span');
        summary.className = 'rink-review-rating-summary';
        const score = document.createElement('strong');
        score.textContent = rating.scoreText;
        const stars = document.createElement('span');
        stars.className = 'rink-review-stars';
        stars.setAttribute('aria-hidden', 'true');
        stars.textContent = '★★★★★';
        const filled = document.createElement('span');
        filled.className = 'rink-review-stars-filled';
        filled.textContent = '★★★★★';
        filled.style.width = Math.max(0, Math.min(100, rating.score / 5 * 100)) + '%';
        stars.append(filled);
        summary.append(score, stars);
        const counts = document.createElement('small');
        counts.textContent = rating.countsText;
        badge.append(summary, counts);
        side.append(badge);
      }
      side.append(action);
      button.append(info, side);
      fragment.append(button);
    });
    directory.replaceChildren(fragment);
  }

  directory.addEventListener('click', event => {
    const button = event.target.closest('[data-rink-index]');
    if (!button) return;
    activeRink = rinks[Number(button.dataset.rinkIndex)];
    activeProvider = 'yandex';
    modalSort.value = 'newest';
    modalFile.value = '';
    modalError.hidden = true;
    renderModal();
    dialog.showModal();
  });
  dialog.querySelectorAll('[data-review-provider]').forEach(button => button.addEventListener('click', () => {
    activeProvider = button.dataset.reviewProvider;
    modalSort.value = 'newest';
    modalFile.value = '';
    modalError.hidden = true;
    renderModal();
  }));
  document.getElementById('rink-reviews-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => modalWidgetSlot.replaceChildren());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  modalSort.addEventListener('change', renderModal);
  luzhnikiSort.addEventListener('change', renderLuzhniki2Gis);
  modalFile.addEventListener('change', async () => {
    if (!modalFile.files?.[0] || !activeRink) return;
    try {
      stored.set(key(activeRink.name, activeProvider), await readFile(modalFile.files[0], activeProvider));
      modalError.hidden = true;
      renderModal();
    } catch (cause) {
      modalError.textContent = `Не удалось открыть файл: ${cause.message}`;
      modalError.hidden = false;
    }
  });
  luzhnikiFile.addEventListener('change', async () => {
    if (!luzhnikiFile.files?.[0]) return;
    try {
      stored.set(key(luzhniki.name, '2gis'), await readFile(luzhnikiFile.files[0], '2gis'));
      luzhnikiError.hidden = true;
      renderLuzhniki2Gis();
    } catch (cause) {
      luzhnikiError.textContent = `Не удалось открыть файл: ${cause.message}`;
      luzhnikiError.hidden = false;
    }
  });
  search.addEventListener('input', renderDirectory);
  renderDirectory();
  renderLuzhniki2Gis();

  fetch('rink-review-ratings.json').then(response => response.ok ? response.json() : null).then(data => {
    if (!data?.ratings || typeof data.ratings !== 'object') return;
    ratings = data.ratings;
    const dates = [...new Set(Object.values(ratings).map(rating => rating.checkedAt))];
    if (dates.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(dates[0])) {
      const date = new Date(dates[0] + 'T12:00:00');
      ratingsDate.textContent = 'Оценки Яндекс Карт на ' + new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    }
    renderDirectory();
  }).catch(() => {});

  fetch('rink-reviews-data.json').then(response => response.ok ? response.json() : null).then(data => {
    if (!Array.isArray(data?.reviews)) return;
    const groups = new Map();
    data.reviews.forEach(entry => {
      if (!rinks.some(rink => rink.name === entry.rink) || !['yandex', '2gis'].includes(entry.provider)) return;
      const groupKey = key(entry.rink, entry.provider);
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(entry);
    });
    groups.forEach((rows, groupKey) => {
      const [rinkName, provider] = groupKey.split('\u0000');
      setReviews(rinkName, provider, rows);
    });
    renderLuzhniki2Gis();
    renderModal();
  }).catch(() => {});
})();
