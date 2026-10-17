const fs = require('fs');
const path = require('path');
const { render, vcard, hasContact } = require('./render.js');

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(`${out}/p`, { recursive: true });

const manifest = [];
fs.mkdirSync('pages', { recursive: true });
for (const f of fs.readdirSync('pages').filter(f => f.endsWith('.json'))) {
  const slug = path.basename(f, '.json');
  try {
    const data = JSON.parse(fs.readFileSync(`pages/${f}`, 'utf8'));
    fs.mkdirSync(`${out}/p/${slug}`, { recursive: true });
    fs.writeFileSync(`${out}/p/${slug}/index.html`, render(data, { slug }));
    if (hasContact(data)) fs.writeFileSync(`${out}/p/${slug}/contact.vcf`, vcard(data));
    manifest.push({ slug, name: data.name || slug, avatar: data.avatar || '', links: (data.links || []).length });
  } catch (e) {
    console.warn(`Skipped ${f}: ${e.message}`);
  }
}

fs.writeFileSync(`${out}/pages.json`, JSON.stringify(manifest));
if (fs.existsSync('images')) fs.cpSync('images', `${out}/images`, { recursive: true });
if (fs.existsSync('admin')) fs.cpSync('admin', `${out}/admin`, { recursive: true });
fs.copyFileSync('render.js', `${out}/render.js`);
fs.writeFileSync(`${out}/index.html`, '<meta http-equiv="refresh" content="0;url=admin/">');
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log('Built pages.');
