const fs = require('fs');
const path = require('path');
const { render, vcard, hasContact } = require('./render.js');

const out = 'dist';
// Optional: set SITE_URL in your host's environment settings (e.g. https://myproject.pages.dev) so share previews
// always use the live address, even for pages saved while the site lived somewhere else.
const SITE = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(`${out}/p`, { recursive: true });

const manifest = [];
fs.mkdirSync('pages', { recursive: true });
for (const f of fs.readdirSync('pages').filter(f => f.endsWith('.json'))) {
  const slug = path.basename(f, '.json');
  try {
    const data = JSON.parse(fs.readFileSync(`pages/${f}`, 'utf8'));
    fs.mkdirSync(`${out}/p/${slug}`, { recursive: true });
    fs.writeFileSync(`${out}/p/${slug}/index.html`, render(SITE ? { ...data, site: SITE } : data, { slug }));
    if (hasContact(data)) fs.writeFileSync(`${out}/p/${slug}/contact.vcf`, vcard(data));
    manifest.push({ slug, name: data.name || slug, avatar: data.avatar || '', logo: data.logo || '', accent: data.accent || '', links: (data.links || []).length });
  } catch (e) {
    console.warn(`Skipped ${f}: ${e.message}`);
  }
}

fs.writeFileSync(`${out}/pages.json`, JSON.stringify(manifest));
if (fs.existsSync('images')) fs.cpSync('images', `${out}/images`, { recursive: true });
if (fs.existsSync('admin')) fs.cpSync('admin', `${out}/admin`, { recursive: true });
fs.copyFileSync('render.js', `${out}/render.js`);
fs.writeFileSync(`${out}/404.html`, `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px}
h1{font-size:4rem;margin:0;letter-spacing:-.03em;opacity:.9}p{opacity:.7;margin:8px 0 0}</style></head>
<body><div><h1>404</h1><p>This card isn't available.</p><p>Check the link and try again.</p></div></body></html>`);
fs.writeFileSync(`${out}/index.html`, '<meta http-equiv="refresh" content="0;url=admin/">');
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log('Built pages.');
