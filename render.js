(function (root) {
  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => /^(https?:|mailto:|tel:)/i.test(u) ? u : '#';
  const isAbs = a => /^(https?:|data:|blob:)/i.test(a);
  const imgUrl = a => isAbs(a) ? a : '../../' + String(a).replace(/^\/+/, '');

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
    email: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>',
    share: '<circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.6 10.6l6.8-4M8.6 13.4l6.8 4" fill="none" stroke="currentColor" stroke-width="2"/>',
    contact: '<circle cx="10" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 21c0-4 3.4-7 7.5-7s7.5 3 7.5 7M19 7v6M16 10h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
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

  const hasContact = p => (p.links || []).some(l => /^(tel|mailto):/i.test(l.url || ''));
  const vesc = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  function vcard(p) {
    const parts = String(p.name || '').trim().split(/\s+/);
    const family = parts.length > 1 ? parts.pop() : '';
    const L = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vesc(p.name)}`, `N:${vesc(family)};${vesc(parts.join(' '))};;;`];
    if (p.company) L.push(`ORG:${vesc(p.company)}`);
    if (p.title) L.push(`TITLE:${vesc(p.title)}`);
    for (const l of p.links || []) {
      const u = String(l.url || '');
      if (/^tel:/i.test(u)) L.push(`TEL;TYPE=CELL:${u.slice(4)}`);
      else if (/^mailto:/i.test(u)) L.push(`EMAIL:${u.slice(7)}`);
      else if (/^https?:/i.test(u) && !iconFor(u)) L.push(`URL:${u}`);
    }
    L.push('END:VCARD');
    return L.join('\r\n') + '\r\n';
  }

  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const FONTS = {
    modern: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    serif: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',
    display: '"Avenir Next","Trebuchet MS","Segoe UI",system-ui,sans-serif',
    rounded: 'ui-rounded,"SF Pro Rounded","Hiragino Maru Gothic ProN",Quicksand,"Segoe UI",system-ui,sans-serif',
    mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace'
  };
  const HW = { modern: 700, serif: 600, display: 800, rounded: 700, mono: 700 };
  const lum = h => { const n = parseInt(h.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  const ink = h => lum(h) > 0.55 ? '#111' : '#fff';
  const num = (v, d) => (v == null || v === '' || isNaN(Number(v))) ? d : Number(v);

  function render(p, opts) {
    opts = opts || {};
    const t = own(themes, p.theme) ? themes[p.theme] : themes.dark;
    const accent = /^#[0-9a-f]{6}$/i.test(p.accent || '') ? p.accent : t.accent;
    const fk = own(FONTS, p.font) ? p.font : 'modern';
    const dark = lum(t.bg) < 0.5;
    const glassBg = dark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.05)';
    const glassBd = dark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.12)';
    const styles = {
      solid: `background:${t.card};border:1px solid ${accent}2e;box-shadow:0 2px 10px rgba(0,0,0,.16)`,
      outline: `background:transparent;border:1.5px solid ${accent};box-shadow:none`,
      glass: `background:${glassBg};border:1px solid ${glassBd};-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 4px 18px rgba(0,0,0,.12)`,
      soft: `background:${t.card};border:1px solid transparent;box-shadow:0 8px 24px rgba(0,0,0,.28)`
    };
    const btnCss = own(styles, p.btnStyle) ? styles[p.btnStyle] : styles.solid;

    const z = Math.min(3, Math.max(1, num(p.photoZoom, 1)));
    const fx = Math.min(100, Math.max(0, num(p.photoX, 50)));
    const fy = Math.min(100, Math.max(0, num(p.photoY, 50)));
    const imgStyle = z !== 1 ? ` style="transform:scale(${z});transform-origin:${fx}% ${fy}%"` : '';
    const realAvatar = p.avatar && !/^(data:|blob:)/i.test(p.avatar);
    const hero = p.avatar ? `<div class="hero"><img src="${esc(imgUrl(p.avatar))}" alt="" decoding="async" fetchpriority="high"${imgStyle}></div>` : '';
    const logo = p.logo ? `<img class="logo" src="${esc(imgUrl(p.logo))}" alt="">` : '';
    const roleTxt = [p.title, p.company].filter(Boolean).join(' · ');
    const role = roleTxt ? `<div class="role">${esc(roleTxt)}</div>` : '';
    const save = hasContact(p)
      ? `<a class="save b" style="--i:0" href="contact.vcf">${svg('contact')}Save contact</a>` : '';
    // iOS Safari ignores the download attribute and needs a text/vcard blob to offer "Add to Contacts"
    const saveJs = hasContact(p) ? '<script>(function(){var VCF=' + JSON.stringify(vcard(p)).replace(/</g, '\\u003c') + ';'
      + 'var b=document.querySelector("a.save");if(!b)return;'
      + 'b.addEventListener("click",function(e){e.preventDefault();'
      + 'var u=URL.createObjectURL(new Blob([VCF],{type:"text/vcard;charset=utf-8"}));'
      + 'var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);'
      + 'if(ios){window.location.href=u;return;}'
      + 'var a=document.createElement("a");a.href=u;a.download="contact.vcf";document.body.appendChild(a);a.click();a.remove();});'
      + '})();<\/script>' : '';
    const links = (p.links || []).map((l, i) =>
      `<a class="b" style="--i:${i + (hasContact(p) ? 1 : 0)}" href="${esc(safeUrl(l.url))}"${/^https?:/i.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${svg(iconFor(l.url))}${esc(l.label)}</a>`
    ).join('');

    const site = String(p.site || '').replace(/\/+$/, '');
    const ogImg = site && realAvatar ? (/^https?:/i.test(p.avatar) ? p.avatar : `${site}/${String(p.avatar).replace(/^\/+/, '')}`) : '';
    const title = esc(p.name) + (roleTxt ? ' – ' + esc(roleTxt) : '');
    const og = `<meta property="og:type" content="profile">`
      + (site && opts.slug ? `<meta property="og:url" content="${esc(site)}/p/${esc(opts.slug)}/">` : '')
      + (ogImg ? `<meta property="og:image" content="${esc(ogImg)}"><meta name="twitter:card" content="summary_large_image">` : '');

    // favicon (initial on the accent colour), home-screen icon, preload
    const letter = esc(String(p.name || '?').trim().charAt(0).toUpperCase() || '?');
    const fav = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='${accent}'/><text x='32' y='45' font-size='36' font-weight='700' text-anchor='middle' fill='${ink(accent)}' font-family='sans-serif'>${letter}</text></svg>`;
    const icons = `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(fav)}">`
      + `<meta name="apple-mobile-web-app-title" content="${esc(p.name)}">`
      + (realAvatar && !opts.preview ? `<link rel="apple-touch-icon" href="${esc(imgUrl(p.avatar))}"><link rel="preload" as="image" href="${esc(imgUrl(p.avatar))}" fetchpriority="high">` : '');

    // extras: share button, tap vibration, optional photo tilt
    let ux = 'var $=document.querySelector.bind(document);'
      + 'var sh=$(".share");if(sh)sh.addEventListener("click",function(){var u=location.href;'
      + 'if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){})}'
      + 'else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){var t=$("#toast");t.textContent="Link copied";t.classList.add("on");setTimeout(function(){t.classList.remove("on")},1800)})}});'
      + 'document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("a.b")&&navigator.vibrate)navigator.vibrate(10)});';
    if (p.tilt && p.avatar) ux += '(function(){var im=$(".hero img");if(!im||matchMedia("(prefers-reduced-motion: reduce)").matches)return;'
      + 'im.style.scale="1.08";var raf=0,tx=0,ty=0;function ap(){raf=0;im.style.translate=tx+"px "+ty+"px"}'
      + 'function set(x,y){tx=Math.max(-8,Math.min(8,x));ty=Math.max(-8,Math.min(8,y));if(!raf)raf=requestAnimationFrame(ap)}'
      + 'addEventListener("mousemove",function(e){set(-(e.clientX/innerWidth-.5)*16,-(e.clientY/innerHeight-.5)*16)});'
      + 'function on(){addEventListener("deviceorientation",function(e){if(e.gamma==null)return;set(-e.gamma/20*8,-(e.beta-45)/20*8)})}'
      + 'var D=window.DeviceOrientationEvent;'
      + 'if(D&&typeof D.requestPermission==="function"){var b=document.createElement("button");b.className="motion";b.textContent="Enable motion";'
      + 'b.onclick=function(){D.requestPermission().then(function(r){if(r==="granted")on();b.remove()}).catch(function(){b.remove()})};document.body.appendChild(b)}else if(D){on()}})();';
    const uxJs = '<script>' + ux + '<\/script>';
    const jsOn = opts.preview ? '' : '<script>document.documentElement.classList.add("js")<\/script>';
    const goJs = opts.preview ? '' : '<script>(function(){var d=document.documentElement,done=false;function go(){if(done)return;done=true;requestAnimationFrame(function(){d.classList.add("go")})}'
      + 'if(document.readyState==="complete")go();else{addEventListener("load",go);setTimeout(go,3000)}})();<\/script>';

    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${t.bg}">
${jsOn}<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${esc([roleTxt, p.bio].filter(Boolean).join(' — '))}">
${og}
${icons}
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;min-height:100dvh;background:radial-gradient(120% 55% at 50% 0%,${accent}18,transparent 62%),${t.bg};color:${t.fg};font-family:${FONTS[fk]};display:flex;justify-content:center;overflow-wrap:anywhere}
main{width:100%;max-width:460px;padding:0 20px 48px;text-align:center}
main.nophoto{padding-top:56px}
.hero{margin:0 -20px;aspect-ratio:5/6;overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 55%,transparent 100%);mask-image:linear-gradient(to bottom,#000 55%,transparent 100%)}
.hero img{width:100%;height:100%;object-fit:cover;display:block}
.logo{display:block;height:38px;max-width:150px;object-fit:contain;margin:0 auto 10px}
.info{position:relative;margin-top:-90px;margin-bottom:28px}
main.nophoto .info{margin-top:0}
h1{margin:0 0 4px;font-size:1.5rem;font-weight:${HW[fk]};letter-spacing:${fk === 'display' ? '-.02em' : '0'};text-shadow:0 1px 14px ${t.bg}}
.role{font-weight:600;opacity:.9;margin-bottom:6px;text-shadow:0 1px 14px ${t.bg}}
p{opacity:.85;margin:0;text-shadow:0 1px 14px ${t.bg}}
a{position:relative;display:block;padding:14px 48px;margin:10px 0;border-radius:14px;color:${t.fg};text-decoration:none;font-weight:600}
a.b{${btnCss};transition:transform .15s}
a.save{background:${accent};color:${ink(accent)};border-color:transparent}
a svg{position:absolute;left:16px;top:50%;width:22px;height:22px;margin-top:-11px}
a.b:hover{transform:scale(1.02)}
a.b:active{transform:scale(.98)}
.share{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:5;width:40px;height:40px;padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#fff;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;cursor:pointer}
.share svg{width:20px;height:20px}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:6;background:rgba(0,0,0,.82);color:#fff;padding:10px 16px;border-radius:999px;font:600 14px system-ui,sans-serif;opacity:0;transition:opacity .25s;pointer-events:none}
.toast.on{opacity:1}
.motion{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:6;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.55);color:#fff;font:600 13px system-ui,sans-serif}
@keyframes slidein{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
@keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.js:not(.go) a.b,.js:not(.go) .info{opacity:0}
.go .info{animation:fadeup .6s ease-out backwards}
.go a.b{animation:slidein .55s cubic-bezier(.22,1,.36,1) backwards;animation-delay:calc(var(--i)*120ms + .25s)}
@media (prefers-reduced-motion:reduce){.js:not(.go) a.b,.js:not(.go) .info{opacity:1}.go a.b,.go .info{animation:none}}
</style></head><body><main class="${p.avatar ? '' : 'nophoto'}">
${hero}
<div class="info">${logo}<h1>${esc(p.name)}</h1>${role}<p>${esc(p.bio)}</p></div>
${save}${links}
</main><button class="share" type="button" aria-label="Share">${svg('share')}</button><div class="toast" id="toast"></div>${saveJs}${uxJs}${goJs}</body></html>`;
  }

  const api = { render, vcard, hasContact, iconFor, svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Cards = api;
})(typeof window !== 'undefined' ? window : globalThis);
