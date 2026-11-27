(() => {
  const endpoint = 'https://luzhniki-feedback-api.darkvxdbxn.chatgpt.site/api/metrica';
  const passwordKey = 'luzhniki-market-password-v1';
  const period = document.getElementById('metrica-period');
  const refresh = document.getElementById('metrica-refresh');
  const status = document.getElementById('metrica-status');
  const results = document.getElementById('metrica-results');
  const updated = document.getElementById('metrica-updated');
  const sampling = document.getElementById('metrica-sampling');
  const rows = document.getElementById('metrica-rows');
  const metric = document.getElementById('metrica-metric');
  const chart = document.getElementById('metrica-chart');
  const format = value => new Intl.NumberFormat('ru-RU').format(Number(value) || 0);
  const formatDecimal = value => new Intl.NumberFormat('ru-RU', {minimumFractionDigits:1,maximumFractionDigits:1}).format(Number(value) || 0);
  const formatPercent = value => `${formatDecimal(value)} %`;
  const formatDuration = value => {const seconds=Math.max(0,Math.round(Number(value)||0));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`};
  const metricNames = {visits:'Визиты', users:'Посетители', pageviews:'Просмотры', avgDuration:'Время на сайте', bounceRate:'Отказы', pageDepth:'Глубина просмотра'};
  const formatMetric = (key,value) => key === 'avgDuration' ? formatDuration(value) : key === 'bounceRate' ? formatPercent(value) : key === 'pageDepth' ? formatDecimal(value) : format(value);
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let dailyRows = [];
  let requestId = 0;

  function renderReport(name, data, cells) {
    const body = document.getElementById(`metrica-${name}-rows`);
    const table = document.getElementById(`metrica-${name}-table`);
    const empty = document.getElementById(`metrica-${name}-empty`);
    body.replaceChildren();
    table.hidden = !Array.isArray(data) || data.length === 0;
    empty.hidden = !table.hidden;
    if (table.hidden) {empty.textContent = data === null ? 'Отчёт Яндекс Метрики сейчас недоступен.' : 'За выбранный период данных нет.';return}
    for (const item of data) {
      const row = document.createElement('tr');
      for (const value of cells(item)) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      body.append(row);
    }
  }

  function svgElement(name, attributes = {}, label) {
    const element = document.createElementNS(svgNamespace, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (label !== undefined) element.textContent = label;
    return element;
  }

  function renderChart() {
    chart.replaceChildren();
    const key = metric.value;
    chart.setAttribute('aria-label', `${metricNames[key]} по дням за выбранный период`);
    if (!dailyRows.length) {
      chart.append(svgElement('text', {x:450, y:130, 'text-anchor':'middle', class:'chart-empty'}, 'Нет данных за выбранный период'));
      return;
    }

    const left = 58, right = 882, top = 18, bottom = 218;
    const highest = Math.max(...dailyRows.map(day => Number(day[key]) || 0), 1);
    const magnitude = 10 ** Math.floor(Math.log10(highest / 4));
    const interval = Math.max(1, [1, 2, 5, 10].map(number => number * magnitude).find(value => value >= highest / 4));
    const maximum = interval * 4;
    const x = index => dailyRows.length === 1 ? (left + right) / 2 : left + index * (right - left) / (dailyRows.length - 1);
    const y = value => bottom - (Number(value) || 0) / maximum * (bottom - top);

    for (let tick = 0; tick <= 4; tick++) {
      const value = maximum * tick / 4;
      const position = y(value);
      chart.append(svgElement('line', {x1:left, x2:right, y1:position, y2:position, class:'chart-grid'}));
      chart.append(svgElement('text', {x:left - 9, y:position + 5, 'text-anchor':'end', class:'chart-label'}, formatMetric(key,value)));
    }

    const labelCount = Math.min(5, dailyRows.length);
    const labelIndexes = new Set(Array.from({length:labelCount}, (_, index) => Math.round(index * (dailyRows.length - 1) / Math.max(labelCount - 1, 1))));
    for (const index of labelIndexes) {
      const date = dailyRows[index].date;
      const label = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date.slice(8,10)}.${date.slice(5,7)}` : date;
      chart.append(svgElement('text', {x:x(index), y:247, 'text-anchor':'middle', class:'chart-label'}, label));
    }

    const points = dailyRows.map((day, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)} ${y(day[key]).toFixed(1)}`).join(' ');
    chart.append(svgElement('path', {d:points, class:'chart-line'}));
    if (dailyRows.length <= 31) {
      for (const [index, day] of dailyRows.entries()) {
        const point = svgElement('circle', {cx:x(index), cy:y(day[key]), r:4, class:'chart-point'});
        point.append(svgElement('title', {}, `${day.date}: ${formatMetric(key,day[key])}`));
        chart.append(point);
      }
    }
  }

  async function load() {
    const currentRequest = ++requestId;
    refresh.disabled = true;
    status.hidden = false;
    status.textContent = 'Загрузка данных…';
    try {
      const response = await fetch(`${endpoint}?days=${period.value}`, {
        headers:{'X-Luzhniki-Password':sessionStorage.getItem(passwordKey) || ''},
        cache:'no-store'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 503) throw new Error('Доступ к данным Яндекс Метрики ещё не подключён.');
        if (response.status === 401) throw new Error('Сессия истекла. Обновите страницу и войдите снова.');
        if (error.error === 'No access to Yandex Metrica counter') throw new Error('Нет доступа к счётчику Яндекс Метрики.');
        throw new Error('Не удалось загрузить данные Яндекс Метрики.');
      }
      const data = await response.json();
      if (currentRequest !== requestId) return;
      document.getElementById('metrica-visits').textContent = format(data.totals.visits);
      document.getElementById('metrica-users').textContent = format(data.totals.users);
      document.getElementById('metrica-pageviews').textContent = format(data.totals.pageviews);
      document.getElementById('metrica-duration').textContent = formatDuration(data.totals.avgDuration);
      document.getElementById('metrica-bounce').textContent = formatPercent(data.totals.bounceRate);
      document.getElementById('metrica-depth').textContent = formatDecimal(data.totals.pageDepth);
      dailyRows = [...data.rows].sort((a,b) => a.date.localeCompare(b.date));
      renderChart();
      const organic = Array.isArray(data.sources) ? data.sources.find(item => item.id === 'organic' || /поисков/i.test(item.name)) : null;
      document.getElementById('metrica-organic').textContent = organic ? format(organic.visits) : '—';
      document.getElementById('metrica-organic-share').textContent = organic && data.totals.visits ? `${formatPercent(100*organic.visits/data.totals.visits)} всех визитов` : '';
      renderReport('sources', data.sources, item => [item.name,format(item.visits),data.totals.visits ? formatPercent(100*item.visits/data.totals.visits) : '—',formatPercent(item.bounceRate),formatDuration(item.avgDuration)]);
      renderReport('engines', data.searchEngines, item => [item.name,format(item.visits)]);
      renderReport('phrases', data.searchPhrases, item => [item.name,format(item.visits)]);
      renderReport('entrances', data.organicEntrances, item => [item.name,format(item.visits),formatPercent(item.bounceRate),formatDuration(item.avgDuration)]);
      rows.replaceChildren();
      for (const day of [...dailyRows].reverse()) {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.textContent = /^\d{4}-\d{2}-\d{2}$/.test(day.date) ? new Intl.DateTimeFormat('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${day.date}T12:00:00`)) : day.date;
        row.append(date);
        for (const key of ['visits','users','pageviews','avgDuration','bounceRate','pageDepth']) {
          const cell = document.createElement('td');
          cell.textContent = formatMetric(key,day[key]);
          row.append(cell);
        }
        rows.append(row);
      }
      sampling.hidden = !data.sampled;
      if (data.sampled) sampling.textContent = `Данные рассчитаны по выборке${data.sampleShare ? ` (${Math.round(data.sampleShare * 100)} %)` : ''}.`;
      updated.textContent = `Обновлено ${new Intl.DateTimeFormat('ru-RU', {day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'}).format(new Date(data.updatedAt))}`;
      results.hidden = false;
      status.hidden = true;
    } catch (error) {
      if (currentRequest !== requestId) return;
      results.hidden = true;
      status.textContent = error.message;
    } finally {
      if (currentRequest === requestId) refresh.disabled = false;
    }
  }
  period.addEventListener('change', load);
  metric.addEventListener('change', renderChart);
  refresh.addEventListener('click', load);
  if (sessionStorage.getItem(passwordKey)) load();
  else document.addEventListener('access-unlocked', load, {once:true});
})();
