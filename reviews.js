(() => {
  const fileInput = document.getElementById('reviews-file');
  const sortInput = document.getElementById('reviews-sort');
  const list = document.getElementById('reviews-list');
  const count = document.getElementById('reviews-count');
  const dataView = document.getElementById('reviews-data-view');
  const widgetView = document.getElementById('reviews-widget-view');
  const error = document.getElementById('reviews-error');
  let reviews = [];

  function csvRows(source) {
    const header = source.split(/\r?\n/, 1)[0] || '';
    const delimiter = (header.match(/;/g) || []).length > (header.match(/,/g) || []).length ? ';' : ',';
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (char === '"') {
        if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell); cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && source[i + 1] === '\n') i += 1;
        row.push(cell); cell = '';
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
      } else cell += char;
    }
    if (quoted) throw new Error('В CSV не закрыты кавычки.');
    row.push(cell);
    if (row.some(value => value.trim())) rows.push(row);
    const names = (rows.shift() || []).map(value => value.trim().replace(/^\uFEFF/, '').toLowerCase());
    return rows.map(values => Object.fromEntries(names.map((name, index) => [name, values[index] || ''])));
  }

  function field(row, names) {
    for (const name of names) {
      const value = row[name];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
  }

  function dateValue(raw) {
    const value = raw.trim();
    const russian = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    const normalized = russian ? `${russian[3]}-${russian[2]}-${russian[1]}` : value;
    const time = Date.parse(normalized);
    if (!Number.isFinite(time)) throw new Error(`Некорректная дата: ${value}`);
    return time;
  }

  function normalize(rows, provider = 'yandex') {
    if (!Array.isArray(rows)) throw new Error('Нужен массив отзывов или объект с полем reviews.');
    return rows.map((original, index) => {
      if (!original || typeof original !== 'object') throw new Error(`Отзыв ${index + 1}: неверный формат.`);
      const row = Object.fromEntries(Object.entries(original).map(([key, value]) => [key.toLowerCase(), value]));
      const author = field(row, ['author', 'автор', 'имя']);
      const text = field(row, ['text', 'текст', 'отзыв']);
      const date = field(row, ['date', 'дата']);
      const rating = Number(field(row, ['rating', 'оценка', 'звезды']).replace(',', '.'));
      const url = field(row, ['url', 'ссылка']);
      if (!author || !text || !date || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error(`Отзыв ${index + 1}: нужны автор, текст, дата и оценка от 1 до 5.`);
      }
      let safeUrl = '';
      if (url) {
        const parsed = new URL(url);
        const allowed = provider === '2gis' ? ['2gis.ru', 'www.2gis.ru'] : ['yandex.ru', 'www.yandex.ru'];
        if (parsed.protocol !== 'https:' || !allowed.includes(parsed.hostname)) {
          throw new Error(`Отзыв ${index + 1}: ссылка не соответствует источнику.`);
        }
        safeUrl = parsed.href;
      }
      return { author, text, date: dateValue(date), rating, url: safeUrl, index };
    });
  }

  function render() {
    const order = sortInput.value;
    const sorted = sortReviews(reviews, order);
    const total = sorted.length;
    count.textContent = reviewCount(total);
    renderList(list, sorted, 'Яндекс Картах');
  }

  function sortReviews(items, order) {
    return [...items].sort((a, b) => {
      if (order === 'oldest') return a.date - b.date || a.index - b.index;
      if (order === 'highest') return b.rating - a.rating || b.date - a.date || a.index - b.index;
      if (order === 'lowest') return a.rating - b.rating || b.date - a.date || a.index - b.index;
      return b.date - a.date || a.index - b.index;
    });
  }

  function reviewCount(total) {
    const ending = total % 10 === 1 && total % 100 !== 11 ? 'отзыв' : total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 12 || total % 100 > 14) ? 'отзыва' : 'отзывов';
    return `${total} ${ending}`;
  }

  function renderList(target, items, sourceName) {
    const fragment = document.createDocumentFragment();
    items.forEach(review => {
      const item = document.createElement('article');
      item.className = 'review-item';
      const head = document.createElement('div');
      head.className = 'review-item-head';
      const author = document.createElement('span');
      author.className = 'review-item-author';
      author.textContent = review.author;
      const meta = document.createElement('span');
      meta.className = 'review-item-meta';
      meta.textContent = `${review.rating} из 5 · ${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(review.date)}`;
      head.append(author, meta);
      const body = document.createElement('p');
      body.className = 'review-item-text';
      body.textContent = review.text;
      item.append(head, body);
      if (review.url) {
        const link = document.createElement('a');
        link.className = 'review-item-link';
        link.href = review.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `Источник в ${sourceName}`;
        item.append(link);
      }
      fragment.append(item);
    });
    target.replaceChildren(fragment);
  }

  function show(rows) {
    reviews = normalize(rows);
    if (!reviews.length) return;
    error.hidden = true;
    dataView.hidden = false;
    widgetView.hidden = true;
    render();
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const source = await file.text();
      const parsed = file.name.toLowerCase().endsWith('.csv') ? csvRows(source) : JSON.parse(source);
      const rows = Array.isArray(parsed) ? parsed : parsed.reviews;
      show(rows);
      if (!rows.length) throw new Error('В файле нет отзывов.');
    } catch (cause) {
      error.textContent = `Не удалось открыть файл: ${cause.message}`;
      error.hidden = false;
    }
  });
  sortInput.addEventListener('change', render);
  window.reviewToolkit = { csvRows, normalize, sortReviews, reviewCount, renderList };
  fetch('reviews-data.json').then(response => response.ok ? response.json() : null).then(data => {
    if (data?.reviews?.length) show(data.reviews);
  }).catch(() => {});
})();
