"""Build the PLATANIK site data from a platanik.com snapshot.

Usage: python3 -I build_site_data.py <platanik-catalog.json> <banners dir> <site dir>

Input  platanik-catalog.json  - snapshot collected in the browser from platanik.com (categories, products with
                                prices and Kyiv/Kharkiv stock, UA+RU names, WebP thumbnails, brand logos, info pages)
       banners dir            - optional company banners: <brand>_desktop_*.png and <brand>_mobile_*.png
Output <site>/data/catalog.json     categories + products (no images)
       <site>/data/img/iNN.json     main photo per product, WebP base64, 100 per file
       <site>/data/img2/jNN.json    second photo per product
       <site>/data/brands.json      brand logos by slug
       <site>/data/banners.json     hero banners (desktop + mobile)
       <site>/data/info.json        cleaned info pages (about, delivery, warranty, offer)
       <site>/img/logo.svg          not written; the logo is inlined in index.html
"""
import json, sys, os, re, io, base64, glob, html, collections
from bs4 import BeautifulSoup, Comment
from PIL import Image

src, bdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(src, encoding='utf-8-sig'))
os.makedirs(f'{out}/data/img', exist_ok=True); os.makedirs(f'{out}/data/img2', exist_ok=True)
for f in glob.glob(f'{out}/data/img/*.json') + glob.glob(f'{out}/data/img2/*.json'): os.remove(f)

TOP_ORDER = ['akciya', 'aksessuary-dlia-cabini', 'dorozhnaya-kukhnya', 'avtohimiya-ta-doglyad', 'svetotekhnika', 'bryzgoviki',
             'kuzov-kabina', 'malyy-kommercheskiy-transport', 'markirovochnye-znaki-svetootrazhateli', 'pnevmo-tormoznye-soedineniya',
             'zapchasti', 'instrumenty', 'furnitura-furgonov-i-pricepov', 'sistema-otopleniya', 'takelazh']
WH = ['Київ', 'Харків']
clean = lambda s: re.sub(r'\s+', ' ', s or '').strip()

# ---------- categories ----------
C = D['cats']
def parent_key(k):
    bc = [b[1] for b in (C[k].get('bc') or []) if b[1]]
    if len(bc) >= 2 and bc[-1] == k: return bc[-2]
    if k.startswith('route:'):
        p = k[6:].rsplit('_', 1)[0]
        return 'route:' + p if '_' in k[6:] and ('route:' + p) in C else None
    return k.rsplit('/', 1)[0] if '/' in k else None
keys = list(C)
par = {k: parent_key(k) for k in keys}
# make sure every parent exists
for k in list(par):
    p = par[k]
    while p and p not in C:
        C[p] = {'name': '', 'order': 9999}; par[p] = parent_key(p) if '/' in p else None; keys.append(p); p = par[p]
for k in keys:
    c = C[k]
    if not c.get('name'):
        c['name'] = clean(c.get('h1')) or k.split('/')[-1]
ru_names = D.get('catsRu') or {}
ru_h1 = D.get('ruCatH1') or {}
def top_of(k):
    while par.get(k): k = par[k]
    return k
tops = [k for k in keys if not par.get(k)]
tops.sort(key=lambda k: (TOP_ORDER.index(k) if k in TOP_ORDER else 99, C[k].get('order', 9999)))
children = collections.defaultdict(list)
for k in keys:
    if par.get(k): children[par[k]].append(k)
for k in children: children[k].sort(key=lambda x: (C[x].get('order', 9999), C[x]['name']))
ordered = []
def walk(k):
    ordered.append(k)
    for ch in children.get(k, []): walk(ch)
for k in tops: walk(k)
cid = {k: i + 1 for i, k in enumerate(ordered)}

# ---------- brands ----------
norm = lambda s: re.sub(r'[^a-z0-9а-яіїєґ]', '', (s or '').lower())
logo_by_norm = {}
for b in (D.get('brandsHome') or []) + (D.get('brands') or []):
    if b['slug'] in ('index.php',) or b['slug'] not in D['brandImgs']: continue
    for nn in (norm(b['slug']), norm(b.get('name'))):
        if nn: logo_by_norm.setdefault(nn, b['slug'])
ALIAS = {'lago': 'lagoaccessori', 'gurbuzplastik': 'gurbuz_plastik', 'cfberg': 'c-f-berg', 'horsayhard': 'horday-hard', 'mcplastik': 'mc'}
def logo_slug(name):
    n = norm(name)
    if not n: return None
    if n in logo_by_norm: return logo_by_norm[n]
    if n in ALIAS and ALIAS[n] in D['brandImgs']: return ALIAS[n]
    for k, v in logo_by_norm.items():
        if len(n) >= 4 and (k.startswith(n) or n.startswith(k)): return v
    return None
def url_slug(name): return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'brand'

# ---------- products ----------
P = D['prods']; RU = D.get('ru') or {}
def price(p):
    m = re.search(r'([\d\s]+[.,]\d+|\d+)', (p.get('reg') or '').replace('\xa0', ' '))
    v = float(m.group(1).replace(' ', '').replace(',', '.')) if m else float(p.get('price') or 0)
    return round(v, 2)
def stock(p):
    st = p.get('st') or {}
    return [clean(st.get(w, '0')).replace(' ', '') or '0' for w in WH]
def leaf_cats(cs):
    cs = [c for c in cs if c in cid]
    res = []
    for c in cs:
        if c == 'akciya': continue
        # drop c if another listed category is below it
        if any(o != c and o != 'akciya' and is_desc(o, c) for o in cs): continue
        res.append(c)
    return res
def is_desc(a, b):
    while par.get(a):
        a = par[a]
        if a == b: return True
    return False
items = []
brand_names = collections.Counter()
for pid, p in P.items():
    f = p.get('f') or {}
    b = clean(f.get('Виробник'))
    if b.upper() in ('N/A', 'NA', '-'): b = ''
    co = clean(f.get('Країна виробництва'))
    if co.upper() in ('N/A', 'NA', '-'): co = ''
    co = co.replace('УкраЇна', 'Україна')
    mo = re.search(r'\d+', f.get('Мінімальне замовлення') or '')
    cats = leaf_cats(p.get('cats') or [])
    ak = 'akciya' in (p.get('cats') or [])
    if not cats and ak: cats = ['akciya']
    it = {'id': int(pid), 'n': clean(p['n'])}
    r = clean(RU.get(pid))
    if r and r != it['n']: it['r'] = r
    if b: it['b'] = b; brand_names[b] += 1
    cc = clean(f.get('Крос-код товару'))
    if cc and cc.upper() != 'N/A': it['cc'] = cc
    if co: it['co'] = co
    if mo and int(mo.group(0)) > 1: it['mo'] = int(mo.group(0))
    it['p'] = price(p); it['s'] = stock(p)
    it['c'] = [cid[c] for c in cats]
    if ak and cid['akciya'] not in it['c']: it['c'].append(cid['akciya'])
    if ak: it['ak'] = 1
    it['_ord'] = min((ordered.index(c) for c in cats), default=9999)
    items.append(it)
def instock(it): return any(re.search(r'[1-9]', s) for s in it['s'])
items.sort(key=lambda it: (it['_ord'], not instock(it), it['n']))

brands = []
for name, cnt in brand_names.most_common():
    ls = logo_slug(name)
    brands.append({'n': name, 'h': url_slug(name), 's': ls or url_slug(name), 'cnt': cnt, 'lg': 1 if ls else 0})
# unique url slugs
seen = set()
for b in brands:
    h = b['h']; i = 2
    while h in seen: h = f"{b['h']}-{i}"; i += 1
    b['h'] = h; seen.add(h)
bslug = {b['n']: b['s'] for b in brands}
for it in items:
    if it.get('b'): it['bs'] = bslug[it['b']]

# ---------- images ----------
IM, IM2 = D.get('imgs') or {}, D.get('imgs2') or {}
def chunked(store, key, folder, prefix, n=100):
    buf, idx = {}, 0
    for it in items:
        b = store.get(str(it['id']))
        if not b: continue
        if len(buf) >= n:
            json.dump(buf, open(f'{out}/data/{folder}/{prefix}{idx:02d}.json', 'w'), separators=(',', ':')); idx += 1; buf = {}
        buf[str(it['id'])] = b; it[key] = idx
    if buf: json.dump(buf, open(f'{out}/data/{folder}/{prefix}{idx:02d}.json', 'w'), separators=(',', ':')); idx += 1
    return idx
n1 = chunked(IM, 'i', 'img', 'i'); n2 = chunked(IM2, 'j', 'img2', 'j')
for it in items: it.pop('_ord', None)

# ---------- categories out ----------
cats_out = []
for k in ordered:
    c = C[k]
    o = {'id': cid[k], 'k': k if not k.startswith('route:') else 'heater-' + k[6:].replace('_', '-'), 'n': clean(c['name'])}
    r = clean(ru_names.get(k) or ru_h1.get(k))
    if r and r != o['n']: o['r'] = r
    if par.get(k): o['p'] = cid[par[k]]
    ch = [cid[x] for x in children.get(k, [])]
    if ch: o['ch'] = ch
    cats_out.append(o)
# keep the top-level 'sistema-otopleniya' key stable for icons
json.dump({'built': D.get('built'), 'wh': WH, 'cats': cats_out, 'items': items, 'brands': brands},
          open(f'{out}/data/catalog.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---------- brand logos ----------
logos = {}
for b in brands:
    if b['lg'] and b['s'] in D['brandImgs']: logos[b['s']] = D['brandImgs'][b['s']]
json.dump(logos, open(f'{out}/data/brands.json', 'w'), separators=(',', ':'))

# ---------- banners ----------
def webp(path, maxw, q=80):
    im = Image.open(path).convert('RGB')
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6); return base64.b64encode(buf.getvalue()).decode()
banners = []
for brand, title, bname in (('was', 'WAS', 'WAS'), ('hor', 'HORPOL', 'HORPOL')):
    dsk = sorted(glob.glob(f'{bdir}/{brand}_desktop_*.png')); mob = sorted(glob.glob(f'{bdir}/{brand}_mobile_*.png'))
    if not dsk: continue
    b = next((x for x in brands if x['n'].upper() == bname), None)
    banners.append({'alt': f'{title} — нові надходження', 'd': webp(dsk[0], 1230), 'm': webp(mob[0], 720) if mob else '', 'brand': bname, 'h': b['h'] if b else ''})
json.dump(banners, open(f'{out}/data/banners.json', 'w'), separators=(',', ':'))

# ---------- info pages ----------
def clean_html(h):
    s = BeautifulSoup(h or '', 'html.parser')
    for c in s.find_all(string=lambda x: isinstance(x, Comment)): c.extract()
    for t in s(['script', 'style', 'iframe', 'form', 'input', 'button', 'select', 'textarea', 'img', 'svg', 'video', 'link', 'meta', 'noscript', 'h1', 'xml']): t.decompose()
    for t in s.select('.breadcrumb'): t.decompose()
    for t in s.find_all(True):
        t.attrs = {k: v for k, v in t.attrs.items() if k in ('href', 'colspan', 'rowspan')}
        if t.name in ('span', 'font', 'o:p'): t.unwrap()
    txt = str(s)
    txt = re.sub(r'<(p|div)>\s*(&nbsp;|\xa0)?\s*</\1>', '', txt)
    txt = re.sub(r'\s+', ' ', txt)
    return txt.strip()
info = {}
for k, v in (D.get('info') or {}).items():
    if k == 'contact': continue
    info[k] = {'h1': v.get('h1') or '', 'html': clean_html(v.get('html'))}
info['reklamatsiya'] = {'h1': 'Рекламація', 'html': (
    '<p>Рекламація — це письмова заява щодо якості товару, придбаного в ТОВ «ПЛА-ТАН І К», разом із документами, що підтверджують купівлю. Повні умови — у розділі «Гарантія».</p>'
    '<h2>Як подати рекламацію</h2><ol>'
    '<li>Зв’яжіться з менеджером телефоном, у Viber чи Telegram і назвіть номер замовлення або видаткової накладної.</li>'
    '<li>Надішліть фото чи відео дефекту, фото маркування на корпусі й упаковці.</li>'
    '<li>Якщо товар встановлювали на СТО, додайте акт монтажу — для таких товарів діє подовжений гарантійний строк.</li>'
    '<li>Передайте товар на склад у Києві або Харкові чи відправте Новою поштою за погодженням з менеджером.</li></ol>'
    '<h2>Строки</h2><p>Повернення товару належної якості можливе протягом 14 днів з моменту покупки, якщо збережено товарний вигляд і упаковку. '
    'Якщо менеджер помилився з підбором або товар бракований, ми безкоштовно обміняємо його й оплатимо доставку; якщо заміни немає в наявності — повернемо гроші.</p>')}
json.dump({'ua': info}, open(f'{out}/data/info.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---------- report ----------
av = sum(1 for it in items if instock(it))
print('cats', len(cats_out), 'tops', len(tops), [C[k]['name'] for k in tops])
print('items', len(items), 'in stock', av, 'with photo', sum(1 for it in items if 'i' in it), 'photo2', sum(1 for it in items if 'j' in it), 'chunks', n1, n2)
print('brands', len(brands), 'with logo', sum(b['lg'] for b in brands), 'no logo top', [b['n'] for b in brands if not b['lg']][:15])
print('ru names', sum(1 for it in items if 'r' in it), 'ru cats', sum(1 for c in cats_out if 'r' in c))
print('banners', [(b['alt'], len(b['d']), len(b['m'])) for b in banners])
print('info', {k: len(v['html']) for k, v in info.items()})
print('catalog.json', os.path.getsize(f'{out}/data/catalog.json'))
