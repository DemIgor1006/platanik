/* ===== Settings: contacts, rules (edit here) ===== */
const CONFIG = {
  company: 'ТОВ «ПЛА-ТАН І К»',
  edrpou: '35247533',
  phone: '(095) 294-88-84', phoneTel: '+380952948884',
  phone2: '(050) 078-44-48', phone2Tel: '+380500784448',
  viber: '+380952948884', telegram: 'managerplatanik',
  email: 'sale.platanik@ukr.net',
  kyiv: { ua: 'м. Київ, вул. Велика Кільцева, 4Б — магазин і склад', ru: 'г. Киев, ул. Большая Кольцевая, 4Б — магазин и склад' },
  kharkiv: { ua: 'м. Харків, вул. Клочківська, 347А — склад, відділ продажів', ru: 'г. Харьков, ул. Клочковская, 347А — склад, отдел продаж' },
  hours: { ua: ['Понеділок: 9:00 – 17:00', 'Вівторок–П’ятниця: 8:30 – 17:00', 'Субота: вихідний', 'Неділя: вихідний'], ru: ['Понедельник: 9:00 – 17:00', 'Вторник–Пятница: 8:30 – 17:00', 'Суббота: выходной', 'Воскресенье: выходной'] },
  hoursShort: { ua: 'ПН–ПТ з 9:00 до 17:00', ru: 'ПН–ПТ с 9:00 до 17:00' },
  returnDays: 14,
  optDiscount: 0,          // 0 = оптову ціну підтверджує менеджер; 0.1 = показувати «Опт ціна» −10% від роздрібної
  bestsellers: [],         // ID товарів для блоку «Лідери продажу»; порожньо = добір автоматично
};

const L_KEY = { ua: 0, ru: 1 };
const S = {
  lang: 'ua', ready: false, cats: [], catById: new Map(), catByKey: new Map(), items: [], byId: new Map(), brands: [], brandBySlug: new Map(), wh: [],
  chunks: {}, chunks2: {}, loading: {}, catImgs: null, brandImgs: null, banners: null, info: null,
  cart: [], fav: new Set(), user: null, users: {}, orders: [], tpls: [], reviews: {}, recent: [], view: 'grid', q: '', note: true,
  L: null, routeKey: '', done: null, makeAll: false, megaOpen: false,
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (k, v) => { const e = DICT[k]; let s = e ? e[L_KEY[S.lang]] : k; if (v) for (const [a, b] of Object.entries(v)) s = s.replaceAll('{' + a + '}', b); return s; };
const plural = n => { const f = FORMS[S.lang], a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
const fmtN = n => Number(n).toLocaleString('uk-UA');
const money = (p, big) => { const [i, d] = Number(p).toFixed(2).split('.'); return big ? `${fmtN(+i)}<small>.${d} ${t('uah')}</small>` : `${fmtN(+i)}.${d} ${t('uah')}`; };
const moneyTxt = p => `${Number(p).toFixed(2)} грн`;
const nm = it => (S.lang === 'ru' && it.r) ? it.r : it.n;
const cn = c => (S.lang === 'ru' && c.r) ? c.r : c.n;
const loc = o => o ? (o[S.lang] || o.ua) : '';
const store = {
  get(k, d) { try { const v = localStorage.getItem('pl-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pl-' + k, JSON.stringify(v)); } catch (e) {} },
};

/* ===== icons (24px, 2px stroke) ===== */
const IP = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.4-4.4"/>',
  user: '<path d="M20 21c0-1.4 0-2.1-.17-2.67a4 4 0 0 0-2.66-2.66C16.6 15.5 15.9 15.5 14.5 15.5h-5c-1.4 0-2.1 0-2.67.17a4 4 0 0 0-2.66 2.66C4 18.9 4 19.6 4 21"/><circle cx="12" cy="7.5" r="4.5"/>',
  heart: '<path d="M12 5.1C10 2.75 6.66 2.12 4.15 4.26 1.64 6.4 1.29 9.99 3.26 12.52c1.64 2.1 6.6 6.54 8.23 7.98.18.16.27.24.38.27.09.03.2.03.29 0 .1-.03.2-.11.38-.27 1.63-1.44 6.6-5.88 8.23-7.98 1.97-2.53 1.66-6.15-.9-8.27C17.28 2.14 14 2.75 12 5.1Z"/>',
  cart: '<path d="M2 2h1.3c.25 0 .37 0 .47.05.09.04.16.1.21.18.06.09.08.21.11.45L4.43 5m0 0 .97 7.14c.12.9.18 1.36.4 1.7.19.3.47.54.79.69.37.17.82.17 1.73.17h7.84c.86 0 1.29 0 1.64-.16.31-.14.58-.36.77-.65.21-.32.29-.74.45-1.59l1.2-6.32c.06-.3.09-.45.05-.57a.5.5 0 0 0-.22-.27C19.94 5 19.79 5 19.48 5H4.43ZM10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none"/>',
  list: '<path d="M3 5h18M3 10h18M3 15h18M3 20h18"/>',
  truck: '<path d="M14 7h2.34c.24 0 .37 0 .48.03.1.02.2.06.29.12.1.06.18.15.35.32l4.06 4.06c.17.17.26.26.32.35.06.09.1.19.12.29.03.11.03.24.03.48V15.5c0 .47 0 .7-.08.88a1 1 0 0 1-.54.54c-.18.08-.41.08-.88.08M14 17V7.2c0-1.12 0-1.68-.22-2.1a2 2 0 0 0-.87-.88C12.48 4 11.92 4 10.8 4H5.2c-1.12 0-1.68 0-2.1.22a2 2 0 0 0-.88.87C2 5.52 2 6.08 2 7.2V15a2 2 0 0 0 2 2m10 0h-4m4 0h1"/><circle cx="7" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  shield: '<path d="m9 11.5 2 2L15.5 9M20 12c0 4.91-5.36 8.48-7.3 9.62-.23.13-.34.2-.5.23a1.2 1.2 0 0 1-.4 0c-.16-.03-.27-.1-.5-.23C9.36 20.48 4 16.91 4 12V7.22c0-.8 0-1.2.13-1.54.12-.3.3-.57.55-.78.27-.24.65-.38 1.4-.66l5.36-2.01c.21-.08.31-.12.42-.13a.86.86 0 0 1 .28 0c.11.01.21.05.42.13l5.36 2c.75.29 1.13.43 1.4.67.25.2.43.48.55.78.13.34.13.74.13 1.54V12Z"/>',
  wallet: '<path d="M16 8V4.5c0-.83 0-1.25-.18-1.5a1 1 0 0 0-.7-.4c-.31-.03-.68.16-1.42.54L5.2 7.4M18 15.5h.01M2.5 8.2v10.3c0 1.12 0 1.68.22 2.1.19.38.5.69.87.88.43.22.99.22 2.11.22h11.6c1.12 0 1.68 0 2.1-.22.38-.19.69-.5.88-.87.22-.43.22-.99.22-2.11V11.2c0-1.12 0-1.68-.22-2.1a2 2 0 0 0-.87-.88C18.98 8 18.42 8 17.3 8H5.7c-1.12 0-1.68 0-2.1.22a2 2 0 0 0-.88.87"/>',
  phone: '<path d="M8.38 8.85c.7 1.45 1.65 2.81 2.85 4.01 1.2 1.2 2.56 2.15 4.01 2.85.12.06.19.09.28.11.3.09.68.03.94-.15.07-.05.14-.12.27-.25.4-.4.6-.6.8-.73.77-.5 1.75-.5 2.52 0 .2.13.4.33.8.73l.22.22c.6.6.91.91 1.08 1.24.33.65.33 1.43 0 2.08-.17.33-.47.64-1.08 1.25l-.18.18c-.6.6-.9.9-1.32 1.14-.46.26-1.17.44-1.7.44-.47 0-.8-.1-1.47-.28a22.04 22.04 0 0 1-9.6-5.65 22.04 22.04 0 0 1-5.65-9.6C1.98 5.78 1.88 5.46 1.88 4.98c0-.53.18-1.24.44-1.7.23-.42.53-.72 1.14-1.32l.18-.18c.6-.6.91-.91 1.25-1.08a2.25 2.25 0 0 1 2.07 0c.33.17.64.47 1.24 1.08l.22.22c.4.4.6.6.73.8.5.77.5 1.75 0 2.52-.13.2-.33.4-.73.8-.13.13-.2.2-.25.27-.18.26-.24.64-.15.94.02.09.06.16.11.28Z"/>',
  pin: '<path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M12 22c4-4 8-7.58 8-12a8 8 0 1 0-16 0c0 4.42 4 8 8 12Z"/>',
  chr: '<path d="m9 18 6-6-6-6"/>', chl: '<path d="m15 18-6-6 6-6"/>', chd: '<path d="m6 9 6 6 6-6"/>', chu: '<path d="m18 15-6-6-6 6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  trash: '<path d="M16 6v-.8c0-1.12 0-1.68-.22-2.1a2 2 0 0 0-.87-.88C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.1.22a2 2 0 0 0-.88.87C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.33 3.16a3 3 0 0 1-1.31 1.31c-.64.33-1.48.33-3.16.33h-4.4c-1.68 0-2.52 0-3.16-.33a3 3 0 0 1-1.31-1.31C5 19.72 5 18.88 5 17.2V6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  home: '<path d="M9 21v-7.4c0-.56 0-.84.11-1.05a1 1 0 0 1 .44-.44c.21-.11.49-.11 1.05-.11h2.8c.56 0 .84 0 1.05.11a1 1 0 0 1 .44.44c.11.21.11.49.11 1.05V21M11.02 2.76 4.24 8.04c-.45.35-.68.53-.84.75a2 2 0 0 0-.32.65C3 9.7 3 9.98 3 10.56v7.24c0 1.12 0 1.68.22 2.1.19.38.5.69.87.88.43.22.99.22 2.11.22h11.6c1.12 0 1.68 0 2.1-.22.38-.19.69-.5.88-.87.22-.43.22-.99.22-2.11v-7.24c0-.58 0-.87-.08-1.13a2 2 0 0 0-.32-.65c-.16-.22-.39-.4-.84-.75l-6.78-5.28c-.35-.27-.53-.41-.72-.46a1 1 0 0 0-.52 0c-.2.05-.37.19-.72.46Z"/>',
  filter: '<path d="M6 12h12M3 6h18M9 18h6"/>', refresh: '<path d="M2 10s2-2.7 3.64-4.36A9 9 0 1 1 3.36 14.5M2 10V4m0 6h6"/>',
  file: '<path d="M14 2.27V6.4c0 .56 0 .84.11 1.05a1 1 0 0 0 .44.44c.21.11.49.11 1.05.11h4.13M16 13H8m8 4H8m2-8H8m6-7H8.8c-1.68 0-2.52 0-3.16.33a3 3 0 0 0-1.31 1.31C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.33 3.16a3 3 0 0 0 1.31 1.31c.64.33 1.48.33 3.16.33h6.4c1.68 0 2.52 0 3.16-.33a3 3 0 0 0 1.31-1.31c.33-.64.33-1.48.33-3.16V8l-6-6Z"/>',
  logout: '<path d="M16 17l5-5-5-5M21 12H9M9 3H7.8c-1.68 0-2.52 0-3.16.33a3 3 0 0 0-1.31 1.31C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.33 3.16a3 3 0 0 0 1.31 1.31c.64.33 1.48.33 3.16.33H9"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  burger: '<path d="M3 6h18M3 12h18M3 18h18"/>', building: '<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16m0-12h2a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2"/>',
  telegram: '<path d="m21.5 3.5-19 7.3 6.4 2.1 2.5 7.6 3.7-4.9 4.8 3.5L21.5 3.5Z" /><path d="m8.9 12.9 12.6-9.4"/>',
  viber: '<path d="M12 2.2c-4.7 0-8.4 1.4-8.4 7.6 0 3.5 1.1 5.6 3.1 6.7v3.9c0 .5.6.7.9.4l2.6-2.8c.6.1 1.2.1 1.8.1 4.7 0 8.4-1.4 8.4-8.3 0-6.2-3.7-7.6-8.4-7.6Z"/><path d="M9.1 7.3c-.3-.4-.9-.4-1.2-.1l-.4.4c-.5.5-.5 1.3-.1 2 .9 1.6 2.3 3.1 4 4 .7.4 1.5.4 2-.1l.4-.4c.3-.3.3-.9-.1-1.2l-.9-.7c-.3-.2-.7-.2-1 0l-.4.3c-.8-.4-1.5-1.1-1.9-1.9l.3-.4c.2-.3.2-.7 0-1l-.7-.9ZM13 6.5c1.6.2 2.9 1.5 3.1 3.1M13 8.6c.5.1.9.5 1 1"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
  /* category icons */
  cAk: '<path d="M8.5 8.5h.01M15.5 15.5h.01M16 8l-8 8"/><path d="M12 2.5 14.2 4.2 17 4l.9 2.6L20.5 8l-.5 2.8 1.5 2.4-2 1.9-.2 2.8-2.8.4-1.6 2.3-2.7-.9-2.7.9-1.6-2.3-2.8-.4-.2-2.8-2-1.9 1.5-2.4L3.5 8 6.1 6.6 7 4l2.8.2L12 2.5Z"/>',
  cAcc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 11.2 3.4 9.5M14.4 11.2l6.2-1.7"/>',
  cKit: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6ZM2 10h2m16 0h2M9 6c0-1 .8-1.5.8-2.5M12.5 6c0-1 .8-1.5.8-2.5"/>',
  cChem: '<path d="M9 7h5l2 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l2-3ZM10 7V4h3v3M13 4h4l1 1.5M17 3l2 1M7 13h9"/>',
  cLight: '<path d="M10 5C6 5 3 8 3 12s3 7 7 7h2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2ZM17 8l4-1.5M17 12h4.5M17 16l4 1.5"/>',
  cMud: '<path d="M6 3h12v13l-2.5 2-2-2-1.5 2-1.5-2-2 2L6 16V3Z"/><path d="M9 7h6M9 10.5h6"/>',
  cBody: '<rect x="3" y="4" width="14" height="10" rx="3"/><path d="M17 9h2.5a1.5 1.5 0 0 1 1.5 1.5V20M10 14v6M6 20h8"/>',
  cVan: '<path d="M2 15V8a2 2 0 0 1 2-2h10l5 4.5h1a2 2 0 0 1 2 2V15a1 1 0 0 1-1 1h-1M2 15a1 1 0 0 0 1 1h2m10-10v4.5h4.5M9 16h6"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
  cMark: '<path d="M3 5h18v14H3z"/><path d="m3 15 6-10M9 19l9-14M15 19l6-10"/>',
  cPneu: '<path d="M4 9h5v6H4zM9 10.5h3a2 2 0 0 0 2-2V6h3M9 13.5h3a2 2 0 0 1 2 2V18h3M17 4v4M17 16v4"/>',
  cParts: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
  cTool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  cTrailer: '<path d="M2 6h15v9H2zM17 13h3l2 2M6 15v2M13 15v2"/><circle cx="6" cy="18" r="1.6"/><circle cx="13" cy="18" r="1.6"/>',
  cHeat: '<path d="M12 22a6 6 0 0 0 6-6c0-3.5-3-6-3-9-2 1-3 3-3 4-1-1-1.5-2.5-1.5-4C7.5 9 6 12.4 6 16a6 6 0 0 0 6 6Z"/>',
  cStrap: '<path d="M3 8h18v8H3zM8 8v8M3 12h5M16 6v12M16 9h3M16 15h3"/>',
};
const ic = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n] || ''}</svg>`;
const CAT_ICON = { akciya: 'cAk', 'aksessuary-dlia-cabini': 'cAcc', 'dorozhnaya-kukhnya': 'cKit', 'avtohimiya-ta-doglyad': 'cChem', svetotekhnika: 'cLight', bryzgoviki: 'cMud', 'kuzov-kabina': 'cBody', 'malyy-kommercheskiy-transport': 'cVan', 'markirovochnye-znaki-svetootrazhateli': 'cMark', 'pnevmo-tormoznye-soedineniya': 'cPneu', zapchasti: 'cParts', instrumenty: 'cTool', 'furnitura-furgonov-i-pricepov': 'cTrailer', 'sistema-otopleniya': 'cHeat', takelazh: 'cStrap' };

/* ===== search ===== */
const LAT = { 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'І': 'I', 'У': 'Y' };
const normCode = s => String(s || '').toUpperCase().replace(/[АВЕКМНОРСТХІУ]/g, c => LAT[c]).replace(/[\s.\-\/_,]/g, '');
const ALIAS = {
  'мерседес': 'mercedes', 'мерс': 'mercedes', 'вольво': 'volvo', 'сканія': 'scania', 'скания': 'scania', 'даф': 'daf', 'ман': 'man', 'рено': 'renault', 'івеко': 'iveco', 'ивеко': 'iveco', 'форд': 'ford',
  'фонарь': 'ліхтар', 'фонари': 'ліхтар', 'фонар': 'ліхтар', 'ліхтарі': 'ліхтар', 'стекло': 'скло', 'стекла': 'скло', 'фара': 'фар', 'фары': 'фар', 'фари': 'фар', 'габарит': 'габарит', 'габариты': 'габарит', 'габарити': 'габарит',
  'левый': 'лів', 'левая': 'лів', 'правый': 'прав', 'правая': 'прав', 'противотуманная': 'протитуман', 'противотуманка': 'протитуман', 'туманка': 'протитуман', 'разъем': "роз'єм", 'разъём': "роз'єм",
  'мигалка': 'маяч', 'маяк': 'маяч', 'маячок': 'маяч', 'задний': 'задн', 'задние': 'задн', 'передний': 'передн', 'поворотник': 'поворот', 'брызговик': 'бризговик', 'брызговики': 'бризговик', 'зеркало': 'дзеркал', 'зеркала': 'дзеркал',
  'ремень': 'ремін', 'ремни': 'ремен', 'коврик': 'килим', 'коврики': 'килим', 'ковры': 'килим', 'шторы': 'штор', 'чехол': 'чохол', 'чехлы': 'чохл', 'кран': 'кран', 'клапан': 'клапан', 'шланг': 'шланг', 'головка': 'голівк', 'соединительная': "з'єднувальн", 'пневмо': 'пневм', 'лента': 'стрічк', 'светоотражающая': 'світловідбиваюч', 'катафот': 'катафот', 'отражатель': 'відбивач', 'лампа': 'ламп', 'лампочка': 'лампочк', 'крыло': 'крил', 'ступенька': 'ступен', 'подножка': 'ступен', 'ручка': 'ручк', 'плита': 'плит', 'чайник': 'чайник', 'холодильник': 'холодильник',
};
const stem = w => { w = w.toLowerCase().replace(/[’`ʼ]/g, "'"); if (ALIAS[w]) return ALIAS[w]; if (/^лів/.test(w)) return 'лів'; if (/^прав/.test(w)) return 'прав'; if (/^[а-яіїєґ']+$/.test(w) && w.length >= 5) w = w.replace(/[аиіеяюьйоуїє]+$/, ''); return w; };
const parseQ = raw => { raw = String(raw || '').trim(); return { raw, code: normCode(raw), toks: raw.split(/\s+/).filter(Boolean).map(x => ({ code: normCode(x), w: stem(x) })) }; };
function score(it, q) {
  if (!q.raw) return 1;
  let s = 0;
  if (q.code.length >= 3 && /\d/.test(q.code)) {
    if (it._cc === q.code) s += 1000; else if (it._cc && it._cc.startsWith(q.code)) s += 400; else if (it._cc && it._cc.includes(q.code)) s += 200;
    if (it._nc.includes(q.code)) s += 150;
    if (s) return s;
  }
  for (const k of q.toks) {
    const hc = k.code.length >= 3 && /\d/.test(k.code) && (it._cc.includes(k.code) || it._nc.includes(k.code));
    const ht = k.w && it._t.includes(k.w);
    if (!hc && !ht) return 0;
    s += hc ? 30 : 10;
  }
  return s;
}
function indexItem(it) {
  const cats = (it.c || []).map(id => S.catById.get(id)).filter(Boolean);
  it._cc = normCode(it.cc || '');
  it._nc = normCode(it.n);
  it._t = [it.n, it.r || '', it.b || '', it.cc || '', cats.map(c => c.n + ' ' + (c.r || '')).join(' ')].join(' ').toLowerCase().replace(/[’`ʼ]/g, "'");
  it._st = (it.s || []).map(v => { const m = String(v).match(/(\d+)/); const n = m ? +m[1] : 0; return { txt: String(v).replace(/\s+/g, ''), n, plus: /[>+]/.test(v) }; });
  it._av = it._st.some(x => x.n > 0);
  it._tot = it._st.reduce((a, x) => a + x.n, 0);
}

/* ===== images (chunked JSON with WebP base64, loaded on demand) ===== */
function need(i, two) {
  const key = (two ? 'j' : 'i') + i, box = two ? S.chunks2 : S.chunks;
  if (box[i] || S.loading[key]) return S.loading[key];
  const url = two ? `data/img2/j${String(i).padStart(2, '0')}.json` : `data/img/i${String(i).padStart(2, '0')}.json`;
  S.loading[key] = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
    box[i] = d;
    $$(`img[data-${two ? 'j' : 'i'}="${i}"]`).forEach(im => { const b = d[im.dataset.id]; if (b && !im.getAttribute('src')) im.src = 'data:image/webp;base64,' + b; });
  }).catch(() => { delete S.loading[key]; });
  return S.loading[key];
}
function pimg(it, two) {
  const idx = two ? it.j : it.i;
  if (idx == null) return two ? '' : `<div class="noph"><b>PLATANIK</b>${S.lang === 'ru' ? 'фото готовится' : 'фото готується'}</div>`;
  const box = two ? S.chunks2 : S.chunks;
  const b = box[idx] && box[idx][it.id];
  if (!box[idx]) need(idx, two);
  return `<img ${b ? `src="data:image/webp;base64,${b}"` : ''} data-${two ? 'j' : 'i'}="${idx}" data-id="${it.id}" alt="${esc(nm(it))}" decoding="async">`;
}
async function loadAux(name) {
  if (S[name]) return S[name];
  if (S['_p' + name]) return S['_p' + name];
  S['_p' + name] = fetch(`data/${name === 'brandImgs' ? 'brands' : name}.json`).then(r => { if (!r.ok) throw 0; return r.json(); }).then(d => (S[name] = d)).catch(() => (S[name] = name === 'banners' ? [] : {}));
  return S['_p' + name];
  return S[name];
}
const catImg = c => { const it = firstWithPhoto(c); return it ? pimg(it) : ''; };
function firstWithPhoto(c) { for (const id of catItems(c)) { const it = S.byId.get(id); if (it && it.i != null) return it; } return null; }

/* ===== catalogue helpers ===== */
function catItems(c) {
  if (c._all) return c._all;
  const set = new Set(c._own || []);
  for (const ch of c.ch || []) { const cc = S.catById.get(ch); if (cc) catItems(cc).forEach(x => set.add(x)); }
  return (c._all = [...set]);
}
const topCats = () => S.cats.filter(c => c.p == null && catItems(c).length);
function catPath(c) { const out = []; let x = c; while (x) { out.unshift(x); x = x.p != null ? S.catById.get(x.p) : null; } return out; }
const optOn = () => S.user && S.user.type !== 'fiz' && CONFIG.optDiscount > 0;
const priceOf = it => optOn() ? Math.round(it.p * (1 - CONFIG.optDiscount) * 100) / 100 : it.p;
const isWholesale = () => S.user && S.user.type !== 'fiz';
function priceHtml(it, big) {
  const p = priceOf(it);
  let h = big ? `<div class="bigprice">${money(p, true)}` : `<div class="price"><b>${money(p, true)}`;
  if (optOn()) h += big ? `<s>${moneyTxt(it.p)}</s>` : `</b><s>${moneyTxt(it.p)}</s><span><span class="tag y">${S.lang === 'ru' ? 'Опт цена' : 'Опт ціна'}</span></span>`;
  else if (isWholesale()) h += big ? ` <span class="rrc">РРЦ</span>` : `<span class="rrc">РРЦ</span></b>`;
  else h += big ? '' : '</b>';
  return h + '</div>';
}
function tagOf(it) {
  if (it.ak) return `<span class="tag">${S.lang === 'ru' ? 'Акция' : 'Акція'}</span>`;
  if (it._new) return `<span class="tag y">${S.lang === 'ru' ? 'Новинка' : 'Новинка'}</span>`;
  return '';
}
function whOptions(it, sel) {
  return S.wh.map((w, i) => { const st = it._st[i] || { txt: '0', n: 0 }; return `<option value="${i}"${i === sel ? ' selected' : ''}${st.n ? '' : ' disabled'}>${esc(whName(i))} (${esc(st.txt)})</option>`; }).join('');
}
const whName = i => { const w = S.wh[i]; if (S.lang !== 'ru') return w; return { 'Київ': 'Киев', 'Харків': 'Харьков' }[w] || w; };
function bestWh(it) { let b = -1, bn = -1; it._st.forEach((s, i) => { if (s.n > bn) { bn = s.n; b = i; } }); return bn > 0 ? b : 0; }

/* ===== cart / fav / user ===== */
function saveAll() { store.set('cart', S.cart); store.set('fav', [...S.fav]); store.set('user', S.user); store.set('users', S.users); store.set('orders', S.orders); store.set('tpls', S.tpls); store.set('reviews', S.reviews); store.set('recent', S.recent); store.set('view', S.view); store.set('lang', S.lang); }
function loadAll() {
  S.lang = store.get('lang', 'ua') === 'ru' ? 'ru' : 'ua';
  S.cart = (store.get('cart', []) || []).filter(l => l && l.id && l.q > 0);
  S.fav = new Set(store.get('fav', []) || []);
  S.user = store.get('user', null); S.users = store.get('users', {}) || {};
  S.orders = store.get('orders', []) || []; S.tpls = store.get('tpls', []) || []; S.reviews = store.get('reviews', {}) || {}; S.recent = store.get('recent', []) || [];
  S.view = store.get('view', 'grid') === 'table' ? 'table' : 'grid';
  try { S.q = sessionStorage.getItem('pl-q') || ''; } catch (e) {}
}
const cartLines = () => S.cart.map(l => ({ ...l, it: S.byId.get(l.id) })).filter(l => l.it);
const cartQty = () => cartLines().reduce((a, l) => a + l.q, 0);
const cartSum = () => cartLines().reduce((a, l) => a + priceOf(l.it) * l.q, 0);
function addToCart(id, q = 1, wh) {
  const it = S.byId.get(id); if (!it) return;
  q = Math.max(it.mo || 1, Math.min(9999, parseInt(q, 10) || 1));
  if (wh == null) wh = bestWh(it);
  const ex = S.cart.find(l => l.id === id && l.wh === wh);
  if (ex) ex.q += q; else S.cart.push({ id, wh, q });
  saveAll(); updateBadges(); refreshBuyButtons(id);
  toast(t('added'), `<a href="#cart" data-open-cart>${t('open')}</a>`);
}
function toggleFav(id) {
  if (S.fav.has(id)) { S.fav.delete(id); toast(t('favRemoved')); } else { S.fav.add(id); toast(t('favAdded'), `<a href="#favorites">${t('open')}</a>`); }
  saveAll(); updateBadges();
  $$(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle('on', S.fav.has(id)); b.setAttribute('aria-pressed', S.fav.has(id)); });
}
function updateBadges() {
  const cq = cartQty();
  $$('[data-badge="cart"]').forEach(b => { b.textContent = cq || ''; b.dataset.n = cq; });
  $$('[data-badge="fav"]').forEach(b => { b.textContent = S.fav.size || ''; b.dataset.n = S.fav.size; });
  $$('[data-cart-label]').forEach(e => { e.textContent = cq ? moneyTxt(cartSum()) : t('cart'); });
}
function refreshBuyButtons(id) {
  const inC = S.cart.some(l => l.id === id);
  $$(`[data-add="${id}"]`).forEach(b => { if (b.classList.contains('ibtn')) b.classList.toggle('in', inC); else if (b.dataset.big) b.innerHTML = `${ic('cart')} ${inC ? t('inCart') : t('toCart')}`; });
}

/* ===== small UI ===== */
function toast(msg, extra = '') {
  const el = $('#toast'); el.innerHTML = `<span>${esc(msg)}</span>${extra}`; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2800);
}
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg || t('copied')); return true; }
  catch (e) { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); toast(ok ? (msg || t('copied')) : (S.lang === 'ru' ? 'Не удалось скопировать — выделите текст вручную' : 'Не вдалося скопіювати — виділіть текст вручну')); return ok; }
}
function modal(html, cls = '') {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="${cls}" role="dialog" aria-modal="true">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(); });
  document.body.appendChild(m); document.body.style.overflow = 'hidden';
  const f = m.querySelector('input, select, button:not([data-close])'); if (f) setTimeout(() => f.focus(), 30);
  return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); document.body.style.overflow = ''; }
const qtyBox = (id, val, cls = '', min = 1) => `<span class="qty ${cls}" data-qbox><button type="button" data-qd="-1" aria-label="−">−</button><input id="${id}" type="number" inputmode="numeric" min="${min}" value="${val}" aria-label="${t('qty')}"><button type="button" data-qd="1" aria-label="+">+</button></span>`;
const crumbs = list => `<nav class="crumbs" aria-label="breadcrumbs"><a href="#home" aria-label="${t('home')}">${ic('home', 'xs')}</a>${list.map(([h, l]) => `<span class="sep">${ic('chr', 'xs')}</span>${h ? `<a href="#${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`}`).join('')}</nav>`;
function setTitle(s) { document.title = s ? `${s} · PLATANIK` : 'PLATANIK — запчастини та аксесуари для вантажівок'; }
