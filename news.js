(() => {
  const feed = document.body.dataset.newsFeed;
  const list = document.getElementById('news-list');
  if (!list || !['luzhniki', 'rinks'].includes(feed)) return;
  const search = document.getElementById('news-search');
  const source = document.getElementById('news-source');
  const count = document.getElementById('news-count');
  const total = document.getElementById('news-total');
  const updated = document.getElementById('news-updated');
  const more = document.getElementById('news-more');
  const refresh = document.getElementById('news-refresh');
  const empty = document.getElementById('news-empty');
  const remote = 'https://raw.githubusercontent.com/FEDEREGOROV/moscow-rinks-2026/main/news-data.json';
  const liveApi = 'https://luzhniki-feedback-api.darkvxdbxn.chatgpt.site/api/news';
  const passwordKey = 'luzhniki-market-password-v1';
  const dateFormat = new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Moscow',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const dayFormat = new Intl.DateTimeFormat('ru-RU', {timeZone:'UTC',day:'numeric',month:'long',year:'numeric'});
  const timeFormat = new Intl.DateTimeFormat('ru-RU', {timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit'});
  let items = [];
  let limit = 30;
  let lastSnapshotAt = null;
  let loading = false;

  const validUrl = value => {try {const url = new URL(value);return url.protocol === 'https:' ? url.href : null} catch {return null}};
  const formatDate = value => {const date = new Date(value);return Number.isFinite(date.getTime()) ? (/^\d{4}-\d{2}-\d{2}$/.test(value) ? dayFormat : dateFormat).format(date) : 'Дата не указана'};
  const render = () => {
    const term = search.value.toLocaleLowerCase('ru').trim();
    const found = items.filter(item => (source.value === 'all' || item.source === source.value) && item.title.toLocaleLowerCase('ru').includes(term));
    list.replaceChildren(...found.slice(0, limit).map(item => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = validUrl(item.url) || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.title;
      const meta = document.createElement('div');
      meta.className = 'news-meta';
      const date = document.createElement('time');
      date.dateTime = item.publishedAt;
      date.textContent = formatDate(item.publishedAt);
      const publisher = document.createElement(validUrl(item.sourceUrl) ? 'a' : 'span');
      publisher.textContent = item.source;
      if (publisher.tagName === 'A') {
        publisher.href = validUrl(item.sourceUrl);
        publisher.target = '_blank';
        publisher.rel = 'noopener noreferrer';
      }
      meta.append(date, publisher);
      row.append(link, meta);
      return row;
    }));
    count.textContent = `${found.length} публикаций`;
    const publishers = new Set(items.map(item => item.source)).size;
    total.textContent = `${items.length} публикаций · ${publishers} изданий и сайтов`;
    empty.hidden = found.length !== 0;
    more.hidden = found.length <= limit;
  };
  const setData = data => {
    if (!data || !data.feeds || !Array.isArray(data.feeds[feed])) throw Error('Неверный формат ленты');
    items = data.feeds[feed].filter(item => item && typeof item.title === 'string' && typeof item.source === 'string' && validUrl(item.url));
    items.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    lastSnapshotAt = data.updatedAt;
    const chosen = source.value;
    source.replaceChildren(new Option('Все издания', 'all'), ...[...new Set(items.map(item => item.source))].sort((a,b) => a.localeCompare(b,'ru')).map(name => new Option(name,name)));
    if ([...source.options].some(option => option.value === chosen)) source.value = chosen;
    render();
  };
  const getJson = async url => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {const response = await fetch(url, {cache:'no-store',signal:controller.signal});if (!response.ok) throw Error(`HTTP ${response.status}`);return await response.json()}
    finally {clearTimeout(timer)}
  };
  const getLive = async method => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), method === 'POST' ? 90000 : 12000);
    try {
      const response = await fetch(liveApi, {method, headers:{'X-Luzhniki-Password':sessionStorage.getItem(passwordKey) || ''},cache:'no-store',signal:controller.signal});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const body = await response.json();
      return body.data;
    } finally {clearTimeout(timer)}
  };
  const latestSnapshot = async () => {
    const version = Date.now();
    const [live, published] = await Promise.allSettled([getLive('GET'),getJson(`news-data.json?t=${version}`).catch(() => getJson(`${remote}?t=${version}`))]);
    const candidates = [live,published].filter(result => result.status === 'fulfilled' && result.value?.feeds).map(result => result.value);
    if (!candidates.length) throw Error('Нет доступной ленты');
    return candidates.sort((a,b) => Date.parse(b.updatedAt || 0)-Date.parse(a.updatedAt || 0))[0];
  };
  const waitForFullSync = async since => {
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 15000));
      try {
        const snapshot = await getJson(`news-data.json?t=${Date.now()}`);
        if (Date.parse(snapshot.updatedAt) <= Date.parse(since)) continue;
        setData(snapshot);
        updated.textContent = `Полная выгрузка опубликована: ${formatDate(snapshot.updatedAt)}.`;
        return;
      } catch { /* Продолжаем ждать публикацию. */ }
    }
    updated.textContent += ' Сбор ещё выполняется; новая выгрузка появится автоматически.';
  };
  const load = async (manual = false) => {
    if (loading) return;
    loading = true;
    const previousIds = new Set(items.map(item => item.id));
    const hadData = items.length > 0;
    refresh.disabled = true;
    refresh.textContent = 'Проверка…';
    if (manual) updated.textContent = 'Проверяю 8 каналов сбора…';
    try {
      const snapshot = manual ? await getLive('POST') : await latestSnapshot();
      setData(snapshot);
      const newCount = items.filter(item => !previousIds.has(item.id)).length;
      const checkedAt = timeFormat.format(new Date());
      const checked = Array.isArray(snapshot.sources) ? snapshot.sources.filter(item => item.ok).length : null;
      const failed = Array.isArray(snapshot.sources) ? snapshot.sources.filter(item => !item.ok).map(item => item.name) : [];
      const fullSyncMessage = ['started','pending'].includes(snapshot.fullSync) ? ' Полная проверка запущена в GitHub Actions; ожидаю новую выгрузку.' : '';
      updated.textContent = `${manual ? (newCount ? `Новых публикаций: ${newCount}. ` : 'Новых публикаций нет. ') : ''}${checked === null ? '' : `Доступно каналов сбора: ${checked} из ${snapshot.sources.length}. `}${failed.length ? `Недоступны: ${failed.join(', ')}. ` : ''}Сбор: ${formatDate(lastSnapshotAt)} · открыто в ${checkedAt}.${fullSyncMessage}`;
      if (manual && fullSyncMessage) void waitForFullSync(snapshot.updatedAt);
    }
    catch {
      if (!hadData) {updated.textContent = 'Не удалось загрузить новости.';render()}
      else updated.textContent = `Не удалось проверить источники. Показаны данные от ${formatDate(lastSnapshotAt)}.`;
    }
    finally {refresh.disabled = false;refresh.textContent = 'Обновить';loading = false}
  };
  search.addEventListener('input', () => {limit = 30;render()});
  source.addEventListener('change', () => {limit = 30;render()});
  more.addEventListener('click', () => {limit += 30;render()});
  refresh.addEventListener('click', () => load(true));
  load();
  setInterval(() => load(), 5 * 60 * 1000);
})();
