(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    const aqua = page.startsWith('aquaparks');
    const bsa = page.startsWith('bsa');
    const tennis = page.startsWith('tennis');
    const header = document.querySelector('.topbar');
    if (!header) return;
    const primary = document.createElement('nav');
    primary.className = 'primary-nav wrap';
    primary.setAttribute('aria-label', 'Главные разделы');
    for (const [label, href, active] of [
      ['Катки', 'index.html', !aqua && !bsa && !tennis],
      ['Аквакомплексы', 'aquaparks.html', aqua],
      ['БСА', 'bsa.html', bsa],
      ['Дворец тенниса', 'tennis.html', tennis]
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
