/* ===== product page ===== */
function viewProduct(id) {
  const it = S.byId.get(id); if (!it) return viewNotFound();
  const L = L_KEY[S.lang];
  setTitle(nm(it));
  if (!S.banners) loadAux('banners').then(() => { if (S.routeKey === 'p' + id) { const sb = $('.ptabs > .side-ban'); if (sb) sb.outerHTML = sideBanner(); } });
  S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 20); saveAll();
  const c = S.catById.get((it.c || [])[0]); const path = c ? catPath(c) : [];
  const brand = S.brandBySlug.get(it.bs);
  const inC = S.cart.some(l => l.id === id), fav = S.fav.has(id);
  const bImg = brand && S.brandImgs && S.brandImgs[brand.s];
  const same = it.cc ? S.items.filter(x => x !== it && x._cc && x._cc === it._cc) : [];
  const sim = c ? catItems(c).map(x => S.byId.get(x)).filter(x => x && x !== it && x.i != null).sort((a, b) => (b._av - a._av) || (b._tot - a._tot)).slice(0, 10) : [];
  const viewed = S.recent.filter(x => x !== id).map(x => S.byId.get(x)).filter(Boolean).slice(0, 10);
  const descr = (it.d && (S.lang === 'ru' && it.dr ? it.dr : it.d)) || '';
  const chars = [[t('maker'), it.b || '—'], [t('article'), it.cc || '—'], [t('country'), it.co || '—'], [t('minOrder'), `${it.mo || 1} ${t('pcs')}`], ...(c ? [[t('category'), cn(c)]] : [])];
  $('#view').innerHTML = `<div class="wrap">
    ${crumbs([...path.map(x => ['c' + x.id, cn(x)]), ['', nm(it)]])}
    <div class="prod">
      <div class="card gal"><div class="main" id="gmain">${pimg(it)}</div>
        ${it.j != null ? `<div class="thumbs"><button class="t" type="button" data-g="0" aria-pressed="true">${pimg(it)}</button><button class="t" type="button" data-g="1" aria-pressed="false">${pimg(it, true)}</button></div>` : ''}</div>
      <div class="card pinfo">
        <div class="top"><div style="display:grid;gap:14px"><h1>${esc(nm(it))}</h1>
          <div class="kv"><div><small>${t('maker')}:</small>${brand ? `<a href="#b-${brand.h}">${esc(it.b)}</a>` : esc(it.b || '—')}</div><div><small>${t('article')}:</small><span>${esc(it.cc || '—')}</span></div>${tagOf(it) ? `<div>${tagOf(it)}</div>` : ''}</div></div>
          ${brand ? `<a class="bcard" href="#b-${brand.h}"><span class="lg">${bImg ? `<img src="data:image/webp;base64,${bImg}" alt="${esc(brand.n)}">` : `<b>${esc(brand.n)}</b>`}</span>${t('allBrands')}</a>` : ''}</div>
        <div>${it._av ? `<span class="instock">${ic('check', 'xs')} ${t('inStock')}</span>` : `<span class="nostock">${ic('x', 'xs')} ${t('noStock')}</span>`}</div>
        <div><div class="muted" style="font-size:13px;margin-bottom:6px">${t('warehouses')}:</div><div class="whs">${S.wh.map((w, i) => `<span>${esc(whName(i))}<small>(${esc((it._st[i] || {}).txt || '0')})</small></span>`).join('')}</div></div>
        ${priceHtml(it, true)}
        <div class="pbuy">${it._av ? `${qtyBox('pq', it.mo || 1, '', it.mo || 1)}<button class="btn lg" type="button" data-add="${id}" data-big="1" data-qty="pq">${ic('cart')} ${inC ? t('inCart') : t('toCart')}</button><button class="btn ghost lg" type="button" data-oneclick="${id}">${t('oneClick')}</button>` : `<button class="btn ghost lg" type="button" data-ask="${id}">${ic('clock')} ${t('notifyMe')}</button>`}
          <button class="heart${fav ? ' on' : ''}" type="button" data-fav="${id}" aria-pressed="${fav}" aria-label="${t('favorites')}">${ic('heart')}</button></div>
      </div>
      <aside class="card side-info">
        <div class="si"><div class="sih">${ic('truck', 's')} ${t('bDelivery')}<a href="#delivery">${t('delivDetail')} ${ic('info', 'xs')}</a></div><span><em>${t('bDelivery')}</em> ${S.lang === 'ru' ? 'осуществляется по всей территории Украины' : 'здійснюється по всій території України'}</span>
          <ul><li><i style="background:#e30613">НП</i>${t('dNP')}</li><li><i style="background:#1a73e8">D</i>${t('dDel')}</li><li><i style="background:#0b5fa5">S</i>${t('dSat')}</li></ul><span><em>${t('selfPick')}</em> ${t('selfPickT')}: ${S.lang === 'ru' ? 'Киев, Харьков' : 'Київ, Харків'}</span></div>
        <div class="si"><div class="sih">${ic('shield', 's')} ${t('bWarranty')}<a href="#warranty">${t('delivDetail')} ${ic('info', 'xs')}</a></div><span>${t('wT')}</span></div>
        <div class="si"><div class="sih">${ic('wallet', 's')} ${t('bPay')}<a href="#delivery">${t('delivDetail')} ${ic('info', 'xs')}</a></div><span>${t('payT')}</span></div>
        <div class="si"><div class="sih">${ic('refresh', 's')} ${t('retH')}<a href="#returns">${t('delivDetail')} ${ic('info', 'xs')}</a></div><span>${t('retT', { d: `<em>${CONFIG.returnDays}</em>` })}</span></div>
      </aside>
    </div>
    <div class="ptabs"><div class="card tabs">
      <div role="tablist">${[['all', t('tabAll')], ['an', t('tabAn') + (same.length ? ` (${same.length})` : '')], ['vid', t('tabVid')], ['rev', t('tabRev') + ((S.reviews[id] || []).length ? ` (${S.reviews[id].length})` : '')]].map(([k, l], i) => `<button role="tab" type="button" id="tab-${k}" aria-controls="tp-${k}" aria-selected="${!i}">${esc(l)}</button>`).join('')}</div>
      <div role="tabpanel" id="tp-all"><h3>${t('descr')}</h3><div class="desc">${descr ? descr.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('') : `<p>${esc(nm(it))}. ${S.lang === 'ru' ? 'Подробности и совместимость уточняйте у менеджера — подберём по коду, фото или VIN.' : 'Деталі та сумісність уточнюйте в менеджера — підберемо за кодом, фото чи VIN.'}</p>`}</div>
        <h3 style="margin-top:24px">${t('chars')}</h3><div class="chars">${chars.map(([k, v]) => `<div><span>${esc(k)}</span><i></i><span>${esc(v)}</span></div>`).join('')}</div></div>
      <div role="tabpanel" id="tp-an" hidden><div class="chars" style="margin-bottom:16px"><div><span>${t('anCode')}</span><i></i><span>${esc(it.cc || '—')} ${it.cc ? `<button class="link" type="button" data-copy="${esc(it.cc)}" style="margin-left:8px">${ic('copy', 'xs')}</button>` : ''}</span></div></div>
        ${same.length ? `<h3>${t('anSame')}</h3><div class="tbl">${same.map(trow).join('')}</div>` : `<p class="muted">${t('anNone')}</p>`}
        ${it.cc ? `<p style="margin-top:14px"><a class="link" href="#search" data-search="${esc(it.cc)}">${t('searchCode')} →</a></p>` : ''}</div>
      <div role="tabpanel" id="tp-vid" hidden><div class="empty" style="padding:36px 20px"><span class="ei">${ic('info')}</span><p>${t('noVideo')}</p><a class="btn sm" href="https://t.me/${CONFIG.telegram}" target="_blank" rel="noopener">Telegram</a></div></div>
      <div role="tabpanel" id="tp-rev" hidden><div class="rev" id="revs"></div></div>
    </div>${sideBanner()}</div>
    ${viewed.length ? `<section class="sec"><div class="sec-h"><h2>${t('mostViewed')}</h2>${pagerCtl('rowViewed')}</div><div class="row-scroll" id="rowViewed">${viewed.map(x => card(x)).join('')}</div></section>` : ''}
    ${sim.length ? `<section class="sec"${viewed.length ? ' style="padding-top:0"' : ''}><div class="sec-h"><h2>${t('similar')}</h2>${pagerCtl('rowSim')}</div><div class="row-scroll" id="rowSim">${sim.map(x => card(x)).join('')}</div></section>` : ''}
  </div>`;
  ['rowViewed', 'rowSim'].forEach(bindPager);
  $$('[role="tab"]').forEach(tb => tb.addEventListener('click', () => { $$('[role="tab"]').forEach(x => x.setAttribute('aria-selected', x === tb)); $$('[role="tabpanel"]').forEach(p => p.hidden = p.id !== tb.getAttribute('aria-controls')); }));
  $$('[data-g]').forEach(b => b.addEventListener('click', () => { $$('[data-g]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#gmain').innerHTML = pimg(it, b.dataset.g === '1'); }));
  renderReviews(id);
}
function renderReviews(id) {
  const box = $('#revs'); if (!box) return;
  const list = S.reviews[id] || [];
  box.innerHTML = `${list.length ? list.map(r => `<div class="ri"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>${esc(r.n)}</b><span class="stars">${'★'.repeat(r.s)}<span style="color:var(--line-2)">${'★'.repeat(5 - r.s)}</span></span></div><p>${esc(r.t)}</p><small class="muted">${fmtDate(r.d)}</small></div>`).join('') : `<p class="muted">${t('noReviews')}</p>`}
    <form id="revf" class="ri" style="gap:12px" novalidate><b>${t('leaveReview')}</b><div class="stars" id="rstars">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-st="${n}" class="${n <= 5 ? 'on' : ''}" aria-label="${n}">★</button>`).join('')}</div>
      <div class="two"><div class="fld"><label for="rv-n">${t('yourName')}</label><input id="rv-n" autocomplete="name"></div></div>
      <div class="fld"><label for="rv-t">${t('yourReview')}</label><textarea id="rv-t" rows="3"></textarea></div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button class="btn sm" type="submit">${t('send')}</button><span class="demo-note">${t('reviewNote')}</span></div></form>`;
  let stars = 5;
  $$('#rstars [data-st]').forEach(b => b.addEventListener('click', () => { stars = +b.dataset.st; $$('#rstars [data-st]').forEach(x => x.classList.toggle('on', +x.dataset.st <= stars)); }));
  $('#revf').addEventListener('submit', e => { e.preventDefault(); const n = $('#rv-n').value.trim(), tx = $('#rv-t').value.trim(); if (!n || !tx) { (!n ? $('#rv-n') : $('#rv-t')).focus(); return; } (S.reviews[id] = S.reviews[id] || []).unshift({ n, t: tx, s: stars, d: new Date().toISOString().slice(0, 10) }); saveAll(); renderReviews(id); toast(t('saved')); });
}

function sideBanner() {
  const list = (S.banners || []).filter(b => b.m);
  if (list.length) { const b = list[Math.floor(Math.random() * list.length)]; return `<a class="side-ban side-img" href="#b-${b.h}"><img src="data:image/webp;base64,${b.m}" alt="${esc(b.alt)}"></a>`; }
  return `<div class="side-ban">${banner(bannerSet()[0] || {})}</div>`;
}

/* ===== cart (modal + page) ===== */
function cartModal() {
  const lines = cartLines();
  const m = modal(`<div class="mh"><h2>${t('cart')} <small>(${cartQty()} ${plural(cartQty())})</small></h2><button type="button" data-close aria-label="${t('close')}">${ic('x')}</button></div>
    <div class="mb">${lines.length ? `<div>${lines.map((l, k) => `<div class="mline"><a class="tph" href="#p${l.id}" data-close>${pimg(l.it)}</a><div><a class="mn" href="#p${l.id}" data-close>${esc(nm(l.it))}<small>${esc(l.it.cc || '')}</small></a>
      <div class="mc"><select data-lwh="${k}" aria-label="${t('warehouse')}">${whOptions(l.it, l.wh)}</select>${qtyBox('mq' + k, l.q, 'sm')}<b>${moneyTxt(priceOf(l.it) * l.q)}</b></div></div><button class="rm" type="button" data-lrm="${k}" aria-label="${t('del')}">${ic('trash', 's')}</button></div>`).join('')}</div>
      <div class="mfoot"><button class="btn ghost" type="button" data-close>${t('continue')}</button><span class="sum">${t('sumGoods')}<b>${moneyTxt(cartSum())}</b></span><a class="btn" href="#checkout" data-close>${t('toCheckout')}</a></div>`
      : `<div class="empty" style="background:none;padding:28px 0"><span class="ei">${ic('cart')}</span><b>${t('cartEmpty')}</b><p>${t('cartEmptyS')}</p><button class="btn" type="button" data-close>${t('continue')}</button></div>`}</div>`);
  bindCartControls(m, cartModal);
}
function bindCartControls(root, rerender) {
  $$('[data-lwh]', root).forEach(s => s.addEventListener('change', () => { const k = +s.dataset.lwh; const l = S.cart[k]; const nwh = +s.value; const dup = S.cart.findIndex((x, i) => i !== k && x.id === l.id && x.wh === nwh); if (dup >= 0) { S.cart[dup].q += l.q; S.cart.splice(k, 1); } else l.wh = nwh; saveAll(); updateBadges(); rerender(); }));
  $$('[data-lrm]', root).forEach(b => b.addEventListener('click', () => { const l = S.cart.splice(+b.dataset.lrm, 1)[0]; saveAll(); updateBadges(); if (l) refreshBuyButtons(l.id); rerender(); }));
  $$('input[id^="mq"], input[id^="cq"]', root).forEach(inp => inp.addEventListener('change', () => { const k = +inp.id.slice(2); const l = S.cart[k]; if (!l) return; const it = S.byId.get(l.id); l.q = Math.max(it && it.mo || 1, parseInt(inp.value, 10) || 1); saveAll(); updateBadges(); rerender(); }));
}
function viewCart() {
  setTitle(t('cart'));
  const lines = cartLines();
  const byWh = {}; lines.forEach(l => { (byWh[l.wh] = byWh[l.wh] || { n: 0, s: 0 }); byWh[l.wh].n += l.q; byWh[l.wh].s += priceOf(l.it) * l.q; });
  const multi = Object.keys(byWh).length > 1;
  $('#view').innerHTML = `<div class="wrap">${crumbs([['', t('cart')]])}
    ${multi && S.note ? `<div class="note"><span>${t('whNote')}</span><button type="button" id="noteX" aria-label="${t('close')}">${ic('x', 's')}</button></div>` : ''}
    ${lines.length ? `<div class="cart-l"><div class="card cl">
      <div class="ch"><h2>${t('cart')} <small>(${cartQty()} ${plural(cartQty())})</small></h2><button class="btn line sm" type="button" id="clr">${ic('trash', 'xs')} ${t('clearCart')}</button></div>
      <div class="th"><span></span><span>${t('thName')}</span><span>${t('thMaker')}</span><span>${t('warehouse')}</span><span>${t('qty')}</span><span>${t('price')}</span><span></span></div>
      ${lines.map((l, k) => `<div class="tr"><a class="tph" href="#p${l.id}">${pimg(l.it)}</a><a class="c-n" href="#p${l.id}">${esc(nm(l.it))}</a><div class="c-b">${esc(l.it.b || '—')}<small>${esc(l.it.cc || '')}</small></div>
        <div class="c-w"><select data-lwh="${k}" aria-label="${t('warehouse')}">${whOptions(l.it, l.wh)}</select></div><div class="c-q">${qtyBox('cq' + k, l.q, 'sm')}<span class="lp">${moneyTxt(priceOf(l.it) * l.q)}</span></div><div class="c-p"><b>${moneyTxt(priceOf(l.it) * l.q)}</b></div><button class="rm" type="button" data-lrm="${k}" aria-label="${t('del')}">${ic('trash', 's')}</button></div>`).join('')}
      <div class="cf"><span>${t('sumGoods')}</span><b>${moneyTxt(cartSum())}</b><a class="btn" href="#checkout">${t('toCheckout')}</a></div></div>
      <aside class="card csum"><h3>${cartQty()} ${plural(cartQty())} ${t('inCartN')}</h3>${Object.entries(byWh).map(([w, v]) => `<div class="w"><small>${v.n} ${plural(v.n)} ${t('onWh')} — ${esc(whName(+w))}</small><b>${moneyTxt(v.s)}</b></div>`).join('')}<div class="tot"><small class="muted">${t('total')}</small><br><b class="num">${moneyTxt(cartSum())}</b></div><a class="btn" href="#checkout">${t('toCheckout')}</a></aside></div>`
    : `<div class="empty"><span class="ei">${ic('cart')}</span><b>${t('cartEmpty')}</b><p>${t('cartEmptyS')}</p><a class="btn" href="#catalog">${t('toCatalog')}</a></div>`}
  </div>`;
  const nx = $('#noteX'); if (nx) nx.addEventListener('click', () => { S.note = false; nx.parentElement.remove(); });
  const cl = $('#clr'); if (cl) cl.addEventListener('click', () => { const ids = S.cart.map(l => l.id); S.cart = []; saveAll(); updateBadges(); ids.forEach(refreshBuyButtons); viewCart(); });
  bindCartControls($('#view'), viewCart);
}

/* ===== checkout ===== */
const DELIV = ['np', 'npc', 'del', 'sat', 'pk', 'ph', 'drop'];
const delivLabel = k => t({ np: 'dvNP', npc: 'dvNPC', del: 'dvDel', sat: 'dvSat', pk: 'dvPK', ph: 'dvPH', drop: 'dvDrop' }[k]);
function viewCheckout() {
  setTitle(t('checkout'));
  const lines = cartLines();
  if (!lines.length) { location.hash = 'cart'; return; }
  const d = store.get('draft', {}) || {}, u = S.user || {};
  const val = k => esc(d[k] ?? (k === 'first' ? u.first : k === 'last' ? u.last : k === 'phone' ? u.phone : k === 'email' ? u.email : '') ?? '');
  const dv = DELIV.includes(d.dv) ? d.dv : 'np';
  const pay = d.pay || (isWholesale() ? 'inv' : 'cod');
  $('#view').innerHTML = `<div class="wrap">${crumbs([['cart', t('cart')], ['', t('checkout')]])}<div class="ptitle"><h1>${t('checkout')}</h1></div>
    <form class="co" id="cof" novalidate style="padding-bottom:40px">
      <div class="card box">
        <h2>${t('contactsH')}</h2>
        <div class="two"><div class="fld" data-req><label for="o-first">${t('firstName')}<i>*</i></label><input id="o-first" autocomplete="given-name" value="${val('first')}"><span class="err" hidden>${t('req')}</span></div>
          <div class="fld" data-req><label for="o-last">${t('lastName')}<i>*</i></label><input id="o-last" autocomplete="family-name" value="${val('last')}"><span class="err" hidden>${t('req')}</span></div></div>
        <div class="two"><div class="fld" data-phone><label for="o-phone">${t('phone')}<i>*</i></label><input id="o-phone" type="tel" autocomplete="tel" placeholder="+380" value="${val('phone')}"><span class="err" hidden>${t('badPhone')}</span></div>
          <div class="fld"><label for="o-email">E-mail</label><input id="o-email" type="email" autocomplete="email" value="${val('email')}"></div></div>
        ${isWholesale() ? `<div class="fld"><label for="o-company">${t('companyName')}</label><input id="o-company" autocomplete="organization" value="${esc(d.company ?? (u.company || ''))}"></div>` : ''}
        <hr><h2>${t('delivWay')}</h2>
        ${S.tpls.length ? `<div class="fld"><label for="o-tpl">${t('useTpl')}</label><select id="o-tpl"><option value="">—</option>${S.tpls.map((x, i) => `<option value="${i}">${esc(x.name)}</option>`).join('')}</select></div>` : ''}
        <div class="fld"><label for="o-dv">${t('chooseDeliv')}<i>*</i></label><select id="o-dv">${DELIV.filter(k => k !== 'drop' || isWholesale()).map(k => `<option value="${k}"${k === dv ? ' selected' : ''}>${esc(delivLabel(k))}</option>`).join('')}</select></div>
        <div id="dvf"></div>
        <hr><h2>${t('payWay')}</h2>
        <div>${[['card', t('payCard'), 'wallet'], ['inv', t('payInvoice'), 'building'], ['cod', t('payCod'), 'truck']].map(([k, l, i]) => `<label class="radio-row"><input type="radio" name="pay" value="${k}"${k === pay ? ' checked' : ''}>${ic(i, 's')}<span>${esc(l)}</span></label>`).join('')}</div>
        <hr><h2>${t('comment')}</h2><div class="fld"><label for="o-comment">${t('commentPh')}</label><textarea id="o-comment" rows="3">${val('comment')}</textarea></div>
        <div style="display:flex;justify-content:flex-end"><button class="btn lg" type="submit">${t('placeOrder')}</button></div>
      </div>
      <div style="display:grid;gap:16px;align-content:start;position:sticky;top:calc(env(safe-area-inset-top, 0px) + 88px)">
        <div class="card box items"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2>${t('goods')} <span class="muted">${lines.length}</span></h2><a class="link" href="#cart">${t('editGoods')} ${ic('chr', 'xs')}</a></div>
          <div>${lines.map(l => `<div class="it"><span class="tph">${pimg(l.it)}</span><span>${esc(nm(l.it))}<small>${esc(l.it.cc || '')} · ${esc(whName(l.wh))}</small></span><span class="r">${l.q} ${t('pcs')}<br><b>${moneyTxt(priceOf(l.it) * l.q)}</b></span></div>`).join('')}</div></div>
        <div class="total"><span>${cartQty()} ${plural(cartQty())} ${S.lang === 'ru' ? 'на сумму' : 'на суму'}</span><b>${moneyTxt(cartSum())}</b></div>
      </div>
    </form></div>`;
  const dvf = () => {
    const k = $('#o-dv').value, f = $('#dvf');
    const fld = (id, label, ph = '', req = true) => `<div class="fld"${req ? ' data-req' : ''}><label for="o-${id}">${label}${req ? '<i>*</i>' : ''}</label><input id="o-${id}" value="${esc(d[id] || '')}" placeholder="${esc(ph)}"><span class="err" hidden>${t('req')}</span></div>`;
    if (k === 'np') f.innerHTML = `<div class="two">${fld('city', t('city'))}${fld('branch', t('branch'), S.lang === 'ru' ? 'Напр. отделение №12' : 'Напр. відділення №12')}</div>`;
    else if (k === 'npc') f.innerHTML = `${fld('city', t('city'))}${fld('addr', t('address'), S.lang === 'ru' ? 'Улица, дом, квартира' : 'Вулиця, будинок, квартира')}`;
    else if (k === 'del' || k === 'sat') f.innerHTML = `<div class="two">${fld('city', t('city'))}${fld('branch', S.lang === 'ru' ? 'Представительство' : 'Представництво')}</div>`;
    else if (k === 'pk' || k === 'ph') f.innerHTML = `<p class="demo-note">${esc(k === 'pk' ? loc(CONFIG.kyiv) : loc(CONFIG.kharkiv))} · ${esc(loc(CONFIG.hoursShort))}</p>`;
    else f.innerHTML = `<div class="two">${fld('rname', t('recipient'))}${fld('rphone', t('phone'), '+380')}</div><div class="two">${fld('city', t('city'))}${fld('branch', t('branch'))}</div>${fld('cod', t('dropCod'), '0', false)}`;
  };
  dvf(); $('#o-dv').addEventListener('change', dvf);
  const tp = $('#o-tpl'); if (tp) tp.addEventListener('change', () => { const x = S.tpls[+tp.value]; if (!x) return; $('#o-dv').value = x.dv; dvf(); ['city', 'branch', 'addr', 'rname', 'rphone'].forEach(k => { const el = $('#o-' + k); if (el && x[k]) el.value = x[k]; }); });
  const keep = () => { const o = { dv: $('#o-dv').value, pay: ($('input[name=pay]:checked') || {}).value }; ['first', 'last', 'phone', 'email', 'company', 'city', 'branch', 'addr', 'rname', 'rphone', 'cod', 'comment'].forEach(k => { const el = $('#o-' + k); if (el) o[k] = el.value; }); store.set('draft', o); return o; };
  $('#cof').addEventListener('input', keep); $('#cof').addEventListener('change', keep);
  $('#cof').addEventListener('submit', e => {
    e.preventDefault(); const o = keep(); let first = null;
    $$('#cof [data-req]').forEach(f => { const inp = $('input,select,textarea', f); const bad = !inp.value.trim(); f.classList.toggle('bad', bad); $('.err', f).hidden = !bad; if (bad && !first) first = inp; });
    $$('#cof [data-phone]').forEach(f => { const inp = $('input', f); const dg = inp.value.replace(/\D/g, ''); const bad = dg.length < 10 || dg.length > 12; f.classList.toggle('bad', bad); $('.err', f).hidden = !bad; if (bad && !first) first = inp; });
    if (first) { first.focus(); first.scrollIntoView({ block: 'center' }); return; }
    placeOrder(o);
  });
}
function placeOrder(o) {
  const lines = cartLines(); const dt = new Date();
  const no = `PL-${String(dt.getFullYear()).slice(2)}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const payL = { card: t('payCard'), inv: t('payInvoice'), cod: t('payCod') }[o.pay] || '';
  const dvTxt = [delivLabel(o.dv), o.city, o.branch, o.addr].filter(Boolean).join(', ');
  const byWh = {}; lines.forEach(l => (byWh[l.wh] = byWh[l.wh] || []).push(l));
  const rows = []; let n = 0;
  Object.entries(byWh).forEach(([w, ls]) => { rows.push(`— ${t('warehouse')} ${whName(+w)}:`); ls.forEach(l => rows.push(`${++n}. ${l.it.cc ? l.it.cc + ' · ' : ''}${nm(l.it)} — ${l.q} ${t('pcs')} × ${moneyTxt(priceOf(l.it))} = ${moneyTxt(priceOf(l.it) * l.q)}`)); });
  const text = [`${S.lang === 'ru' ? 'Заказ' : 'Замовлення'} ${no} · platanik`, `${t('firstName')}: ${o.first} ${o.last}, ${t('phone')}: ${o.phone}${o.email ? ', ' + o.email : ''}${o.company ? ', ' + o.company : ''}${S.user && S.user.edrpou ? ', ' + (S.user.type === 'fop' ? t('ipn') : t('edrpou')) + ' ' + S.user.edrpou : ''}`,
    `${t('delivWay')}: ${dvTxt}${o.dv === 'drop' ? ` · ${t('recipient')}: ${o.rname}, ${o.rphone}${o.cod ? ', НП ' + o.cod + ' грн' : ''}` : ''}`, `${t('payWay')}: ${payL}`, '', ...rows, '', `${t('total')}: ${moneyTxt(cartSum())} (${cartQty()} ${t('pcs')})`, ...(o.comment ? ['', `${t('comment')}: ${o.comment}`] : [])].join('\n');
  S.orders.unshift({ no, date: dt.toISOString(), sum: cartSum(), n: cartQty(), text, lines: S.cart.slice() });
  S.cart = []; store.set('draft', { first: o.first, last: o.last, phone: o.phone, email: o.email, company: o.company, dv: o.dv, city: o.city, branch: o.branch }); saveAll(); updateBadges();
  S.done = { no, text }; location.hash = 'order-done';
}
function viewDone() {
  if (!S.done) { location.hash = S.orders.length ? 'account-orders' : 'home'; return; }
  const { no, text } = S.done; setTitle(no);
  const share = `https://t.me/share/url?url=${encodeURIComponent('platanik.com')}&text=${encodeURIComponent(text)}`;
  $('#view').innerHTML = `<div class="wrap">${crumbs([['cart', t('cart')], ['', no]])}<div class="card done-box" style="margin-bottom:32px">
    <span class="okc">${ic('check')}</span><h1>${t('doneT', { n: no })}</h1><p class="muted">${t('doneS')}</p><pre>${esc(text)}</pre>
    <div class="row"><button class="btn" type="button" id="dcopy">${ic('copy', 's')} ${t('copyOrder')}</button><a class="btn dark" href="${share}" target="_blank" rel="noopener" id="dtg">${ic('telegram', 's')} ${t('sendTg')}</a><a class="btn line" href="https://t.me/${CONFIG.telegram}" target="_blank" rel="noopener">@${CONFIG.telegram}</a></div>
    <div class="kv"><div><small>${t('phone')}</small><span class="num">${esc(CONFIG.phone)} <button class="link" type="button" data-copy="${esc(CONFIG.phone)}">${ic('copy', 'xs')}</button></span></div><div><small>Viber</small><span class="num">${esc(CONFIG.viber)} <button class="link" type="button" data-copy="${esc(CONFIG.viber)}">${ic('copy', 'xs')}</button></span></div><div><small>E-mail</small><span>${esc(CONFIG.email)} <button class="link" type="button" data-copy="${esc(CONFIG.email)}">${ic('copy', 'xs')}</button></span></div></div>
    <div class="row"><a class="btn line" href="#catalog">${t('continue')}</a></div></div></div>`;
  $('#dcopy').addEventListener('click', () => copyText(text, t('copied')));
  $('#dtg').addEventListener('click', () => copyText(text, t('copied')));
}

/* ===== one click / notify ===== */
function oneClick(id, mode) {
  const it = S.byId.get(id); if (!it) return;
  const notify = mode === 'ask';
  const m = modal(`<div class="mh"><h2>${notify ? t('notifyMe') : t('oneClick')}</h2><button type="button" data-close aria-label="${t('close')}">${ic('x')}</button></div>
    <form class="mb" id="ocf" novalidate><div class="mline" style="grid-template-columns:64px minmax(0,1fr);border:0;padding:0"><span class="tph">${pimg(it)}</span><span class="mn">${esc(nm(it))}<small>${esc(it.cc || '')} · ${moneyTxt(priceOf(it))}</small></span></div>
      <p class="muted">${notify ? (S.lang === 'ru' ? 'Оставьте телефон — сообщим, когда товар появится на складе.' : 'Залиште телефон — повідомимо, коли товар з’явиться на складі.') : t('oneClickS')}</p>
      <div class="two"><div class="fld"><label for="oc-n">${t('firstName')}</label><input id="oc-n" autocomplete="name" value="${esc((S.user || {}).first || '')}"></div><div class="fld" data-phone><label for="oc-p">${t('phone')}<i>*</i></label><input id="oc-p" type="tel" autocomplete="tel" placeholder="+380" value="${esc((S.user || {}).phone || '')}"><span class="err" hidden>${t('badPhone')}</span></div></div>
      <button class="btn" type="submit">${t('send')}</button><div id="ocres"></div></form>`);
  $('#ocf', m).addEventListener('submit', e => {
    e.preventDefault(); const p = $('#oc-p').value.trim(), dg = p.replace(/\D/g, ''); const f = $('[data-phone]', m);
    if (dg.length < 10 || dg.length > 12) { f.classList.add('bad'); $('.err', f).hidden = false; $('#oc-p').focus(); return; }
    const text = `${notify ? t('notifyMe') : t('oneClick')}: ${it.cc ? it.cc + ' · ' : ''}${nm(it)} — ${moneyTxt(priceOf(it))}\n${$('#oc-n').value.trim()} ${p}`;
    $('#ocres').innerHTML = `<div class="demo-note" style="display:grid;gap:10px"><span>${S.lang === 'ru' ? 'Демо-версия: заявка не отправляется автоматически. Отправьте её менеджеру:' : 'Демо-версія: заявка не надсилається автоматично. Надішліть її менеджеру:'}</span><pre style="margin:0;white-space:pre-wrap">${esc(text)}</pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" type="button" id="occ">${t('copyOrder')}</button><a class="btn dark sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=platanik.com&text=${encodeURIComponent(text)}">Telegram</a></div></div>`;
    $('#occ').addEventListener('click', () => copyText(text));
  });
}
