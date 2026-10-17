const fs = require('fs');
const path = require('path');

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u) ? u : '#';

const themes = {
  dark:  { bg: '#111',    fg: '#fff', card: '#222',    accent: '#ffffff' },
  light: { bg: '#f5f5f5', fg: '#111', card: '#fff',    accent: '#111111' },
  ocean: { bg: '#0b3d5c', fg: '#fff', card: '#14597f', accent: '#7fd6ff' }
};

function render(p) {
  const t = themes[p.theme] || themes.dark;
  const links = (p.links || []).map(l =>
    `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`
  ).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.name)}</title>
<meta property="og:title" content="${esc(p.name)}">
<meta property="og:description" content="${esc(p.bio)}">
<style>
body{margin:0;min-height:100vh;background:${t.bg};color:${t.fg};font-family:system-ui,sans-serif;display:flex;justify-content:center}
main{width:100%;max-width:460px;padding:48px 20px;text-align:center}
img{width:96px;height:96px;border-radius:50%;object-fit:cover}
h1{margin:12px 0 4px;font-size:1.4rem}
p{opacity:.8;margin:0 0 28px}
a{display:block;padding:14px;margin:10px 0;border-radius:12px;background:${t.card};color:${t.fg};text-decoration:none;font-weight:600;border:1px solid ${t.accent}33}
a:hover{transform:scale(1.02)}
</style></head><body><main>
${p.avatar ? `<img src="${esc(p.avatar)}" alt="">` : ''}
<h1>${esc(p.name)}</h1><p>${esc(p.bio)}</p>${links}
</main></body></html>`;
}

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(`${out}/p`, { recursive: true });

for (const f of fs.readdirSync('pages').filter(f => f.endsWith('.json'))) {
  const slug = path.basename(f, '.json');
  const data = JSON.parse(fs.readFileSync(`pages/${f}`, 'utf8'));
  fs.mkdirSync(`${out}/p/${slug}`, { recursive: true });
  fs.writeFileSync(`${out}/p/${slug}/index.html`, render(data));
}

fs.cpSync('admin', `${out}/admin`, { recursive: true });
fs.writeFileSync(`${out}/index.html`,
  '<meta http-equiv="refresh" content="0;url=admin/">');
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log('Built pages.');
