(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    const aqua = page.startsWith('aquaparks');
    const header = document.querySelector('.topbar');
    if (!header) return;
    const primary = document.createElement('nav');
    primary.className = 'primary-nav wrap';
    primary.setAttribute('aria-label', 'Главные разделы');
    for (const [label, href, active] of [
      ['Катки', 'index.html', !aqua],
      ['Аквакомплексы', 'aquaparks.html', aqua]
    ]) {
      const item = document.createElement('a');
      item.href = href;
      item.textContent = label;
      if (active) item.setAttribute('aria-current', 'page');
      primary.append(item);
    }
    header.before(primary);
  });
})();
