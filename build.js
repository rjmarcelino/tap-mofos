const fs = require('fs');
const path = require('path');

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u) ? u : '#';
// Uploaded photos are stored as "images/x.jpg"; pages live at /p/<slug>/ so go up two levels
const imgUrl = a => /^https?:/i.test(a) ? a : '../../' + String(a).replace(/^\/+/, '');

const themes = {
  dark:  { bg: '#111',    fg: '#fff', card: '#222', accent: '#ffffff' },
  light: { bg: '#f5f5f5', fg: '#111', card: '#fff', accent: '#111111' },
  ocean: { bg: '#0b3d5c', fg: '#fff', card: '#14597f', accent: '#7fd6ff' }
};

function render(p) {
  const t = themes[p.theme] || themes.dark;
  const hero = p.avatar
    ? `<div class="hero"><img src="${esc(imgUrl(p.avatar))}" alt=""></div>` : '';
  const links = (p.links || []).map(l =>
    `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`
  ).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(p.name)}</title>
<meta property="og:title" content="${esc(p.name)}">
<meta property="og:description" content="${esc(p.bio)}">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;background:${t.bg};color:${t.fg};font-family:system-ui,sans-serif;display:flex;justify-content:center;overflow-wrap:anywhere}
main{width:100%;max-width:460px;padding:0 20px 48px;text-align:center}
main.nophoto{padding-top:48px}
.hero{margin:0 -20px;aspect-ratio:5/6;-webkit-mask-image:linear-gradient(to bottom,#000 55%,transparent 100%);mask-image:linear-gradient(to bottom,#000 55%,transparent 100%)}
.hero img{width:100%;height:100%;object-fit:cover;display:block}
.info{position:relative;margin-top:-90px}
main.nophoto .info{margin-top:0}
h1{margin:0 0 4px;font-size:1.5rem;text-shadow:0 1px 14px ${t.bg}}
p{opacity:.85;margin:0 0 28px;text-shadow:0 1px 14px ${t.bg}}
a{display:block;padding:14px;margin:10px 0;border-radius:12px;background:${t.card};color:${t.fg};text-decoration:none;font-weight:600;border:1px solid ${t.accent}33}
a:hover{transform:scale(1.02)}
</style></head><body><main class="${p.avatar ? '' : 'nophoto'}">
${hero}
<div class="info"><h1>${esc(p.name)}</h1><p>${esc(p.bio)}</p></div>
${links}
</main></body></html>`;
}

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(`${out}/p`, { recursive: true });

fs.mkdirSync('pages', { recursive: true });
for (const f of fs.readdirSync('pages').filter(f => f.endsWith('.json'))) {
  const slug = path.basename(f, '.json');
  try {
    const data = JSON.parse(fs.readFileSync(`pages/${f}`, 'utf8'));
    fs.mkdirSync(`${out}/p/${slug}`, { recursive: true });
    fs.writeFileSync(`${out}/p/${slug}/index.html`, render(data));
  } catch (e) {
    console.warn(`Skipped ${f}: ${e.message}`);
  }
}

if (fs.existsSync('images')) fs.cpSync('images', `${out}/images`, { recursive: true });
if (fs.existsSync('admin')) fs.cpSync('admin', `${out}/admin`, { recursive: true });
fs.writeFileSync(`${out}/index.html`, '<meta http-equiv="refresh" content="0;url=admin/">');
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log('Built pages.');
