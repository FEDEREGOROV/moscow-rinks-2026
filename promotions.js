const promoRows=document.querySelector('#promo-rows');
const promoSearch=document.querySelector('#promo-search');
const promoSeason=document.querySelector('#promo-season');
const promoEscape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function renderPromotions(){
  const term=promoSearch.value.trim().toLocaleLowerCase('ru');
  const visible=promotions.filter(p=>(promoSeason.value==='all'||p.season===promoSeason.value)
    &&[p.rink,p.title,p.period,p.benefit,p.terms].join(' ').toLocaleLowerCase('ru').includes(term));
  promoRows.innerHTML=visible.map(p=>`<tr><th scope="row">${promoEscape(p.rink)}<small>${promoEscape(p.season)}</small></th><td><strong>${promoEscape(p.title)}</strong></td><td>${promoEscape(p.period)}</td><td class="promo-benefit">${promoEscape(p.benefit)}</td><td>${promoEscape(p.terms)}</td><td><a href="${promoEscape(p.source)}" target="_blank" rel="noopener noreferrer">Официальная публикация</a><small>${promoEscape(p.published)}</small></td></tr>`).join('');
  promoRows.closest('table').hidden=visible.length===0;
  document.querySelector('#promo-empty').hidden=visible.length!==0;
  document.querySelector('#promo-count').textContent=`${visible.length} из ${promotions.length}`;
  document.querySelector('#promo-total').textContent=`${promotions.length} записей`;
}

promoSearch.addEventListener('input',renderPromotions);
promoSeason.addEventListener('change',renderPromotions);
renderPromotions();
