(() => {
  const endpoint = 'https://luzhniki-feedback-api.darkvxdbxn.chatgpt.site/api/feedback';
  const passwordKey = 'luzhniki-market-password-v1';
  const form = document.getElementById('feedback-form');
  const input = document.getElementById('feedback-text');
  const list = document.getElementById('feedback-list');
  const empty = document.getElementById('feedback-empty');
  const count = document.getElementById('feedback-count');
  const message = document.getElementById('feedback-message');
  const submit = form.querySelector('button[type="submit"]');
  let items = [];

  async function request(method, data, id) {
    const response = await fetch(id ? `${endpoint}?id=${encodeURIComponent(id)}` : endpoint, {
      method,
      headers: {
        'X-Luzhniki-Password': sessionStorage.getItem(passwordKey) || '',
        ...(data ? {'Content-Type':'application/json'} : {})
      },
      ...(data ? {body:JSON.stringify(data)} : {}),
      cache:'no-store'
    });
    if (!response.ok) throw new Error(response.status === 401 ? 'Сессия истекла. Обновите страницу и войдите снова.' : 'Не удалось получить данные. Повторите попытку.');
    return response.json();
  }

  function render() {
    const sorted = [...items].sort((a, b) => Number(a.resolved) - Number(b.resolved) || Date.parse(b.createdAt) - Date.parse(a.createdAt));
    list.replaceChildren();
    empty.hidden = sorted.length > 0;
    count.textContent = `${sorted.length} ${sorted.length === 1 ? 'запись' : sorted.length < 5 && sorted.length > 1 ? 'записи' : 'записей'}`;
    for (const item of sorted) {
      const row = document.createElement('li');
      row.className = `feedback-item${item.resolved ? ' is-resolved' : ''}`;
      const head = document.createElement('div');
      head.className = 'feedback-item-head';
      const status = document.createElement('span');
      status.className = 'feedback-status';
      status.textContent = item.resolved ? 'Решено' : 'Открыто';
      const date = document.createElement('time');
      date.dateTime = item.createdAt;
      date.textContent = new Intl.DateTimeFormat('ru-RU', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}).format(new Date(item.createdAt));
      head.append(status, date);
      const body = document.createElement('p');
      body.className = 'feedback-item-text';
      body.textContent = item.text;
      const actions = document.createElement('div');
      actions.className = 'feedback-item-actions';
      if (!item.resolved) {
        const resolve = document.createElement('button');
        resolve.type = 'button';
        resolve.textContent = 'Решено';
        resolve.addEventListener('click', async () => {
          resolve.disabled = true;
          try { await request('PATCH', null, item.id); await load(); }
          catch (error) { message.textContent = error.message; resolve.disabled = false; }
        });
        actions.append(resolve);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'feedback-delete';
      remove.textContent = 'Удалить';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try { await request('DELETE', null, item.id); await load(); }
        catch (error) { message.textContent = error.message; remove.disabled = false; }
      });
      actions.append(remove);
      row.append(head, body, actions);
      list.append(row);
    }
  }

  async function load() {
    const data = await request('GET');
    items = data.items;
    render();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    submit.disabled = true;
    message.textContent = '';
    try {
      await request('POST', {text:value});
      form.reset();
      await load();
      message.textContent = 'Сохранено';
      input.focus();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
  empty.hidden = true;
  const start = () => {
    message.textContent = 'Загрузка записей…';
    load().then(() => { message.textContent = ''; }).catch(error => { message.textContent = error.message; });
  };
  if (sessionStorage.getItem(passwordKey)) start();
  else document.addEventListener('access-unlocked', start, {once:true});
})();
