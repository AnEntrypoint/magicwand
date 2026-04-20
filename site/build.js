import { find, findGlobal, setContentDir } from '../node_modules/flatspace/src/store/index.js';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const DOCS = path.join(ROOT, 'docs');
setContentDir(path.join(ROOT, 'content'));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

const renderNav = nav => (nav||[]).map(n => `<a class="t-label" href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
const renderCta = cta => (cta||[]).map(b => {
  const cls = b.kind === 'green' ? 'btn-stamp green' : b.kind === 'ghost' ? 'btn-ghost' : 'btn-stamp';
  return `<a class="${cls}" href="${esc(b.href)}">${esc(b.label)}</a>`;
}).join(' ');

const renderSection = (s, i) => `
<section class="page-section" id="${esc(s.id)}">
  <hr class="rule-${['green','purple','mascot','sun','flame','sky'][i%6]}">
  <div class="dateline">
    <span class="mono-${['green','purple','mascot','sun'][i%4]}">${esc(s.label)}</span>
    <span class="spread"></span>
    <span>${esc(s.id)}</span>
  </div>
  <h2>${esc(s.title)}</h2>
  <div class="prose"><p>${md(s.body)}</p></div>
  ${s.code ? `<pre class="code-block"><code>${esc(s.code)}</code></pre>` : ''}
</section>`;

const renderModules = mods => `
<section class="page-section" id="modules">
  <hr class="rule-mascot">
  <div class="module-grid">
    ${(mods||[]).map((m) => `
      <a class="module-card" href="https://github.com/AnEntrypoint/wireweave/blob/master/src/${esc(m.slug)}.js">
        <div class="module-head">
          <span class="row-code">${esc(m.code)}</span>
          <span class="row-meta">${esc(m.meta)}</span>
        </div>
        <div class="module-title">${esc(m.slug)}</div>
        <div class="module-blurb"><p>${md(m.blurb)}</p></div>
      </a>
    `).join('')}
  </div>
</section>`;

const layout = ({ header, footer, page }) => `<!doctype html>
<html lang="en" data-theme="paper">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)} — ${esc(header.tagline)}</title>
<meta name="description" content="${esc(page.hero.lede)}">
<link rel="stylesheet" href="./colors_and_type.css">
<link rel="stylesheet" href="./site.css">
</head>
<body>
<header class="site-header">
  <div class="brand">
    <span class="stamp green">247420</span>
    <span class="brand-name">${esc(header.brand)}</span>
  </div>
  <nav class="site-nav">${renderNav(header.nav)}</nav>
</header>

<main class="page">
  <section class="hero">
    <span class="stamp mascot">${esc(page.hero.stamp)}</span>
    <h1 class="hero">${esc(page.hero.headline)}</h1>
    <p class="t-prose">${esc(page.hero.lede)}</p>
    <div class="hero-cta">${renderCta(page.hero.cta)}</div>
  </section>

  ${(page.sections||[]).map(renderSection).join('')}
  ${renderModules(page.modules)}
</main>

<footer class="site-footer">
  <hr class="rule-double">
  <div class="footer-row">
    <span class="t-micro">${esc(footer.left)}</span>
    <div class="footer-links">${(footer.links||[]).map(l => `<a class="t-label" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>
    <span class="t-micro">${esc(footer.right)}</span>
  </div>
</footer>
</body>
</html>`;

async function main() {
  await mkdir(DOCS, { recursive: true });
  const header = findGlobal({ slug: 'header' });
  const footer = findGlobal({ slug: 'footer' });
  const { docs } = find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1 });
  const page = docs[0];
  if (!page) throw new Error('home page not found in content/pages/home.yaml');

  const html = layout({ header, footer, page });
  await writeFile(path.join(DOCS, 'index.html'), html);
  await writeFile(path.join(DOCS, '.nojekyll'), '');

  await copyFile(path.join(ROOT, 'site/colors_and_type.css'), path.join(DOCS, 'colors_and_type.css'));
  await copyFile(path.join(ROOT, 'site/site.css'), path.join(DOCS, 'site.css'));
  console.log('built →', DOCS);
}

main().catch(e => { console.error(e); process.exit(1); });
