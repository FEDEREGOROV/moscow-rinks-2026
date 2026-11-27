// Экран входа для статического GitHub Pages. Это интерфейсное ограничение, не серверная авторизация.
(() => {
  const storageKey = 'luzhniki-market-access-v1';
  const passwordKey = 'luzhniki-market-password-v1';
  const needsApiPassword = /\/(feedback|rinks-metrica|news|news-rinks)\.html$/.test(location.pathname) && !sessionStorage.getItem(passwordKey);
  if (sessionStorage.getItem(storageKey) === 'ok' && !needsApiPassword) {
    document.documentElement.classList.remove('access-locked');
    return;
  }
  const salt = 'a6fdc9a010cdd080a90a6f005f9d4932';
  const expected = 'acbba9b0ed19a23859e83c025458875000b75c1501307417fd71ac26b99df89d';
  const bytes = hex => new Uint8Array(hex.match(/.{2}/g).map(part => parseInt(part, 16)));
  const digest = async password => {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(salt),iterations:120000,hash:'SHA-256'}, key, 256);
    return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
  };
  document.addEventListener('DOMContentLoaded', () => {
    const gate = document.createElement('div');
    gate.id = 'access-gate';
    const form = document.createElement('form');
    form.className = 'access-form';
    const title = document.createElement('h1');
    title.textContent = 'Обзор рынка Москвы';
    const label = document.createElement('label');
    label.htmlFor = 'access-password';
    label.textContent = 'Пароль';
    const input = document.createElement('input');
    input.id = 'access-password';
    input.name = 'password';
    input.type = 'password';
    input.autocomplete = 'current-password';
    input.required = true;
    const inputRow = document.createElement('div');
    inputRow.className = 'access-input-row';
    const visibility = document.createElement('button');
    visibility.type = 'button';
    visibility.className = 'access-toggle';
    visibility.textContent = 'Показать';
    visibility.setAttribute('aria-label', 'Показать пароль');
    visibility.setAttribute('aria-pressed', 'false');
    visibility.addEventListener('click', () => {
      const showing = input.type === 'password';
      input.type = showing ? 'text' : 'password';
      visibility.textContent = showing ? 'Скрыть' : 'Показать';
      visibility.setAttribute('aria-label', showing ? 'Скрыть пароль' : 'Показать пароль');
      visibility.setAttribute('aria-pressed', String(showing));
      input.focus();
    });
    inputRow.append(input, visibility);
    const error = document.createElement('p');
    error.className = 'access-error';
    error.setAttribute('role', 'alert');
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Войти';
    form.append(title, label, inputRow, error, submit);
    gate.append(form);
    document.body.append(gate);
    input.focus();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      submit.disabled = true;
      try {
        if (await digest(input.value) === expected) {
          sessionStorage.setItem(storageKey, 'ok');
          sessionStorage.setItem(passwordKey, input.value);
          document.documentElement.classList.remove('access-locked');
          gate.remove();
          document.dispatchEvent(new Event('access-unlocked'));
        } else {
          error.textContent = 'Неверный пароль';
          input.select();
        }
      } catch {
        error.textContent = 'Не удалось проверить пароль';
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
