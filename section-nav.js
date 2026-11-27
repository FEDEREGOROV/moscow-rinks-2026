(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    const aqua = page.startsWith('aquaparks');
    const bsa = page.startsWith('bsa');
    const tennis = page.startsWith('tennis');
    const news = page.startsWith('news');
    const feedback = page === 'feedback.html';
    document.documentElement.dataset.section = aqua ? 'aquaparks' : bsa ? 'bsa' : tennis ? 'tennis' : news ? 'news' : feedback ? 'feedback' : 'rinks';
    const header = document.querySelector('.topbar');
    if (!header) return;
    const primary = document.createElement('nav');
    primary.className = 'primary-nav wrap';
    primary.setAttribute('aria-label', 'Главные разделы');
    for (const [label, href, active] of [
      ['Катки', 'index.html', !aqua && !bsa && !tennis && !news && !feedback],
      ['Аквакомплексы', 'aquaparks.html', aqua],
      ['БСА', 'bsa.html', bsa],
      ['Дворец тенниса', 'tennis.html', tennis],
      ['Новости', 'news.html', news]
    ]) {
      const item = document.createElement('a');
      item.href = href;
      item.textContent = label;
      if (active) item.setAttribute('aria-current', 'page');
      primary.append(item);
    }
    const feedbackLink = document.createElement('a');
    feedbackLink.href = 'feedback.html';
    feedbackLink.className = 'feedback-link';
    feedbackLink.textContent = 'Вопросы и предложения';
    if (feedback) feedbackLink.setAttribute('aria-current', 'page');
    primary.append(feedbackLink);
    header.before(primary);
    for (const nav of [primary, header.querySelector('nav')]) {
      const current = nav?.querySelector('[aria-current="page"]');
      if (!current || nav.scrollWidth <= nav.clientWidth) continue;
      nav.scrollLeft += current.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - current.clientWidth) / 2;
    }
  });
})();
