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
  const format = value => new Intl.NumberFormat('ru-RU').format(Number(value) || 0);

  async function load() {
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
      document.getElementById('metrica-visits').textContent = format(data.totals.visits);
      document.getElementById('metrica-users').textContent = format(data.totals.users);
      document.getElementById('metrica-pageviews').textContent = format(data.totals.pageviews);
      rows.replaceChildren();
      for (const day of [...data.rows].sort((a,b) => b.date.localeCompare(a.date))) {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        date.textContent = /^\d{4}-\d{2}-\d{2}$/.test(day.date) ? new Intl.DateTimeFormat('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${day.date}T12:00:00`)) : day.date;
        row.append(date);
        for (const key of ['visits','users','pageviews']) {
          const cell = document.createElement('td');
          cell.textContent = format(day[key]);
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
      results.hidden = true;
      status.textContent = error.message;
    } finally {
      refresh.disabled = false;
    }
  }
  period.addEventListener('change', load);
  refresh.addEventListener('click', load);
  if (sessionStorage.getItem(passwordKey)) load();
  else document.addEventListener('access-unlocked', load, {once:true});
})();
