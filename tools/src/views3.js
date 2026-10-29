/* ===== auth & account (demo, browser-only) ===== */
function viewAuth(mode) {
  setTitle(mode === 'register' ? t('regT') : t('login'));
  const reg = mode === 'register';
  const type = S._regType || 'fiz';
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', reg ? t('regT') : t('login')]])}<form class="card auth" id="af" novalidate>
    <h1>${reg ? t('regT') : t('authT')}</h1>
    ${reg ? `<div class="seg" role="group">${[['fiz', t('fiz')], ['fop', t('fop')], ['ur', t('ur')]].map(([k, l]) => `<button type="button" data-rt="${k}" aria-pressed="${k === type}">${l}</button>`).join('')}</div>` : ''}
    ${reg ? `<div class="two"><div class="fld" data-req><label for="a-first">${t('firstName')}<i>*</i></label><input id="a-first" autocomplete="given-name"><span class="err" hidden>${t('req')}</span></div><div class="fld"><label for="a-last">${t('lastName')}</label><input id="a-last" autocomplete="family-name"></div></div>` : ''}
    <div class="fld" data-phone><label for="a-phone">${t('phone')}<i>*</i></label><input id="a-phone" type="tel" autocomplete="tel" placeholder="+380"><span class="err" hidden>${t('badPhone')}</span></div>
    ${reg ? `<div class="fld"><label for="a-email">E-mail</label><input id="a-email" type="email" autocomplete="email"></div>` : ''}
    ${reg && type !== 'fiz' ? `<div class="fld" data-req><label for="a-company">${type === 'fop' ? (S.lang === 'ru' ? 'ФИО предпринимателя' : 'ПІБ підприємця') : t('companyName')}<i>*</i></label><input id="a-company" autocomplete="organization"><span class="err" hidden>${t('req')}</span></div>
      <div class="two"><div class="fld" data-req><label for="a-edrpou">${type === 'fop' ? t('ipn') : t('edrpou')}<i>*</i></label><input id="a-edrpou" inputmode="numeric"><span class="err" hidden>${t('req')}</span></div><div class="fld"><label for="a-city">${t('city')}</label><input id="a-city"></div></div>
      ${type === 'ur' ? `<div class="fld"><label for="a-addr">${t('legalAddr')}</label><input id="a-addr"></div>` : ''}` : ''}
    <div class="fld"><label for="a-pass">${t('password')}</label><input id="a-pass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}"></div>
    <p class="demo-note">${t('demoAuth')}</p>
    <span class="err" id="a-err" hidden style="color:var(--danger);font-size:13.5px">${t('noUser')}</span>
    <button class="btn lg" type="submit">${reg ? t('createAcc') : t('login')}</button>
    <p class="muted" style="font-size:14px">${reg ? t('haveAcc') : t('noAcc')} <a class="link" href="#${reg ? 'login' : 'register'}">${reg ? t('login') : t('register')}</a></p>
  </form></div>`;
  $$('[data-rt]').forEach(b => b.addEventListener('click', () => { S._regType = b.dataset.rt; viewAuth('register'); }));
  $('#af').addEventListener('submit', e => {
    e.preventDefault(); let first = null;
    $$('#af [data-req]').forEach(f => { const inp = $('input', f); const bad = !inp.value.trim(); f.classList.toggle('bad', bad); $('.err', f).hidden = !bad; if (bad && !first) first = inp; });
    const pf = $('#af [data-phone]'), ph = $('#a-phone').value.trim(), dg = ph.replace(/\D/g, ''), badP = dg.length < 10 || dg.length > 12;
    pf.classList.toggle('bad', badP); $('.err', pf).hidden = !badP; if (badP && !first) first = $('#a-phone');
    if (first) { first.focus(); return; }
    const key = dg.slice(-10);
    if (reg) {
      const v = id => ($('#a-' + id) || {}).value?.trim() || '';
      S.users[key] = { type, first: v('first'), last: v('last'), phone: ph, email: v('email'), company: v('company'), edrpou: v('edrpou'), city: v('city'), addr: v('addr') };
      S.user = S.users[key];
    } else {
      if (!S.users[key]) { $('#a-err').hidden = false; return; }
      S.user = S.users[key];
    }
    saveAll(); renderChrome(); location.hash = 'account';
  });
}
function accNav(cur) {
  const ws = isWholesale();
  const items = [['account', t('profile'), 'user'], ['account-orders', t('myOrders'), 'cart'], ...(ws ? [['account-invoices', t('invoices'), 'file'], ['account-delivery', t('delivTpl'), 'truck']] : []), ['favorites', t('favorites'), 'heart']];
  return `<nav class="card" aria-label="${t('cabinet')}">${items.map(([h, l, i]) => `<a href="#${h}"${h === cur ? ' aria-current="page"' : ''}>${ic(i, 's')} ${esc(l)}</a>`).join('')}<button type="button" id="logout">${ic('logout', 's')} ${t('logout')}</button></nav>`;
}
function accShell(cur, title, body) {
  if (!S.user) { location.hash = 'login'; return false; }
  setTitle(title);
  $('#view').innerHTML = `<div class="wrap">${crumbs([['account', t('cabinet')], ['', title]])}<div class="ptitle"><h1>${esc(title)}</h1>${isWholesale() ? `<span class="pill y">ОПТ · ${esc(S.user.type === 'fop' ? t('fop') : t('ur'))}</span>` : ''}</div><div class="acc">${accNav(cur)}<div class="card pane">${body}</div></div></div>`;
  $('#logout').addEventListener('click', () => { S.user = null; saveAll(); renderChrome(); location.hash = 'home'; });
  return true;
}
function viewAccount() {
  const u = S.user; if (!u) { location.hash = 'login'; return; }
  const f = (id, l, v, attrs = '') => `<div class="fld"><label for="p-${id}">${l}</label><input id="p-${id}" value="${esc(v || '')}" ${attrs}></div>`;
  if (!accShell('account', isWholesale() ? t('optProfile') : t('profile'), `
    <form id="pf" style="display:grid;gap:14px" novalidate>
      <div class="two">${f('first', t('firstName'), u.first, 'autocomplete="given-name"')}${f('last', t('lastName'), u.last, 'autocomplete="family-name"')}</div>
      <div class="two">${f('phone', t('phone'), u.phone, 'type="tel" autocomplete="tel"')}${f('email', 'E-mail', u.email, 'type="email" autocomplete="email"')}</div>
      ${isWholesale() ? `<div class="two">${f('company', t('companyName'), u.company)}${f('edrpou', u.type === 'fop' ? t('ipn') : t('edrpou'), u.edrpou)}</div><div class="two">${f('city', t('city'), u.city)}${f('addr', t('legalAddr'), u.addr)}</div><p class="demo-note">${t('optNote')}</p>` : `<p class="demo-note">${S.lang === 'ru' ? 'Покупаете для СТО, магазина или автопарка? Зарегистрируйтесь как ФЛП или юрлицо — менеджер подключит оптовые цены.' : 'Купуєте для СТО, магазину чи автопарку? Зареєструйтеся як ФОП або юрособа — менеджер підключить оптові ціни.'} <a class="link" href="#register" id="toOpt">${t('dealerT')}</a></p>`}
      <div><button class="btn" type="submit">${t('save')}</button></div></form>`)) return;
  const to = $('#toOpt'); if (to) to.addEventListener('click', () => { S._regType = 'fop'; });
  $('#pf').addEventListener('submit', e => { e.preventDefault(); ['first', 'last', 'phone', 'email', 'company', 'edrpou', 'city', 'addr'].forEach(k => { const el = $('#p-' + k); if (el) u[k] = el.value.trim(); }); const key = (u.phone || '').replace(/\D/g, '').slice(-10); if (key) S.users[key] = u; saveAll(); renderChrome(); toast(t('saved')); });
}
function viewOrders() {
  accShell('account-orders', t('myOrders'), S.orders.length ? S.orders.map((o, i) => `<div class="ord"><div class="oh"><b>${esc(o.no)}</b><span class="pill y">${t('stNew')}</span></div><span class="muted">${fmtDate(o.date.slice(0, 10))} · ${o.n} ${plural(o.n)} · <b style="color:var(--ink)">${moneyTxt(o.sum)}</b></span>
    <details><summary class="link" style="cursor:pointer;width:max-content">${t('delivDetail')}</summary><pre style="white-space:pre-wrap;font:500 12.5px/1.55 ui-monospace,Menlo,Consolas,monospace;background:var(--soft);padding:12px;border-radius:10px;margin:8px 0 0">${esc(o.text)}</pre><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" type="button" data-copy-order="${i}">${t('copyOrder')}</button><button class="btn line sm" type="button" data-repeat="${i}">${S.lang === 'ru' ? 'Повторить заказ' : 'Повторити замовлення'}</button></div></details></div>`).join('')
    : `<div class="empty" style="padding:30px"><span class="ei">${ic('cart')}</span><b>${t('ordersEmpty')}</b><a class="btn" href="#catalog">${t('toCatalog')}</a></div>`);
  $$('[data-copy-order]').forEach(b => b.addEventListener('click', () => copyText(S.orders[+b.dataset.copyOrder].text)));
  $$('[data-repeat]').forEach(b => b.addEventListener('click', () => { (S.orders[+b.dataset.repeat].lines || []).forEach(l => { if (S.byId.get(l.id)) addToCart(l.id, l.q, l.wh); }); location.hash = 'cart'; }));
}
function viewInvoices() {
  if (!isWholesale()) { location.hash = 'account'; return; }
  accShell('account-invoices', t('invoices'), `<div class="empty" style="padding:30px"><span class="ei">${ic('file')}</span><p>${t('invEmpty')}</p></div>`);
}
function viewTpls() {
  if (!isWholesale()) { location.hash = 'account'; return; }
  const body = `${S.tpls.length ? S.tpls.map((x, i) => `<div class="ord"><div class="oh"><b>${esc(x.name)}</b><button class="link" type="button" data-tdel="${i}">${t('del')}</button></div><span class="muted">${esc([delivLabel(x.dv), x.city, x.branch, x.addr, x.rname, x.rphone].filter(Boolean).join(' · '))}</span></div>`).join('') : `<p class="muted">${t('tplEmpty')}</p>`}
    <form id="tf" class="ord" style="gap:12px" novalidate><b>${t('add')}</b>
      <div class="two"><div class="fld" data-req><label for="t-name">${t('tplName')}<i>*</i></label><input id="t-name" placeholder="${S.lang === 'ru' ? 'Склад клиента, Львов' : 'Склад клієнта, Львів'}"><span class="err" hidden>${t('req')}</span></div>
        <div class="fld"><label for="t-dv">${t('delivWay')}</label><select id="t-dv">${DELIV.map(k => `<option value="${k}">${esc(delivLabel(k))}</option>`).join('')}</select></div></div>
      <div class="two"><div class="fld"><label for="t-city">${t('city')}</label><input id="t-city"></div><div class="fld"><label for="t-branch">${t('branch')} / ${t('address')}</label><input id="t-branch"></div></div>
      <div class="two"><div class="fld"><label for="t-rname">${t('recipient')}</label><input id="t-rname"></div><div class="fld"><label for="t-rphone">${t('phone')}</label><input id="t-rphone" type="tel"></div></div>
      <div><button class="btn sm" type="submit">${t('save')}</button></div></form>`;
  if (!accShell('account-delivery', t('delivTpl'), body)) return;
  $$('[data-tdel]').forEach(b => b.addEventListener('click', () => { S.tpls.splice(+b.dataset.tdel, 1); saveAll(); viewTpls(); }));
  $('#tf').addEventListener('submit', e => { e.preventDefault(); const v = id => $('#t-' + id).value.trim(); const f = $('#tf [data-req]'); if (!v('name')) { f.classList.add('bad'); $('.err', f).hidden = false; $('#t-name').focus(); return; } S.tpls.push({ name: v('name'), dv: v('dv'), city: v('city'), branch: v('branch'), rname: v('rname'), rphone: v('rphone') }); saveAll(); viewTpls(); toast(t('saved')); });
}
function viewFavorites() {
  setTitle(t('liked'));
  const list = [...S.fav].map(id => S.byId.get(id)).filter(Boolean);
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', t('liked')]])}<div class="ptitle"><h1>${t('liked')}</h1>${list.length ? `<button class="btn sm" type="button" id="favAll">${ic('cart', 's')} ${S.lang === 'ru' ? 'Всё в корзину' : 'Усе до кошика'}</button>` : ''}</div>
    ${list.length ? `<div class="grid" style="padding-bottom:32px">${list.map(it => card(it, { fields: true })).join('')}</div>` : `<div class="empty" style="margin-bottom:32px"><span class="ei">${ic('heart')}</span><b>${t('favEmpty')}</b><p>${t('favEmptyS')}</p><a class="btn" href="#catalog">${t('toCatalog')}</a></div>`}</div>`;
  const fa = $('#favAll'); if (fa) fa.addEventListener('click', () => { list.filter(x => x._av).forEach(x => { if (!S.cart.some(l => l.id === x.id)) S.cart.push({ id: x.id, wh: bestWh(x), q: x.mo || 1 }); }); saveAll(); updateBadges(); cartModal(); });
}

/* ===== catalogue index, brands, news ===== */
function viewCatalog() {
  setTitle(t('catalog'));
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', t('catalog')]])}<div class="ptitle"><h1>${t('catalog')}</h1><span class="muted">${fmtN(S.items.length)} ${plural(S.items.length)}</span></div>
    <div class="cat-index">${topCats().map(c => `<section class="card cix"><a class="cix-h" href="#c${c.id}"><span class="cix-i">${ic(CAT_ICON[c.k] || 'cParts')}</span><span><b>${esc(cn(c))}</b><small>${fmtN(catItems(c).length)} ${plural(catItems(c).length)}</small></span></a>
      ${(c.ch || []).length ? `<div class="cix-l">${(c.ch || []).map(x => S.catById.get(x)).filter(k => k && catItems(k).length).map(k => `<a href="#c${k.id}">${esc(cn(k))} <small>${catItems(k).length}</small></a>`).join('')}</div>` : ''}</section>`).join('')}</div></div>`;
}
function viewBrands() {
  setTitle(t('brandsT'));
  loadAux('brandImgs').then(() => {
    const list = S.brands.slice().sort((a, b) => (!!S.brandImgs[b.s] - !!S.brandImgs[a.s]) || b.cnt - a.cnt);
    $('#view').innerHTML = `<div class="wrap">${crumbs([['', t('brandsT')]])}<div class="ptitle"><h1>${t('brandsT')}</h1><span class="muted">${list.length}</span></div>
      <div class="brand-grid" style="padding-bottom:32px">${list.map(b => `<a class="card" href="#b-${b.h}"><span class="lg">${S.brandImgs[b.s] ? `<img src="data:image/webp;base64,${S.brandImgs[b.s]}" alt="">` : `<b>${esc(b.n)}</b>`}</span><span>${esc(b.n)}</span><small>${fmtN(b.cnt)} ${plural(b.cnt)}</small></a>`).join('')}</div></div>`;
  });
}
function viewBrand(h) {
  const b = S.brands.find(x => x.h === h); if (!b) return viewNotFound();
  const ids = S.items.filter(i => i.bs === b.s).map(i => i.id);
  viewListing({ key: 'b-' + h, title: b.n, ids, crumbs: [['brands', t('brandsT')], ['', b.n]] });
}
function viewNew() {
  const ids = S.items.slice().sort((a, b) => b.id - a.id).slice(0, 120).map(i => i.id);
  viewListing({ key: 'new', title: t('newT'), ids, crumbs: [['', t('novelties')]] });
  if (S.L.sort === 'def') { S.L.sort = 'new'; $('#sort').value = 'new'; $('#sort').dispatchEvent(new Event('change')); }
}
function viewNews(id) {
  const L = L_KEY[S.lang];
  if (id) {
    const p = BLOG.find(x => x.id === id); if (!p) return viewNotFound();
    setTitle(p.t[L]);
    const c = S.catByKey.get(p.cat);
    const rel = c ? catItems(c).map(x => S.byId.get(x)).filter(x => x && x.i != null && x._av && (!p.q || x._t.includes(stem(p.q.split(' ')[0])))).slice(0, 10) : [];
    $('#view').innerHTML = `<div class="wrap">${crumbs([['news', t('news')], ['', p.t[L]]])}<article class="card prose" style="max-width:880px">
      <time class="muted" datetime="${p.date}">${fmtDate(p.date)}</time><h1>${esc(p.t[L])}</h1>${p.b[L].map(x => `<p>${esc(x)}</p>`).join('')}
      ${c ? `<p><a href="#c${c.id}">${esc(cn(c))} →</a></p>` : ''}</article>
      ${rel.length ? `<section class="sec"><div class="sec-h"><h2>${S.lang === 'ru' ? 'Товары по теме' : 'Товари за темою'}</h2>${pagerCtl('rowRel')}</div><div class="row-scroll" id="rowRel">${rel.map(x => card(x)).join('')}</div></section>` : '<div style="height:32px"></div>'}</div>`;
    bindPager('rowRel'); return;
  }
  setTitle(t('news'));
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', t('news')]])}<div class="ptitle"><h1>${t('blog')}</h1></div><div class="blog" style="padding-bottom:32px">${BLOG.map(postCard).join('')}</div></div>`;
}

/* ===== info pages ===== */
const INFO = [['about', 'about_us', 'about'], ['delivery', 'delivery', 'payDelivery'], ['warranty', 'garantiya', 'warranty'], ['returns', 'reklamatsiya', 'returns'], ['oferta', 'oferta', 'oferta'], ['dropshipping', null, 'dropshipping'], ['contacts', 'contact', 'fContacts']];
function sanitize(html) {
  const d = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  d.querySelectorAll('script,style,iframe,object,embed,form,input,button,select,textarea,img,svg,video,link,meta,noscript,.breadcrumb,h1').forEach(e => e.remove());
  d.querySelectorAll('*').forEach(e => { [...e.attributes].forEach(a => { if (!['href', 'colspan', 'rowspan'].includes(a.name)) e.removeAttribute(a.name); }); if (e.tagName === 'A') { const h = e.getAttribute('href') || ''; if (!/^https?:/.test(h)) e.removeAttribute('href'); else { e.setAttribute('target', '_blank'); e.setAttribute('rel', 'noopener'); } } });
  d.querySelectorAll('table').forEach(tb => { const w = d.createElement('div'); w.className = 'tw'; tb.replaceWith(w); w.appendChild(tb); });
  const root = d.body.firstChild;
  root.querySelectorAll('div, span').forEach(e => { if (!e.textContent.trim() && !e.querySelector('table')) e.remove(); });
  return root.innerHTML.replace(/(<br>\s*){3,}/g, '<br><br>');
}
async function viewInfo(key) {
  const row = INFO.find(r => r[0] === key); if (!row) return viewNotFound();
  setTitle(t(row[2]));
  await loadAux('info');
  const src = row[1] && S.info && (S.lang === 'ru' && S.info.ru && S.info.ru[row[1]] ? S.info.ru[row[1]] : (S.info.ua || {})[row[1]]);
  let body = '';
  const ru = S.lang === 'ru';
  if (key === 'contacts') {
    body = `<h1>${t('fContacts')}</h1><div class="facts">
      <div><span>${t('phone')}</span><b style="font-size:20px">${esc(CONFIG.phone)}</b><button class="link" type="button" data-copy="${esc(CONFIG.phone)}" style="justify-self:start">${t('copied').replace(/о$/, '')}${ru ? '' : ''}</button></div>
      <div><span>${t('phone')} 2</span><b style="font-size:20px">${esc(CONFIG.phone2)}</b><button class="link" type="button" data-copy="${esc(CONFIG.phone2)}" style="justify-self:start">copy</button></div>
      <div><span>Viber</span><b style="font-size:20px">${esc(CONFIG.viber)}</b><button class="link" type="button" data-copy="${esc(CONFIG.viber)}" style="justify-self:start">copy</button></div>
      <div><span>Telegram</span><b style="font-size:20px">@${esc(CONFIG.telegram)}</b><a class="link" href="https://t.me/${CONFIG.telegram}" target="_blank" rel="noopener">t.me</a></div>
      <div><span>E-mail</span><b style="font-size:17px">${esc(CONFIG.email)}</b><button class="link" type="button" data-copy="${esc(CONFIG.email)}" style="justify-self:start">copy</button></div></div>
      <h2>${ru ? 'Склады' : 'Склади'}</h2><ul><li><b>${ru ? 'Киев' : 'Київ'}</b> — ${esc(loc(CONFIG.kyiv))}</li><li><b>${ru ? 'Харьков' : 'Харків'}</b> — ${esc(loc(CONFIG.kharkiv))}</li></ul>
      <h2>${t('schedule')}</h2><ul>${loc(CONFIG.hours).map(h => `<li>${esc(h)}</li>`).join('')}<li>${t('shipUntil')}</li></ul>
      <h2>${ru ? 'Реквизиты' : 'Реквізити'}</h2><p>${esc(CONFIG.company)}, ${t('edrpou')} ${esc(CONFIG.edrpou)}</p>`;
    body = body.replace(/>copy</g, `>${ru ? 'Копировать' : 'Копіювати'}<`).replace(new RegExp(`>${t('copied').replace(/о$/, '')}<`), `>${ru ? 'Копировать' : 'Копіювати'}<`);
  } else if (key === 'dropshipping') body = `<h1>${t('dropshipping')}</h1>${DROP[L_KEY[S.lang]].map(p => `<p>${esc(p)}</p>`).join('')}<p><a class="btn" href="#register" style="color:#000;text-decoration:none" id="toReg">${t('dealerT')}</a></p>`;
  else if (key === 'about') body = `<h1>${t('about')}</h1><div class="facts"><div><b>${fmtN(S.items.length)}</b><span>${ru ? 'товаров в каталоге' : 'товарів у каталозі'}</span></div><div><b>${S.brands.length}</b><span>${ru ? 'производителей' : 'виробників'}</span></div><div><b>2</b><span>${ru ? 'склада — Киев и Харьков' : 'склади — Київ і Харків'}</span></div><div><b>16:30</b><span>${ru ? 'отгрузка в день заказа до' : 'відвантаження в день замовлення до'}</span></div></div>${src && src.html ? sanitize(src.html) : ''}`;
  else body = `<h1>${esc((src && src.h1) || t(row[2]))}</h1>${src && src.html ? sanitize(src.html) : `<p>${ru ? 'Текст готовится.' : 'Текст готується.'}</p>`}`;
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', t(row[2])]])}<div class="txt"><nav class="card">${INFO.map(r => `<a href="#${r[0]}"${r[0] === key ? ' aria-current="page"' : ''}>${t(r[2])}</a>`).join('')}<a href="#brands">${t('makers')}</a><a href="#news">${t('news')}</a></nav><article class="card prose">${body}</article></div></div>`;
  const tr = $('#toReg'); if (tr) tr.addEventListener('click', () => { S._regType = 'fop'; });
}
function viewNotFound() {
  setTitle('404');
  $('#view').innerHTML = `<div class="wrap" style="padding-block:24px 40px"><div class="empty"><span class="ei" style="font-weight:800;font-size:22px">404</span><b>${t('notFoundT')}</b><p>${t('notFoundS')}</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn" href="#home">${t('toHome')}</a><a class="btn line" href="#catalog">${t('toCatalog')}</a></div></div></div>`;
}

/* ===== router ===== */
function route() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  openMega(false); closeModal(); openFilters(false); closeSugg(); closeUserMenu();
  if (h !== 'order-done' && S.done && h !== 'cart') S.done = null;
  let m;
  if (h === 'home') viewHome();
  else if ((m = h.match(/^c(\d+)$/))) viewCategory(+m[1]);
  else if ((m = h.match(/^p(\d+)$/))) viewProduct(+m[1]);
  else if ((m = h.match(/^b-([a-z0-9-]+)$/))) viewBrand(m[1]);
  else if ((m = h.match(/^news-(\d+)$/))) viewNews(+m[1]);
  else if (h === 'catalog') viewCatalog();
  else if (h === 'search') viewSearch();
  else if (h === 'cart') viewCart();
  else if (h === 'checkout') viewCheckout();
  else if (h === 'order-done') viewDone();
  else if (h === 'favorites') viewFavorites();
  else if (h === 'brands') viewBrands();
  else if (h === 'new') viewNew();
  else if (h === 'news') viewNews();
  else if (h === 'login') viewAuth('login');
  else if (h === 'register') viewAuth('register');
  else if (h === 'account') viewAccount();
  else if (h === 'account-orders') viewOrders();
  else if (h === 'account-invoices') viewInvoices();
  else if (h === 'account-delivery') viewTpls();
  else if (INFO.some(r => r[0] === h)) viewInfo(h);
  else viewNotFound();
  if (S.routeKey !== h) window.scrollTo(0, 0);
  S.routeKey = h;
  $('#view').focus({ preventScroll: true });
}

/* ===== search suggestions ===== */
let sugIdx = -1;
function closeSugg() { const s = $('#sugg'); if (s) s.hidden = true; }
function renderSugg(v) {
  const box = $('#sugg'); const q = parseQ(v);
  if (!q.raw || q.raw.length < 2) { box.hidden = true; return; }
  const hits = S.items.map(it => [it, score(it, q)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || (b[0]._av - a[0]._av));
  const ql = q.raw.toLowerCase();
  const cats = S.cats.filter(c => catItems(c).length && (c.n.toLowerCase().includes(ql) || (c.r || '').toLowerCase().includes(ql) || q.toks.every(k => (c.n + ' ' + (c.r || '')).toLowerCase().includes(k.w)))).slice(0, 4);
  if (!hits.length && !cats.length) { box.innerHTML = `<div class="sg-empty">${t('nothingT')}. <a class="link" href="#contacts">${t('contactUs')}</a></div>`; box.hidden = false; return; }
  box.innerHTML = (cats.length ? `<div class="sg-h">${t('cats')}</div>${cats.map(c => `<a class="sg-c" href="#c${c.id}"><span>${esc(catPath(c).map(cn).join(' › '))}</span><small class="muted">${catItems(c).length}</small></a>`).join('')}` : '')
    + (hits.length ? `<div class="sg-h">${t('goods')}</div>${hits.slice(0, 6).map(([it]) => `<a class="sg-p" href="#p${it.id}"><span class="sg-ph">${pimg(it)}</span><span><span class="sg-n">${esc(nm(it))}</span><span class="sg-m">${esc([it.b, it.cc].filter(Boolean).join(' · '))}</span></span><span class="sg-pr">${moneyTxt(priceOf(it))}</span></a>`).join('')}<a class="sg-all" href="#search" data-sall>${t('allResults')}: ${fmtN(hits.length)} →</a>` : '');
  box.hidden = false; sugIdx = -1;
}
function goSearch(v) { S.q = String(v || '').trim(); try { sessionStorage.setItem('pl-q', S.q); } catch (e) {} S.L = null; closeSugg(); if (location.hash === '#search') route(); else location.hash = 'search'; }
function closeUserMenu() { const p = $('#umenu'); if (p) p.remove(); $('#userbtn')?.setAttribute('aria-expanded', 'false'); }

/* ===== global events ===== */
function bindGlobal() {
  document.addEventListener('click', e => {
    const tg = e.target;
    const q = tg.closest('[data-qd]'); if (q) { const inp = $('input', q.closest('[data-qbox]')); inp.value = Math.max(+inp.min || 1, (parseInt(inp.value, 10) || 1) + +q.dataset.qd); inp.dispatchEvent(new Event('change', { bubbles: true })); return; }
    const add = tg.closest('[data-add]'); if (add) { const qi = add.dataset.qty && document.getElementById(add.dataset.qty); addToCart(+add.dataset.add, qi ? qi.value : undefined); return; }
    const fav = tg.closest('[data-fav]'); if (fav) { toggleFav(+fav.dataset.fav); return; }
    const oc = tg.closest('[data-oneclick]'); if (oc) { oneClick(+oc.dataset.oneclick); return; }
    const ask = tg.closest('[data-ask]'); if (ask) { oneClick(+ask.dataset.ask, 'ask'); return; }
    const cp = tg.closest('[data-copy]'); if (cp) { copyText(cp.dataset.copy, `${t('copied')}: ${cp.dataset.copy}`); return; }
    const oc2 = tg.closest('[data-open-cart]'); if (oc2 && !matchMedia('(max-width: 860px)').matches && location.hash !== '#cart' && location.hash !== '#checkout') { e.preventDefault(); $('#toast').classList.remove('on'); cartModal(); return; }
    const sr = tg.closest('[data-search]'); if (sr) { e.preventDefault(); goSearch(sr.dataset.search); return; }
    const lg = tg.closest('[data-lang]'); if (lg) { S.lang = lg.dataset.lang; document.documentElement.lang = S.lang === 'ru' ? 'ru' : 'uk'; saveAll(); renderChrome(); route(); return; }
    if (tg.closest('#catbtn')) { openMega(!S.megaOpen); return; }
    if (tg.closest('#burger')) { openMobileMenu(); return; }
    if (tg.closest('#userbtn')) { toggleUserMenu(); return; }
    if (S.megaOpen && !tg.closest('.mega')) openMega(false);
    if (!tg.closest('.search')) closeSugg();
    if (!tg.closest('.user-w')) closeUserMenu();
    if (tg.closest('#totop')) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.addEventListener('submit', e => { if (e.target.id === 'sform') { e.preventDefault(); const links = $$('#sugg a'); if (sugIdx >= 0 && links[sugIdx] && !links[sugIdx].hasAttribute('data-sall')) { location.hash = links[sugIdx].getAttribute('href').slice(1); closeSugg(); } else goSearch($('#q').value); $('#q').blur(); } });
  document.addEventListener('input', e => { if (e.target.id === 'q') renderSugg(e.target.value); });
  document.addEventListener('focusin', e => { if (e.target.id === 'q' && e.target.value) renderSugg(e.target.value); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); openMega(false); closeSugg(); openFilters(false); closeUserMenu(); return; }
    if (e.target.id === 'q' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { const links = $$('#sugg a'); if ($('#sugg').hidden || !links.length) return; e.preventDefault(); sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length; links.forEach((a, i) => a.classList.toggle('on', i === sugIdx)); links[sugIdx].scrollIntoView({ block: 'nearest' }); }
  });
  document.addEventListener('click', e => { const a = e.target.closest('#sugg a'); if (a && a.hasAttribute('data-sall')) { e.preventDefault(); goSearch($('#q').value); } else if (a) closeSugg(); }, true);
  window.addEventListener('scroll', () => { $('#totop').classList.toggle('on', window.scrollY > 700); }, { passive: true });
  window.addEventListener('hashchange', route);
}
function toggleUserMenu() {
  if ($('#umenu')) return closeUserMenu();
  const w = $('.user-w'); const p = document.createElement('div'); p.className = 'menu-pop'; p.id = 'umenu';
  p.innerHTML = S.user ? `<a href="#account">${t('profile')}</a><a href="#account-orders">${t('myOrders')}</a>${isWholesale() ? `<a href="#account-invoices">${t('invoices')}</a><a href="#account-delivery">${t('delivTpl')}</a>` : ''}<a href="#favorites">${t('favorites')}</a><button type="button" id="ulogout">${t('logout')}</button>` : `<a href="#login">${t('login')}</a><a href="#register">${t('register')}</a>`;
  w.appendChild(p); $('#userbtn').setAttribute('aria-expanded', 'true');
  const lo = $('#ulogout'); if (lo) lo.addEventListener('click', () => { S.user = null; saveAll(); renderChrome(); location.hash = 'home'; });
}
function openMobileMenu() {
  const ru = S.lang === 'ru';
  const m = modal(`<div class="mh"><a class="logo" href="#home" data-close style="color:var(--accent)">${LOGO()}</a><button type="button" data-close aria-label="${t('close')}">${ic('x')}</button></div>
    <div class="mb mmenu"><div class="lang" style="gap:16px"><button type="button" data-lang="ua" aria-pressed="${S.lang === 'ua'}" style="color:var(--ink)">UA</button><button type="button" data-lang="ru" aria-pressed="${S.lang === 'ru'}" style="color:var(--ink)">RU</button></div>
      <nav class="mm-cats">${topCats().map(c => `<a href="#c${c.id}" data-close>${ic(CAT_ICON[c.k] || 'cParts', 's')} ${esc(cn(c))}</a>`).join('')}</nav>
      <nav class="mm-links"><a href="${S.user ? '#account' : '#login'}" data-close>${ic('user', 's')} ${S.user ? t('cabinet') : t('login')}</a><a href="#favorites" data-close>${ic('heart', 's')} ${t('favorites')}</a><a href="#brands" data-close>${t('brandsT')}</a><a href="#delivery" data-close>${t('payDelivery')}</a><a href="#warranty" data-close>${t('warranty')}</a><a href="#returns" data-close>${t('returns')}</a><a href="#dropshipping" data-close>${t('dropshipping')}</a><a href="#about" data-close>${t('about')}</a><a href="#contacts" data-close>${t('fContacts')}</a></nav>
      <div class="mm-contact"><a href="tel:${CONFIG.phoneTel}"><b class="num">${esc(CONFIG.phone)}</b></a><span class="muted">${esc(loc(CONFIG.hoursShort))}</span><div style="display:flex;gap:10px"><a class="btn sm" href="https://t.me/${CONFIG.telegram}" target="_blank" rel="noopener">${ic('telegram', 's')} Telegram</a><a class="btn line sm" href="viber://chat?number=%2B${CONFIG.viber.replace(/\D/g, '')}">${ic('viber', 's')} Viber</a></div></div></div>`, 'msheet');
  m.classList.add('side');
}

/* ===== boot ===== */
(async function boot() {
  loadAll(); document.documentElement.lang = S.lang === 'ru' ? 'ru' : 'uk';
  renderChrome(); bindGlobal();
  $('#view').innerHTML = `<div class="wrap" style="padding-block:24px"><div class="grid">${'<div class="sk"></div>'.repeat(10)}</div></div>`;
  try {
    const r = await fetch('data/catalog.json'); if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    S.wh = d.wh; S.cats = d.cats; S.items = d.items; S.brands = d.brands;
    S.cats.forEach(c => { S.catById.set(c.id, c); S.catByKey.set(c.k, c); c._own = []; });
    S.items.forEach(it => { S.byId.set(it.id, it); (it.c || []).forEach(cid => { const c = S.catById.get(cid); if (c) c._own.push(it.id); }); });
    S.items.forEach(indexItem);
    const maxId = Math.max(...S.items.map(i => i.id)); S.items.forEach(i => { i._new = i.id > maxId - 150 && !i.ak; });
    S.brands.forEach(b => S.brandBySlug.set(b.s, b));
    S.cart = S.cart.filter(l => S.byId.has(l.id)); [...S.fav].forEach(id => { if (!S.byId.has(id)) S.fav.delete(id); });
    S.ready = true; renderChrome(); route();
    loadAux('brandImgs');
  } catch (e) {
    $('#view').innerHTML = `<div class="wrap" style="padding-block:40px"><div class="empty"><b>${t('loadingErr')}</b><p class="num">${esc(CONFIG.phone)}</p></div></div>`;
  }
})();
