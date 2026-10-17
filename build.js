const fs = require('fs');
const path = require('path');

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u) ? u : '#';
// Uploaded photos are stored as "images/x.jpg"; pages live at /p/<slug>/ so go up two levels
const imgUrl = a => /^https?:/i.test(a) ? a : '../../' + String(a).replace(/^\/+/, '');

const ICONS = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/>',
  facebook: '<path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.7c0-.9.3-1.5 1.5-1.5h1.6V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21z"/>',
  tiktok: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.3 2.6 2 4.4 5 4.6"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M10 9.2v5.6l5-2.8z"/>',
  x: '<path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V16M8 7.8v.1M12 16v-5.5M12 13c0-1.6 1-2.5 2.2-2.5S16 11.4 16 13v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  spotify: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 9.5c3-1 6.5-.7 9 .8M8 12.6c2.5-.7 5-.5 7.4.8M8.6 15.5c2-.5 4-.3 5.8.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  telegram: '<path d="M21 4 3 11l6 2.2L11 20l3-4.5 5 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>'
};
const HOSTS = [
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(facebook|fb)\.com$|^fb\.me$/, 'facebook'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'youtube'],
  [/(^|\.)(x|twitter)\.com$/, 'x'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)spotify\.com$/, 'spotify'],
  [/^t\.me$|(^|\.)telegram\.org$/, 'telegram']
];
function iconFor(url) {
  const u = String(url || '').trim();
  if (/^mailto:/i.test(u)) return 'email';
  if (/^tel:/i.test(u)) return 'phone';
  try {
    const h = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : 'https://' + u).hostname.toLowerCase();
    const m = HOSTS.find(([re]) => re.test(h));
    return m ? m[1] : '';
  } catch (e) { return ''; }
}
const svg = name => ICONS[name] ? `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>` : '';

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
    `<a href="${esc(safeUrl(l.url))}"${/^https?:/i.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${svg(iconFor(l.url))}${esc(l.label)}</a>`
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
a{position:relative;display:block;padding:14px 48px;margin:10px 0;border-radius:12px;background:${t.card};color:${t.fg};text-decoration:none;font-weight:600;border:1px solid ${t.accent}33}
a svg{position:absolute;left:16px;top:50%;width:22px;height:22px;margin-top:-11px}
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
