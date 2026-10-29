/* ===== chrome: header, action bar, contact block, footer ===== */
const LOGO = () => `<svg viewBox="${LOGO_VB}" role="img" aria-label="PLATANIK — parts &amp; accessories"><use href="#logo-sym"></use></svg>`;
function renderChrome() {
  const u = S.user, ws = isWholesale();
  $('#hdr').innerHTML = `
  <div class="nav"><div class="wrap">
    <button class="burger" type="button" id="burger" aria-label="${t('menu')}">${ic('burger')}</button>
    <a class="logo" href="#home">${LOGO()}</a>
    <div class="tel"><a class="num" href="tel:${CONFIG.phoneTel}">${esc(CONFIG.phone)}</a>
      <a class="soc" href="viber://chat?number=%2B${CONFIG.viber.replace(/\D/g, '')}" aria-label="Viber">${ic('viber')}</a>
      <a class="soc" href="https://t.me/${CONFIG.telegram}" target="_blank" rel="noopener" aria-label="Telegram">${ic('telegram')}</a></div>
    <div class="sp"></div>
    <div class="right">
      <span class="lang-w lang" role="group" aria-label="Мова / Язык"><button type="button" data-lang="ru" aria-pressed="${S.lang === 'ru'}">RU</button><button type="button" data-lang="ua" aria-pressed="${S.lang === 'ua'}">UA</button></span>
      ${ws ? `<a class="nbtn" href="#account-invoices" aria-label="${t('invoices')}">${ic('file')}</a>` : ''}
      <span class="user-w" style="position:relative"><button class="nbtn" type="button" id="userbtn" aria-haspopup="true" aria-expanded="false">${ic('user')}${u ? `<span class="lbl">${esc(ws ? t('optProfile') : (u.first || t('profile')))}</span>` : ''}</button></span>
      <a class="nbtn" href="#favorites" aria-label="${t('favorites')}">${ic('heart')}<span class="badge" data-badge="fav"></span></a>
      <a class="nbtn" href="#cart" data-open-cart aria-label="${t('cart')}">${ic('cart')}<span class="badge" data-badge="cart"></span><span class="lbl" data-cart-label>${t('cart')}</span></a>
    </div>
  </div></div>
  <div class="abar" id="abar"><div class="wrap">
    <button class="catbtn" type="button" id="catbtn" aria-expanded="false">${ic('grid')}<span><span class="lbl-short">${t('catalogShort')}</span><span class="lbl-long"> ${S.lang === 'ru' ? 'товаров' : 'товарів'}</span></span></button>
    <div class="search" role="search">
      <form id="sform"><input id="q" type="search" autocomplete="off" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('searchPh'))}" value="${esc(S.q)}"><button class="go" type="submit" aria-label="Пошук">${ic('search', 'xs')}</button></form>
      <div class="sugg" id="sugg" hidden></div>
    </div>
  </div><div id="megaHost"></div></div>`;
  $('#ftr').innerHTML = `
  <section class="wrap"><div class="card ask">
    <div><h2>${t('askT')}</h2><p class="muted">${t('askS')}</p><a class="btn" href="#contacts">${t('contactUs')}</a></div>
    <div class="ci"><span class="ib">${ic('phone')}</span><div><b>${t('contactInfo')}</b><span>${t('schedule')}:</span> ${esc(loc(CONFIG.hoursShort))}<br><span>${t('phone')}:</span> <a href="tel:${CONFIG.phoneTel}">${esc(CONFIG.phone)}</a><br><span>E-mail:</span> ${esc(CONFIG.email)}</div></div>
    <div class="ci"><span class="ib">${ic('pin')}</span><div><b>${t('ourAddr')}:</b>${esc(loc(CONFIG.kyiv))}<br>${esc(loc(CONFIG.kharkiv))}</div></div>
  </div></section>
  <footer class="ftr"><div class="wrap">
    <div class="fl"><a class="logo" href="#home">${LOGO()}</a><p style="color:#8d8d8d;max-width:34ch;font-size:13px;line-height:1.6">${S.lang === 'ru' ? 'Запчасти, аксессуары, светотехника и пневматика для грузовиков и прицепов. Склады в Киеве и Харькове.' : 'Запчастини, аксесуари, світлотехніка та пневматика для вантажівок і причепів. Склади в Києві та Харкові.'}</p><span class="copy">© ${new Date().getFullYear()} ${esc(CONFIG.company)} · PLATANIK</span></div>
    <div><h4>${t('fInfo')}</h4><ul><li><a href="#oferta">${t('oferta')}</a></li><li><a href="#warranty">${t('warranty')}</a></li><li><a href="#returns">${t('returns')}</a></li><li><a href="#delivery">${t('payDelivery')}</a></li><li><a href="#brands">${t('makers')}</a></li><li><a href="#news">${t('news')}</a></li></ul></div>
    <div><h4>${t('fSupport')}</h4><ul><li><a href="#contacts">${t('contactInfo')}</a></li><li><a href="#account">${t('cabinet')}</a></li><li><a href="#returns">${t('returnGoods')}</a></li><li><a href="#about">${t('about')}</a></li><li><a href="#dropshipping">${t('dropshipping')}</a></li></ul></div>
    <div><h4>${t('fContacts')}</h4><ul><li><a href="tel:${CONFIG.phoneTel}">${esc(CONFIG.phone)}</a></li><li><a href="tel:${CONFIG.phone2Tel}">${esc(CONFIG.phone2)}</a></li><li>${esc(CONFIG.email)}</li><li>${esc(loc(CONFIG.kyiv))}</li><li>${esc(loc(CONFIG.kharkiv))}</li></ul></div>
    <div><h4>${t('schedule')}:</h4><ul>${loc(CONFIG.hours).map(h => `<li>${esc(h)}</li>`).join('')}<li>${t('shipUntil')}</li></ul></div>
  </div></footer>`;
  updateBadges();
}

/* ===== mega menu ===== */
function catLinkList(active) {
  return topCats().map(c => `<a href="#c${c.id}" data-mc="${c.id}"${active === c.id ? ' class="on"' : ''}>${ic(CAT_ICON[c.k] || 'cParts')}<span>${esc(cn(c))}</span>${(c.ch || []).length ? ic('chr', 'chev') : ''}</a>`).join('') + `<a class="all" href="#catalog">${t('allCats')}</a>`;
}
function catPanel(c) {
  const kids = (c.ch || []).map(id => S.catById.get(id)).filter(k => k && catItems(k).length);
  let body;
  if (kids.length) body = `<div class="tiles">${kids.map(k => `<a class="tile" href="#c${k.id}"><span class="tph">${catImg(k)}</span><span>${esc(cn(k))}<small>${fmtN(catItems(k).length)} ${plural(catItems(k).length)}</small></span></a>`).join('')}</div>`;
  else body = `<div class="tiles">${catItems(c).map(id => S.byId.get(id)).filter(x => x && x.i != null).slice(0, 12).map(it => `<a class="tile" href="#p${it.id}"><span class="tph">${pimg(it)}</span><span>${esc(nm(it))}</span></a>`).join('')}</div>`;
  return `<h3><span>${esc(cn(c))}</span><a href="#c${c.id}">${t('showAll')} · ${fmtN(catItems(c).length)}</a></h3>${body}`;
}
function openMega(on) {
  const host = $('#megaHost'); if (!host) return;
  S.megaOpen = on; $('#catbtn')?.setAttribute('aria-expanded', on);
  if (!on) { host.innerHTML = ''; return; }
  if (matchMedia('(max-width: 860px)').matches) { S.megaOpen = false; location.hash = 'catalog'; return; }
  const first = topCats()[0];
  host.innerHTML = `<div class="mega"><div class="wrap"><div class="catside" id="megaSide">${catLinkList(first && first.id)}</div><div class="panel" id="megaPanel">${first ? catPanel(first) : ''}</div></div></div>`;
  bindCatHover($('#megaSide'), $('#megaPanel'));
}
function bindCatHover(side, panel, onShow) {
  let tm;
  side.addEventListener('mouseover', e => {
    const a = e.target.closest('[data-mc]'); if (!a) return;
    clearTimeout(tm); tm = setTimeout(() => {
      $$('[data-mc]', side).forEach(x => x.classList.toggle('on', x === a));
      const c = S.catById.get(+a.dataset.mc); if (c) { panel.innerHTML = catPanel(c); if (onShow) onShow(true); }
    }, 90);
  });
  side.addEventListener('focusin', e => { const a = e.target.closest('[data-mc]'); if (a) a.dispatchEvent(new Event('mouseover', { bubbles: true })); });
}

/* ===== product card ===== */
function stockLine(it) { return S.wh.map((w, i) => `<div><span>${esc(whName(i))}</span><span>${esc((it._st[i] || {}).txt || '0')} ${t('pcs')}</span></div>`).join(''); }
function card(it, opt = {}) {
  const fav = S.fav.has(it.id), inC = S.cart.some(l => l.id === it.id);
  const fields = opt.fields ? `<dl class="fields"><dt>${t('maker')}:</dt><dd>${esc(it.b || '—')}</dd><dt>${t('article')}:</dt><dd>${esc(it.cc || '—')}</dd><dt>${t('minOrder')}:</dt><dd>${it.mo || 1} ${t('pcs')}</dd><dt>${t('country')}:</dt><dd>${esc(it.co || '—')}</dd></dl>` : `<div class="br">${esc(it.b || '')}</div>`;
  const buy = it._av ? `<button class="ibtn${inC ? ' in' : ''}" type="button" data-add="${it.id}" aria-label="${t('toCart')}">${ic('cart')}</button>` : `<button class="ibtn off" type="button" data-ask="${it.id}" aria-label="${t('notifyMe')}" title="${t('notifyMe')}">${ic('clock')}</button>`;
  return `<article class="pc">${tagOf(it)}<button class="heart${fav ? ' on' : ''}" type="button" data-fav="${it.id}" aria-pressed="${fav}" aria-label="${t('favorites')}">${ic('heart')}</button>
    <a class="ph" href="#p${it.id}" tabindex="-1" aria-hidden="true">${pimg(it)}</a>
    <a class="nm" href="#p${it.id}">${esc(nm(it))}</a>${fields}
    ${it._av ? '' : `<span><span class="nostock">${ic('x', 'xs')} ${t('noStock')}</span></span>`}
    <div class="buy">${priceHtml(it)}${buy}</div>
    <div class="wh"><b>${t('warehouses')}</b>${stockLine(it)}</div></article>`;
}
function trow(it) {
  const fav = S.fav.has(it.id), inC = S.cart.some(l => l.id === it.id);
  const st = S.wh.map((w, i) => (it._st[i] && it._st[i].n) ? `${esc(whName(i))} ${esc(it._st[i].txt)} ${t('pcs')}` : '').filter(Boolean).join('<br>') || `<span class="nostock">${t('noStock')}</span>`;
  return `<div class="tr"><a class="tph" href="#p${it.id}" tabindex="-1" aria-hidden="true">${pimg(it)}</a>
    <div><a class="tn" href="#p${it.id}">${esc(nm(it))}</a>${tagOf(it) ? `<div style="margin-top:6px">${tagOf(it)}</div>` : ''}</div>
    <div class="c-b">${esc(it.b || '—')}<small>${esc(it.cc || '')}</small></div><div class="c-s">${st}</div>
    <div class="pr">${priceHtml(it)}</div>
    <div class="act"><button class="heart${fav ? ' on' : ''}" type="button" data-fav="${it.id}" aria-pressed="${fav}" aria-label="${t('favorites')}">${ic('heart')}</button>${it._av ? `<button class="ibtn${inC ? ' in' : ''}" type="button" data-add="${it.id}" aria-label="${t('toCart')}">${ic('cart')}</button>` : `<button class="ibtn off" type="button" data-ask="${it.id}" aria-label="${t('notifyMe')}">${ic('clock')}</button>`}</div></div>`;
}
const pagerCtl = id => `<div class="pager" data-pager="${id}"><button type="button" data-dir="-1" aria-label="←">${ic('chl', 's')}</button><span class="dots"></span><button type="button" data-dir="1" aria-label="→">${ic('chr', 's')}</button></div>`;
function bindPager(id) {
  const row = document.getElementById(id), ctl = $(`[data-pager="${id}"]`); if (!row || !ctl) return;
  const dots = $('.dots', ctl);
  const upd = () => { const pages = Math.max(1, Math.round(row.scrollWidth / row.clientWidth)); const cur = Math.round(row.scrollLeft / row.clientWidth); dots.innerHTML = Array.from({ length: Math.min(pages, 6) }, (_, i) => `<i class="${i === Math.min(cur, 5) ? 'on' : ''}"></i>`).join(''); $$('button', ctl)[0].disabled = row.scrollLeft < 4; $$('button', ctl)[1].disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4; };
  ctl.addEventListener('click', e => { const b = e.target.closest('[data-dir]'); if (b) row.scrollBy({ left: row.clientWidth * +b.dataset.dir, behavior: 'smooth' }); });
  row.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
}

/* ===== banners composed from real catalogue photos ===== */
function photosOf(ids, n) { return ids.map(id => S.byId.get(id)).filter(x => x && x.i != null && x._av).slice(0, n); }
function banner(b) {
  const pics = photosOf(b.ids, 3).map(it => `<span>${pimg(it)}</span>`).join('');
  return `<div class="bn ${b.tone}"><div><div class="eb">${esc(b.eb)}</div><h2>${b.h}</h2><p>${esc(b.p)}</p><a class="btn" href="${b.href}">${esc(b.cta)}</a></div><div class="pics">${pics}</div></div>`;
}
function bannerSet() {
  const cat = k => S.catByKey.get(k), ids = k => cat(k) ? catItems(cat(k)) : [];
  const brandIds = s => S.items.filter(i => i.bs === s).map(i => i.id);
  const ru = S.lang === 'ru';
  const out = [];
  const light = ids('svetotekhnika');
  if (light.length) out.push({ tone: 'y', eb: ru ? 'Оптика и светотехника' : 'Оптика та світлотехніка', h: ru ? 'Фонари, фары и <em>габариты</em> для грузовиков' : 'Ліхтарі, фари та <em>габарити</em> для вантажівок', p: ru ? `${fmtN(light.length)} позиций: WAS, HORPOL, MARS TECH, FRISTOM и другие производители со складов в Киеве и Харькове.` : `${fmtN(light.length)} позицій: WAS, HORPOL, MARS TECH, FRISTOM та інші виробники зі складів у Києві та Харкові.`, cta: ru ? 'Перейти в каталог' : 'Перейти до каталогу', href: `#c${cat('svetotekhnika').id}`, ids: [...brandIds('was'), ...brandIds('horpol'), ...light] });
  const pn = ids('pnevmo-tormoznye-soedineniya');
  if (pn.length) out.push({ tone: 'g', eb: ru ? 'Пневматика' : 'Пневматика', h: ru ? 'Пневматические <em>соединения</em> и фитинги' : 'Пневматичні <em>з’єднання</em> та фітинги', p: ru ? 'Соединительные головки, спирали, быстроразъёмные фитинги и трубки — подбор по диаметру и резьбе.' : 'З’єднувальні головки, спіралі, швидкороз’ємні фітинги й трубки — підбір за діаметром і різьбою.', cta: ru ? 'Смотреть' : 'Дивитися', href: `#c${cat('pnevmo-tormoznye-soedineniya').id}`, ids: pn });
  const acc = ids('aksessuary-dlia-cabini');
  if (acc.length) out.push({ tone: 'r', eb: ru ? 'Дорожные аксессуары' : 'Дорожні аксесуари', h: ru ? 'Всё для <em>кабины</em> дальнобойщика' : 'Усе для <em>кабіни</em> далекобійника', p: ru ? 'Коврики, шторы, чехлы, хром-тюнинг, звуковые сигналы и дорожная кухня.' : 'Килимки, штори, чохли, хром-тюнінг, звукові сигнали та дорожня кухня.', cta: ru ? 'Выбрать' : 'Обрати', href: `#c${cat('aksessuary-dlia-cabini').id}`, ids: acc });
  return out;
}

function ibanner(b) {
  const br = S.brands.find(x => x.n === b.brand);
  const seen = new Set(), ids = [];
  for (const it of S.items.filter(i => i.b === b.brand && i.i != null && i._av).sort((x, y) => y.id - x.id)) { const k = it.n.split(/\s+/).slice(0, 3).join(' ').toLowerCase(); if (seen.has(k)) continue; seen.add(k); ids.push(it); if (ids.length === 4) break; }
  const ru = S.lang === 'ru';
  return `<div class="ibn"><a class="ibn-img" href="#b-${b.h || ''}"><picture>${b.m ? `<source media="(max-width: 599px)" srcset="data:image/webp;base64,${b.m}">` : ''}<img src="data:image/webp;base64,${b.d}" alt="${esc(b.alt)}"></picture></a>
    <div class="ibn-strip"><div class="ibn-t"><b>${ru ? 'Новые поступления' : 'Нові надходження'} ${esc(b.brand)}</b><span>${br ? `${fmtN(br.cnt)} ${plural(br.cnt)} ${ru ? 'в каталоге' : 'у каталозі'}` : ''}</span></div>
    <div class="ibn-p">${ids.map(it => `<a href="#p${it.id}" title="${esc(nm(it))}"><span>${pimg(it)}</span><b>${moneyTxt(priceOf(it))}</b></a>`).join('')}</div>
    <a class="btn sm" href="#b-${b.h || ''}">${ru ? 'Все товары' : 'Усі товари'} ${esc(b.brand)} ${ic('chr', 'xs')}</a></div></div>`;
}

/* ===== home ===== */
function pickLeaders() {
  const fixed = CONFIG.bestsellers.map(id => S.byId.get(id)).filter(Boolean);
  if (fixed.length) return fixed;
  const out = [], seen = new Set();
  const tops = topCats().filter(c => c.k !== 'akciya');
  for (let round = 0; out.length < 15 && round < 6; round++) for (const c of tops) {
    const cand = catItems(c).map(id => S.byId.get(id)).filter(x => x && x.i != null && x._av && x.p >= 150 && !seen.has(x.id)).sort((a, b) => b._tot - a._tot)[round];
    if (cand && out.length < 15) { out.push(cand); seen.add(cand.id); }
  }
  return out;
}
async function viewHome() {
  setTitle('');
  await Promise.all([loadAux('brandImgs'), loadAux('banners')]);
  const tops = topCats();
  const slides = [...(S.banners || []).map(b => ({ img: b })), ...bannerSet()];
  const promo = S.items.filter(x => x.ak && x.i != null && x._av)[0] || pickLeaders()[0];
  const brands = S.brands.filter(b => S.brandImgs[b.s] || /^(WAS|HORPOL)$/.test(b.n)).slice(0, 14);
  const leaders = pickLeaders();
  const newest = S.items.filter(x => x.i != null && x._av).sort((a, b) => b.id - a.id).slice(0, 12);
  const sale = S.items.filter(x => x.ak && x.i != null).slice(0, 12);
  const saleCat = S.catByKey.get('akciya');
  const novBlock = (rowId, list, bnr) => `<div class="nov"><div class="nov-b">${banner(bnr)}</div><div class="row-scroll nov-g" id="${rowId}">${list.map(it => card(it)).join('')}</div></div>`;
  const bs = bannerSet();
  $('#view').innerHTML = `
  <section class="hero"><div class="wrap">
    <div class="hero-grid" id="heroGrid">
      <nav class="catside" id="heroSide" aria-label="${t('catalog')}">${catLinkList()}</nav>
      <div class="slider" id="slider" aria-roledescription="carousel">
        ${slides.map((s, i) => `<div class="slide${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}">${s.img ? ibanner(s.img) : banner(s)}</div>`).join('')}
        ${slides.length > 1 ? `<button class="sl-arrow prev" type="button" data-sl="-1" aria-label="←">${ic('chl')}</button><button class="sl-arrow next" type="button" data-sl="1" aria-label="→">${ic('chr')}</button><div class="sl-dots">${slides.map((s, i) => `<button type="button" data-sld="${i}" class="${i ? '' : 'on'}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}
      </div>
      ${promo ? `<aside class="promo"><div class="ptag"><span>${promo.ak ? (S.lang === 'ru' ? 'Акция' : 'Акція') : t('promoTag')}</span><span>${esc(promo.b || 'PLATANIK')}</span></div>
        <a class="pph" href="#p${promo.id}">${pimg(promo)}</a><a class="pn" href="#p${promo.id}">${esc(nm(promo))}</a>
        <div class="pp"><b class="num">${money(priceOf(promo), true)}</b><button class="ibtn" type="button" data-add="${promo.id}" aria-label="${t('toCart')}">${ic('cart')}</button></div></aside>` : ''}
      <div class="hero-panel card" id="heroPanel" hidden></div>
    </div>
    <div class="benefits">
      <div class="benefit"><span class="bi">${ic('truck')}</span><div><b>${t('bDelivery')}</b><span>${t('bDeliveryT')}</span></div></div>
      <div class="benefit"><span class="bi">${ic('shield')}</span><div><b>${t('bWarranty')}</b><span>${t('bWarrantyT')}</span></div></div>
      <div class="benefit"><span class="bi">${ic('wallet')}</span><div><b>${t('bPay')}</b><span>${t('bPayT')}</span></div></div>
    </div>
  </div></section>
  <div class="wrap">
    ${brands.length ? `<section class="sec" style="padding-bottom:0"><div class="card brands">${brands.map(b => `<a class="bl" href="#b-${b.h}" title="${esc(b.n)}">${S.brandImgs[b.s] ? `<img class="lg" src="data:image/webp;base64,${S.brandImgs[b.s]}" alt="${esc(b.n)}">` : `<span class="bt">${esc(b.n)}</span>`}</a>`).join('')}<a class="all" href="#brands">${t('allBrands')}</a></div></section>` : ''}
    <section class="sec"><div class="sec-h"><h2>${t('leaders')}</h2>${pagerCtl('rowLead')}</div><div class="row-scroll" id="rowLead">${leaders.map(it => card(it)).join('')}</div></section>
    <section class="sec" style="padding-top:0"><div class="sec-h"><h2><a href="#new">${t('novelties')}</a></h2>${pagerCtl('rowNew')}</div>${novBlock('rowNew', newest, bs[0] || {})}</section>
    ${sale.length && saleCat ? `<section class="sec" style="padding-top:0"><div class="sec-h"><h2><a href="#c${saleCat.id}">${t('sale')}</a></h2>${pagerCtl('rowSale')}</div>${novBlock('rowSale', sale, bs[1] || bs[0] || {})}</section>` : ''}
    <section class="sec" style="padding-top:0"><div class="sec-h"><h2><a href="#news">${t('blog')}</a></h2><a class="more" href="#news">${t('allNews')}</a></div><div class="blog">${BLOG.map(postCard).join('')}</div></section>
  </div>`;
  ['rowLead', 'rowNew', 'rowSale'].forEach(bindPager);
  startSlider();
  const hp = $('#heroPanel'), hg = $('#heroGrid');
  if (hp && matchMedia('(hover: hover)').matches) {
    bindCatHover($('#heroSide'), hp, () => { hp.hidden = false; });
    hg.addEventListener('mouseleave', () => { hp.hidden = true; $$('#heroSide [data-mc]').forEach(x => x.classList.remove('on')); });
  }
}
let slT = 0;
function startSlider() {
  clearInterval(slT);
  const sl = $('#slider'); if (!sl) return;
  const go = i => { const ss = $$('.slide', sl), ds = $$('[data-sld]', sl); if (!ss.length) return; const cur = ss.findIndex(s => s.classList.contains('on')); const n = ((i === 'next' ? cur + 1 : i === 'prev' ? cur - 1 : i) + ss.length) % ss.length; ss.forEach((s, k) => { s.classList.toggle('on', k === n); s.setAttribute('aria-hidden', k !== n); }); ds.forEach((d, k) => d.classList.toggle('on', k === n)); };
  sl.addEventListener('click', e => { const a = e.target.closest('[data-sl]'), d = e.target.closest('[data-sld]'); if (a) { go(+a.dataset.sl > 0 ? 'next' : 'prev'); restart(); } if (d) { go(+d.dataset.sld); restart(); } });
  const restart = () => { clearInterval(slT); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) slT = setInterval(() => { if (!document.body.contains(sl)) return clearInterval(slT); if (!document.hidden) go('next'); }, 6500); };
  restart();
}
function postImgs(p) { const c = S.catByKey.get(p.cat); const ids = c ? catItems(c) : []; return photosOf(ids, 2); }
function postCard(p) {
  const L = L_KEY[S.lang];
  return `<article class="card post"><a class="bph" href="#news-${p.id}" tabindex="-1" aria-hidden="true">${postImgs(p).map(it => pimg(it)).join('')}</a><div><a href="#news-${p.id}"><h3>${esc(p.t[L])}</h3></a><p>${esc(p.x[L])}</p></div><time datetime="${p.date}">${fmtDate(p.date)}</time></article>`;
}
function fmtDate(d) { try { return new Date(d + 'T12:00:00').toLocaleDateString(S.lang === 'ru' ? 'ru-UA' : 'uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } }

/* ===== listing (category, search, brand, new, favourites) ===== */
const blankF = () => ({ pmin: null, pmax: null, mk: new Set(), wh: new Set(), av: '' });
function ensureL(key, base) {
  if (!S.L || S.L.key !== key) S.L = { key, f: blankF(), sort: 'def', per: 24, page: 1 };
  S.L.base = base; return S.L;
}
function matchF(it, f, skip) {
  if (skip !== 'mk' && f.mk.size && !f.mk.has(it.b || '—')) return false;
  if (skip !== 'wh' && f.wh.size && ![...f.wh].some(i => it._st[i] && it._st[i].n > 0)) return false;
  if (skip !== 'av' && f.av === 'in' && !it._av) return false;
  if (skip !== 'av' && f.av === 'out' && it._av) return false;
  if (skip !== 'p') { const p = priceOf(it); if (f.pmin != null && p < f.pmin) return false; if (f.pmax != null && p > f.pmax) return false; }
  return true;
}
function sortList(list, sort, scored) {
  const a = list.slice();
  if (sort === 'cheap') a.sort((x, y) => priceOf(x) - priceOf(y));
  else if (sort === 'dear') a.sort((x, y) => priceOf(y) - priceOf(x));
  else if (sort === 'name') a.sort((x, y) => nm(x).localeCompare(nm(y), 'uk'));
  else if (sort === 'new') a.sort((x, y) => y.id - x.id);
  else if (sort === 'code') a.sort((x, y) => (x.cc || '~').localeCompare(y.cc || '~', 'uk', { numeric: true }));
  else if (scored) a.sort((x, y) => (y._sc - x._sc) || (y._av - x._av));
  else a.sort((x, y) => (y._av - x._av) || ((y.i != null) - (x.i != null)) || (y._tot - x._tot));
  return a;
}
function viewListing(o) {
  setTitle(o.title);
  const L = ensureL(o.key, o.ids);
  const items = L.base.map(id => S.byId.get(id)).filter(Boolean);
  const subs = o.subs || [];
  $('#view').innerHTML = `<div class="wrap">
    ${crumbs(o.crumbs)}
    <div class="ptitle"><h1>${esc(o.title)}</h1>
      <div class="toolbar">
        <button class="btn line sm fbtn" type="button" id="fopen">${ic('filter', 'xs')} ${t('filters')}</button>
        <label>${t('perPage')}<select id="per">${[24, 48, 96].map(n => `<option${n === L.per ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>${t('sortBy')}<select id="sort">${[['def', o.scored ? (S.lang === 'ru' ? 'Релевантности' : 'Релевантністю') : t('sDef')], ['cheap', t('sCheap')], ['dear', t('sDear')], ['name', t('sName')], ['new', t('sNew')], ['code', t('sCode')]].map(([v, l]) => `<option value="${v}"${v === L.sort ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <span class="vt"><button type="button" data-view="grid" aria-pressed="${S.view === 'grid'}" aria-label="${t('gridView')}">${ic('grid')}</button><button type="button" data-view="table" aria-pressed="${S.view === 'table'}" aria-label="${t('listView')}">${ic('list')}</button></span>
      </div></div>
    ${subs.length ? `<div class="subcats">${subs.map(c => `<a href="#c${c.id}">${esc(cn(c))} <small>${fmtN(catItems(c).length)}</small></a>`).join('')}</div>` : ''}
    ${o.intro || ''}
    <div class="lst"><aside class="filters" id="filters" aria-label="${t('filters')}"></aside><section aria-label="${t('goods')}"><div class="chips" id="chips"></div><div id="res"></div><div id="pages"></div></section></div>
  </div>`;
  $('#per').addEventListener('change', e => { L.per = +e.target.value; L.page = 1; updList(items, o); });
  $('#sort').addEventListener('change', e => { L.sort = e.target.value; L.page = 1; updList(items, o); });
  $$('[data-view]').forEach(b => b.addEventListener('click', () => { S.view = b.dataset.view; saveAll(); $$('[data-view]').forEach(x => x.setAttribute('aria-pressed', x === b)); updList(items, o); }));
  $('#fopen').addEventListener('click', () => openFilters(true));
  updList(items, o);
}
function openFilters(on) {
  const f = $('#filters'); if (!f) return; f.classList.toggle('open', on);
  let sc = $('.fscrim'); if (on && !sc) { sc = document.createElement('div'); sc.className = 'fscrim'; sc.addEventListener('click', () => openFilters(false)); document.body.appendChild(sc); } if (!on && sc) sc.remove();
}
function updList(items, o) {
  const L = S.L, f = L.f;
  const res = sortList(items.filter(it => matchF(it, f)), L.sort, o.scored);
  // facets
  const cnt = (skip, fn) => { const c = {}; items.forEach(it => { if (!matchF(it, f, skip)) return; fn(it).forEach(v => c[v] = (c[v] || 0) + 1); }); return c; };
  const mk = cnt('mk', it => [it.b || '—']), wh = cnt('wh', it => it._st.map((s, i) => s.n > 0 ? i : null).filter(x => x != null)), av = cnt('av', it => [it._av ? 'in' : 'out']);
  const prices = items.map(priceOf); const lo = prices.length ? Math.floor(Math.min(...prices)) : 0, hi = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const mkList = Object.entries(mk).sort((a, b) => b[1] - a[1]); [...f.mk].forEach(m => { if (!mk[m]) mkList.push([m, 0]); });
  const showMk = S.makeAll ? mkList : mkList.slice(0, 7);
  const chk = (g, v, label, n, on, type = 'checkbox') => `<label class="chk${!n && !on ? ' zero' : ''}"><input type="${type}" name="f-${g}" data-f="${g}" value="${esc(v)}"${on ? ' checked' : ''}><span>${esc(label)}</span> <small>(${fmtN(n || 0)})</small></label>`;
  const fl = $('#filters'), keep = fl.scrollTop;
  fl.innerHTML = `<div class="fh"><b>${t('filters')}</b><button type="button" id="freset">${t('clearAll')}</button></div>
    ${hi > lo ? `<div class="fg"><b>${t('price')}</b><div class="prange"><input id="pmin" inputmode="numeric" value="${f.pmin ?? lo}" aria-label="min"><span>-</span><input id="pmax" inputmode="numeric" value="${f.pmax ?? hi}" aria-label="max"><button type="button" id="pok">Ok</button></div>
      <div class="dual"><span class="tr"></span><span class="fl" id="pfl"></span><input type="range" id="r1" min="${lo}" max="${hi}" value="${f.pmin ?? lo}" aria-label="min"><input type="range" id="r2" min="${lo}" max="${hi}" value="${f.pmax ?? hi}" aria-label="max"></div></div>` : ''}
    ${mkList.length > 1 || f.mk.size ? `<div class="fg"><b>${t('makers')}</b>${showMk.map(([m, n]) => chk('mk', m, m, n, f.mk.has(m))).join('')}${mkList.length > 7 ? `<button type="button" class="link" id="mkall" style="justify-self:start;font-size:12.5px">${S.makeAll ? t('showLess') : t('showMore')} (${mkList.length})</button>` : ''}</div>` : ''}
    <div class="fg"><b>${t('warehouse')}</b>${S.wh.map((w, i) => chk('wh', String(i), whName(i), wh[i], f.wh.has(i))).join('')}</div>
    <div class="fg"><b>${t('availability')}</b>${chk('av', 'in', t('avIn'), av.in, f.av === 'in')}${chk('av', 'out', t('avOut'), av.out, f.av === 'out')}</div>
    <button class="btn sm fbtn" type="button" id="fdone" style="margin-top:8px">${t('found')}: ${fmtN(res.length)}</button>`;
  fl.scrollTop = keep;
  // price controls
  const r1 = $('#r1'), r2 = $('#r2');
  if (r1) {
    const paint = () => { const a = Math.min(+r1.value, +r2.value), b = Math.max(+r1.value, +r2.value); const k = 100 / (hi - lo || 1); $('#pfl').style.left = (a - lo) * k + '%'; $('#pfl').style.width = (b - a) * k + '%'; $('#pmin').value = a; $('#pmax').value = b; };
    paint(); r1.addEventListener('input', paint); r2.addEventListener('input', paint);
    const apply = () => { let a = parseFloat($('#pmin').value), b = parseFloat($('#pmax').value); if (isNaN(a)) a = lo; if (isNaN(b)) b = hi; if (a > b) [a, b] = [b, a]; f.pmin = a > lo ? a : null; f.pmax = b < hi ? b : null; L.page = 1; updList(items, o); };
    r1.addEventListener('change', apply); r2.addEventListener('change', apply); $('#pok').addEventListener('click', apply);
    [$('#pmin'), $('#pmax')].forEach(x => x.addEventListener('keydown', e => { if (e.key === 'Enter') apply(); }));
  }
  $('#freset').addEventListener('click', () => { L.f = blankF(); L.page = 1; updList(items, o); });
  const ma = $('#mkall'); if (ma) ma.addEventListener('click', () => { S.makeAll = !S.makeAll; updList(items, o); });
  $('#fdone').addEventListener('click', () => openFilters(false));
  $$('#filters input[data-f]').forEach(inp => inp.addEventListener('change', () => {
    const g = inp.dataset.f;
    if (g === 'mk') inp.checked ? f.mk.add(inp.value) : f.mk.delete(inp.value);
    else if (g === 'wh') inp.checked ? f.wh.add(+inp.value) : f.wh.delete(+inp.value);
    else if (g === 'av') f.av = inp.checked ? inp.value : '';
    L.page = 1; updList(items, o);
  }));
  // chips
  const chips = [];
  if (f.pmin != null || f.pmax != null) chips.push(['p', '', `${f.pmin ?? lo} – ${f.pmax ?? hi} грн`]);
  f.mk.forEach(m => chips.push(['mk', m, m])); f.wh.forEach(i => chips.push(['wh', String(i), whName(i)]));
  if (f.av) chips.push(['av', '', f.av === 'in' ? t('avIn') : t('avOut')]);
  $('#chips').innerHTML = chips.map(([g, v, l]) => `<button type="button" data-chip="${g}" data-v="${esc(v)}">${esc(l)}</button>`).join('');
  $$('#chips [data-chip]').forEach(b => b.addEventListener('click', () => { const g = b.dataset.chip, v = b.dataset.v; if (g === 'p') { f.pmin = f.pmax = null; } else if (g === 'mk') f.mk.delete(v); else if (g === 'wh') f.wh.delete(+v); else f.av = ''; L.page = 1; updList(items, o); }));
  // results
  const pages = Math.max(1, Math.ceil(res.length / L.per)); if (L.page > pages) L.page = pages;
  const slice = res.slice((L.page - 1) * L.per, L.page * L.per);
  const box = $('#res');
  if (!res.length) box.innerHTML = `<div class="empty"><span class="ei">${ic('search')}</span><b>${t('nothingT')}</b><p>${t('nothingS')}</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn sm" type="button" id="eres">${t('resetAll')}</button><a class="btn line sm" href="#contacts">${t('contactUs')}</a></div></div>`;
  else if (S.view === 'table') box.innerHTML = `<div class="tbl"><div class="th"><span></span><span>${t('thName')}</span><span class="c-b">${t('thMaker')}</span><span class="c-s">${t('thAvail')}</span><span>${t('price')}</span><span></span></div>${slice.map(trow).join('')}</div>`;
  else box.innerHTML = `<div class="grid">${slice.map(it => card(it, { fields: true })).join('')}</div>`;
  const er = $('#eres'); if (er) er.addEventListener('click', () => { L.f = blankF(); updList(items, o); });
  // pagination
  const pg = $('#pages');
  if (pages > 1) {
    const nums = []; for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - L.page) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
    pg.innerHTML = `<div class="pages">${L.page > 1 ? `<button class="nx" type="button" data-pg="${L.page - 1}" aria-label="←">${ic('chl', 's')}</button>` : ''}${nums.map(n => n === '…' ? '<span>…</span>' : `<button type="button" data-pg="${n}" class="${n === L.page ? 'on' : ''}"${n === L.page ? ' aria-current="page"' : ''}>${n}</button>`).join('')}${L.page < pages ? `<button class="nx" type="button" data-pg="${L.page + 1}" aria-label="→">${ic('chr', 's')}</button>` : ''}<span style="margin-left:8px;font-size:13px">${t('found')}: ${fmtN(res.length)}</span></div>`;
    $$('[data-pg]', pg).forEach(b => b.addEventListener('click', () => { L.page = +b.dataset.pg; updList(items, o); $('.ptitle').scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); }));
  } else pg.innerHTML = res.length ? `<div class="pages"><span style="font-size:13px">${t('found')}: ${fmtN(res.length)}</span></div>` : '';
}
function viewCategory(id) {
  const c = S.catById.get(id); if (!c) return viewNotFound();
  const path = catPath(c);
  const subs = (c.ch || []).map(x => S.catById.get(x)).filter(k => k && catItems(k).length);
  viewListing({ key: 'c' + id, title: cn(c), ids: catItems(c), subs, crumbs: path.map((x, i) => [i < path.length - 1 ? 'c' + x.id : '', cn(x)]) });
}
function viewSearch() {
  const q = parseQ(S.q);
  for (const it of S.items) it._sc = score(it, q);
  const ids = S.items.filter(it => it._sc > 0).map(it => it.id);
  viewListing({ key: 'search:' + S.q, title: q.raw ? `${t('searchFor')}: «${q.raw}»` : t('searchFor'), ids, scored: !!q.raw, crumbs: [['', t('searchFor')]] });
}
