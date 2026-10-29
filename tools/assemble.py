"""Assemble site/index.html from src/*.  Usage: python3 -I tools/assemble.py <project dir> <logo svg source json>"""
import sys, json, re
root, snap = sys.argv[1], sys.argv[2]
src = f'{root}/src'
css = open(f'{src}/style.css', encoding='utf8').read()
js = '\n'.join(open(f'{src}/{f}', encoding='utf8').read() for f in ('i18n.js', 'app.js', 'content.js', 'views1.js', 'views2.js', 'views3.js'))
logo = json.load(open(snap, encoding='utf-8-sig'))['logoSvg']
m = re.search(r'viewBox="([^"]+)"', logo); vb = m.group(1)
inner = re.sub(r'^<svg[^>]*>', '', logo.strip()); inner = re.sub(r'</svg>\s*$', '', inner)
inner = inner.replace('mask0_212_230', 'pl-logo-mask')
sym = f'<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="logo-sym" viewBox="{vb}">{inner}</symbol></svg>'
page = f'''<title>PLATANIK</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="PLATANIK — запчастини, аксесуари, світлотехніка та пневматика для вантажівок і причепів від ТОВ «ПЛА-ТАН І К». Склади в Києві та Харкові.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>
{css}
</style>
{sym}
<header id="hdr"></header>
<main id="view" tabindex="-1"></main>
<div id="ftr"></div>
<button class="totop" id="totop" type="button" aria-label="Вгору"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg></button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>
const LOGO_VB = '{vb}';
{js}
</script>
'''
open(f'{root}/site/index.html', 'w', encoding='utf8').write(page)
print('index.html', len(page))
