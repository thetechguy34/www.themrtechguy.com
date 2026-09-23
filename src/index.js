import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const app = new Hono();

// ============================================================
// SHARED STYLES
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --bg:#0b0e14; --surface:#12161f; --surface2:#1a1f2e; --border:#242938;
  --accent:#3b82f6; --accent2:#60a5fa; --text:#e8eaf0; --muted:#8892a4;
  --heading:'Syne',sans-serif; --body:'DM Sans',sans-serif;
  --radius:14px; --transition:0.25s cubic-bezier(.4,0,.2,1);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--body);background:var(--bg);color:var(--text);line-height:1.65;min-height:100vh}
a{color:var(--accent2);text-decoration:none;transition:color var(--transition)}
a:hover{color:#fff}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(11,14,20,.92);
backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.nav-logo{font-family:var(--heading);font-weight:800;font-size:1.15rem;
letter-spacing:-0.02em;color:#fff;display:flex;align-items:center;gap:.55rem}
.nav-logo .dot{width:8px;height:8px;border-radius:50%;background:var(--accent);
display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}

/* Hamburger - always visible, opens the nav drawer */
.hamburger{display:flex;flex-direction:column;gap:5px;cursor:pointer;background:none;
border:none;padding:8px;z-index:210;position:relative}
.hamburger span{display:block;width:22px;height:2px;background:var(--text);border-radius:2px;
transition:transform .25s ease,opacity .25s ease}
.hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

/* Overlay behind the drawer */
.nav-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);
opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease;z-index:190}
.nav-overlay.open{opacity:1;visibility:visible}

/* Drawer - full screen on narrow viewports, right-side panel on wider ones.
   Uses a plain CSS width media query, so it also responds correctly to
   browser zoom (zooming in effectively narrows the CSS viewport). */
.nav-drawer{position:fixed;top:0;right:0;height:100vh;width:360px;max-width:100vw;
background:var(--surface);border-left:1px solid var(--border);
transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);
z-index:200;display:flex;flex-direction:column;padding:1.5rem;overflow-y:auto}
.nav-drawer.open{transform:translateX(0)}
.nav-drawer-header{display:flex;align-items:center;justify-content:space-between;
margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid var(--border)}
.nav-drawer-title{font-family:var(--heading);font-weight:700;color:#fff;font-size:1.05rem}
.nav-drawer-close{background:none;border:none;color:var(--muted);font-size:1.7rem;
line-height:1;cursor:pointer;padding:2px 8px;transition:color var(--transition)}
.nav-drawer-close:hover{color:#fff}
.nav-drawer-links{list-style:none;display:flex;flex-direction:column;gap:.3rem}
.nav-drawer-links a{display:block;padding:.9rem 1.1rem;border-radius:10px;
font-size:.98rem;font-weight:500;color:var(--muted);transition:all var(--transition)}
.nav-drawer-links a:hover,.nav-drawer-links a.active{background:var(--surface2);color:#fff}

@media(max-width:600px){
  .nav-drawer{width:100vw;border-left:none}
}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;
justify-content:center;text-align:center;padding:8rem 2rem 4rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;
background-image:linear-gradient(var(--border) 1px,transparent 1px),
linear-gradient(90deg,var(--border) 1px,transparent 1px);
background-size:48px 48px;
mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%);opacity:.45}
.hero::after{content:'';position:absolute;top:20%;left:50%;transform:translate(-50%,-50%);
width:600px;height:600px;
background:radial-gradient(circle,rgba(59,130,246,.18) 0%,transparent 70%);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:.4rem;
background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);
border-radius:100px;padding:.3rem .85rem;font-size:.78rem;font-weight:500;
color:var(--accent2);letter-spacing:.04em;margin-bottom:1.6rem;position:relative;
animation:fadeUp .6s .1s both}
.hero h1{font-family:var(--heading);font-size:clamp(2.6rem,6vw,5rem);font-weight:800;
letter-spacing:-0.03em;line-height:1.05;color:#fff;position:relative;animation:fadeUp .6s .2s both}
.hero h1 span{color:var(--accent2)}
.hero>p{max-width:520px;color:var(--muted);font-size:1.05rem;margin:1.4rem auto 0;
position:relative;animation:fadeUp .6s .35s both}
.hero-ctas{display:flex;gap:1rem;margin-top:2.4rem;flex-wrap:wrap;justify-content:center;
position:relative;animation:fadeUp .6s .45s both}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.5rem;
border-radius:10px;font-size:.9rem;font-weight:500;cursor:pointer;
transition:all var(--transition);border:none;font-family:var(--body);text-decoration:none}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent2);color:#fff;transform:translateY(-2px);
box-shadow:0 8px 24px rgba(59,130,246,.35)}
.btn-ghost{background:var(--surface2);color:var(--text);border:1px solid var(--border)}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent2);transform:translateY(-2px)}

/* SECTIONS */
.page-section{padding:5rem 2rem;max-width:1100px;margin:0 auto}
.page-section.top{padding-top:8rem}
.section-label{font-size:.78rem;font-weight:600;letter-spacing:.1em;color:var(--accent);
text-transform:uppercase;margin-bottom:.7rem}
.section-title{font-family:var(--heading);font-size:clamp(1.7rem,3vw,2.5rem);font-weight:700;
letter-spacing:-0.02em;color:#fff;margin-bottom:1rem}
.section-sub{color:var(--muted);max-width:560px;font-size:.97rem}
.section-header{margin-bottom:3rem}

/* CARDS - the whole card is a link (href on the outer <a>) */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.2rem}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:2rem;transition:all var(--transition);position:relative;overflow:hidden;
display:block;color:inherit;cursor:pointer}
.card::before{content:'';position:absolute;inset:0;
background:linear-gradient(135deg,rgba(59,130,246,.06),transparent 60%);
opacity:0;transition:opacity var(--transition);pointer-events:none}
.card:hover{border-color:rgba(59,130,246,.4);transform:translateY(-4px)}
.card:hover::before{opacity:1}
.card:hover h3{color:var(--accent2)}
.card:hover .card-link{color:#fff}
.card-icon{width:44px;height:44px;border-radius:10px;background:rgba(59,130,246,.12);
display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:1.2rem}
.card h3{font-family:var(--heading);font-size:1.1rem;font-weight:700;color:#fff;
margin-bottom:.5rem;transition:color var(--transition)}
.card p{color:var(--muted);font-size:.9rem;line-height:1.6}
.card-link{display:inline-block;margin-top:1rem;font-size:.85rem;font-weight:500;
color:var(--accent2);transition:color var(--transition)}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.about-text p{color:var(--muted);margin-top:1rem;font-size:.97rem}
.about-placeholder{background:var(--surface2);height:280px;display:flex;align-items:center;
justify-content:center;font-size:4rem;border-radius:var(--radius);border:1px solid var(--border)}
.resume-box{margin-top:2rem;background:var(--surface);border:1px solid var(--border);
border-radius:var(--radius);padding:1.5rem 2rem;display:flex;align-items:center;
justify-content:space-between;gap:1rem;flex-wrap:wrap}
.resume-box p{color:var(--muted);font-size:.9rem}
.resume-box strong{color:var(--text);display:block;font-size:1rem;margin-bottom:.25rem}

/* CONTACT */
.contact-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.contact-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:1.4rem 1.6rem;display:flex;align-items:center;gap:1rem;transition:border-color var(--transition)}
.contact-item:hover{border-color:rgba(59,130,246,.4)}
.contact-item-icon{width:40px;height:40px;flex-shrink:0;border-radius:8px;
background:rgba(59,130,246,.12);display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.contact-item span{font-size:.78rem;color:var(--muted);display:block}
.contact-item strong{font-size:.92rem;color:var(--text)}

/* TOS / PRIVACY STATEMENT */
.tos-body{max-width:760px}
.tos-intro{color:var(--muted);font-size:.97rem;margin-bottom:2.5rem;padding-bottom:2rem;
border-bottom:1px solid var(--border)}
.tos-clause{margin-bottom:2rem}
.tos-clause h3{font-family:var(--heading);font-size:1rem;font-weight:700;color:#fff;
margin-bottom:.6rem;display:flex;align-items:center;gap:.75rem}
.tos-clause-num{display:inline-flex;align-items:center;justify-content:center;
width:26px;height:26px;border-radius:6px;background:rgba(59,130,246,.12);
border:1px solid rgba(59,130,246,.2);font-size:.75rem;font-weight:700;
color:var(--accent2);flex-shrink:0}
.tos-clause p{color:var(--muted);font-size:.92rem;line-height:1.75}
.tos-note{margin-top:.5rem;padding:.6rem .9rem;background:rgba(59,130,246,.07);
border-left:2px solid var(--accent);border-radius:0 6px 6px 0;font-size:.85rem;color:var(--muted)}
.tos-updated{display:inline-flex;align-items:center;gap:.5rem;background:var(--surface2);
border:1px solid var(--border);border-radius:8px;padding:.5rem 1rem;
font-size:.8rem;color:var(--muted);margin-bottom:2rem}

/* LOGIN GATE */
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.login-box{background:var(--surface);border:1px solid var(--border);border-radius:20px;
padding:2.8rem 2.5rem;max-width:420px;width:100%;text-align:center;animation:fadeUp .4s both}
.lock-icon{width:56px;height:56px;border-radius:14px;background:rgba(59,130,246,.12);
border:1px solid rgba(59,130,246,.25);display:flex;align-items:center;
justify-content:center;font-size:1.6rem;margin:0 auto 1.5rem}
.login-box h2{font-family:var(--heading);font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.login-box>p{color:var(--muted);font-size:.9rem;margin-bottom:1.8rem;line-height:1.6}
.ms-login-btn{display:flex;align-items:center;justify-content:center;gap:.75rem;
width:100%;padding:.85rem 1.5rem;background:#fff;color:#1a1a1a;
border:none;border-radius:10px;font-size:.95rem;font-weight:500;
font-family:var(--body);cursor:pointer;transition:all var(--transition);text-decoration:none}
.ms-login-btn:hover{background:#f0f0f0;color:#1a1a1a;transform:translateY(-2px);
box-shadow:0 8px 24px rgba(0,0,0,.3)}
.ms-login-btn svg{width:20px;height:20px;flex-shrink:0}
.login-note{margin-top:1.2rem;font-size:.78rem;color:var(--muted)}
.error-box{margin-top:1rem;padding:.75rem 1rem;background:rgba(239,68,68,.1);
border:1px solid rgba(239,68,68,.25);border-radius:8px;color:#f87171;font-size:.85rem}

/* USER BAR */
.user-bar{display:flex;align-items:center;justify-content:space-between;
background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:1rem 1.5rem;margin-bottom:2rem;flex-wrap:wrap;gap:1rem}
.user-bar-info{display:flex;align-items:center;gap:.75rem}
.user-avatar{width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,.15);
border:1px solid rgba(59,130,246,.3);display:flex;align-items:center;justify-content:center;font-size:1rem}
.user-name{font-size:.85rem;color:var(--text);font-weight:500}
.user-email{font-size:.78rem;color:var(--muted)}

/* ADMIN CENTRE SECTION (dashboard) */
.admin-section{margin-top:3rem;padding-top:2.5rem;border-top:1px solid var(--border)}
.admin-header{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.5rem}
.admin-icon{width:44px;height:44px;flex-shrink:0;border-radius:10px;background:rgba(239,68,68,.1);
border:1px solid rgba(239,68,68,.25);display:flex;align-items:center;justify-content:center;font-size:1.3rem}
.admin-header h3{font-family:var(--heading);font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:.35rem}
.admin-header p{color:var(--muted);font-size:.85rem;max-width:560px}
.admin-links{display:flex;flex-wrap:wrap;gap:.6rem}
.admin-link{display:inline-block;padding:.55rem 1rem;background:var(--surface);
border:1px solid var(--border);border-radius:8px;font-size:.82rem;font-weight:500;
color:var(--muted);transition:all var(--transition)}
.admin-link:hover{border-color:rgba(59,130,246,.4);color:var(--accent2);transform:translateY(-2px)}

/* ADMIN PANEL (user management) */
.admin-search{display:flex;gap:.6rem;margin-bottom:1.5rem;flex-wrap:wrap}
.admin-search input{flex:1;min-width:220px;padding:.7rem 1rem;border-radius:10px;
border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:var(--body);font-size:.9rem}
.admin-search input:focus{outline:none;border-color:var(--accent)}
.user-row{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
padding:1.1rem 1.4rem;display:flex;align-items:center;justify-content:space-between;
flex-wrap:wrap;gap:.9rem;margin-bottom:.8rem}
.user-row-name{font-size:.92rem;color:var(--text);font-weight:500}
.user-row-email{font-size:.8rem;color:var(--muted);margin-top:.15rem}
.status-pill{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;
font-weight:500;padding:.2rem .6rem;border-radius:100px;margin-left:.6rem}
.status-pill.enabled{background:rgba(74,222,128,.12);color:#4ade80}
.status-pill.disabled{background:rgba(248,113,113,.12);color:#f87171}
.user-row-actions{display:flex;gap:.5rem;flex-wrap:wrap}
.user-row-actions .btn{padding:.45rem .9rem;font-size:.8rem}
.btn-danger{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.3)}
.btn-danger:hover{background:rgba(239,68,68,.2);color:#fca5a5;transform:translateY(-2px)}
.flash-banner{margin-bottom:1.5rem;padding:.9rem 1.1rem;background:rgba(59,130,246,.08);
border-left:3px solid var(--accent);border-radius:0 8px 8px 0;font-size:.88rem;color:var(--text);
word-break:break-word}
.flash-banner.err{background:rgba(239,68,68,.08);border-left-color:#ef4444;color:#fca5a5}
.no-results{color:var(--muted);font-size:.9rem;padding:1rem 0}

/* ID CALLBACK / SERVICES PLACEHOLDER */
.placeholder-box{background:var(--surface);border:1px solid var(--border);
border-radius:var(--radius);padding:3rem 2rem;text-align:center;max-width:560px;margin:0 auto}
.placeholder-box .big-icon{font-size:3rem;margin-bottom:1rem}
.placeholder-box h3{font-family:var(--heading);font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:.5rem}
.placeholder-box p{color:var(--muted);font-size:.9rem}

/* DIVIDER & FOOTER */
.divider{max-width:1100px;margin:0 auto;border:none;border-top:1px solid var(--border)}
footer{max-width:1100px;margin:0 auto;padding:2rem 2rem 3rem;display:flex;
align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
footer p{color:var(--muted);font-size:.85rem}
.footer-links{display:flex;gap:1.5rem;flex-wrap:wrap}
.footer-links a{color:var(--muted);font-size:.85rem;transition:color var(--transition)}
.footer-links a:hover{color:var(--text)}
.back-row{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border)}

@media(max-width:720px){
  .about-grid{grid-template-columns:1fr}
  .resume-box{flex-direction:column;align-items:flex-start}
  .login-box{padding:2rem 1.5rem}
}
`;

// ============================================================
// HTML SHELL -- wraps every page
// ============================================================
function shell(title, body, activePage = '') {
  const navItem = (href, label, page) =>
    `<li><a href="${href}"${activePage === page ? ' class="active"' : ''}>${label}</a></li>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title} - TMTCo</title>
<style>${CSS}</style>

<link rel="icon" type="image/png" href="https://tmtcoau.com/favicon/favicon-96x96.png?v=20260916" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="https://tmtcoau.com/favicon/favicon.svg?v=20260916" />
<link rel="shortcut icon" href="https://tmtcoau.com/favicon/favicon.ico?v=20260916" />
<link rel="apple-touch-icon" sizes="180x180" href="https://tmtcoau.com/favicon/apple-touch-icon.png?v=20260916" />
<meta name="apple-mobile-web-app-title" content="TMTCo" />
<link rel="manifest" href="https://tmtcoau.com/favicon/site.webmanifest?v=20260916" />
</head>
<body>
<nav>
<a href="/" class="nav-logo"><span class="dot"></span>TheMrTechGuy</a>
<button class="hamburger" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false">
<span></span><span></span><span></span>
</button>
</nav>

<div class="nav-overlay" id="navOverlay"></div>
<aside class="nav-drawer" id="navDrawer" aria-hidden="true">
<div class="nav-drawer-header">
<span class="nav-drawer-title">Menu</span>
<button class="nav-drawer-close" id="navCloseBtn" aria-label="Close menu">&times;</button>
</div>
<ul class="nav-drawer-links">
${navItem('/', 'Home', 'home')}
${navItem('/tech', 'Tech Things', 'tech')}
${navItem('/admin', 'Admin Panel', 'admin')}
${navItem('/dashboard', 'Dashboard', 'dashboard')}
${navItem('/tos', 'Terms of Service', 'tos')}
${navItem('/contact', 'Contact', 'contact')}
${navItem('/privacy', 'Privacy', 'privacy')}
${navItem('/services', 'Services', 'services')}
</ul>
</aside>

<script>
(function(){
  var btn = document.getElementById('hamburgerBtn');
  var closeBtn = document.getElementById('navCloseBtn');
  var drawer = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');
  function openMenu(){
    drawer.classList.add('open');
    overlay.classList.add('open');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  btn.addEventListener('click', function(){
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  });
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });
})();
</script>

${body}
<hr class="divider">
<footer>
<p>&copy; 2026 TMTCo &mdash; All rights reserved.</p>
<div class="footer-links">
<a href="/tos">Terms of Service</a>
<a href="/contact">Contact</a>
<a href="/privacy">Privacy</a>
</div>
</footer>

<!-- Microsoft Teams Chat Bot - appears on every page -->

</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-transform',
    },
  });
}

// Microsoft logo SVG for login button
const MS_LOGO = `<svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="9" height="9" fill="#f25022"/>
<rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
<rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
<rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
</svg>`;

// Small helper to keep raw user/query text out of the HTML as literal markup
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// SESSION HELPERS
// ============================================================
const SESSION_TTL = 60 * 20; // 20 minutes

async function getSession(c) {
  const sid = getCookie(c, 'tmtco_sid');
  if (!sid) return null;
  try {
    const data = await c.env.SESSIONS.get(`session:${sid}`);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

async function createSession(c, userData) {
  const sid = crypto.randomUUID();
  await c.env.SESSIONS.put(
    `session:${sid}`,
    JSON.stringify(userData),
    { expirationTtl: SESSION_TTL }
  );
  setCookie(c, 'tmtco_sid', sid, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
  return sid;
}

// Persist an updated session object (e.g. after a token refresh) under the
// same session id / cookie, without resetting the user's idle timer twice.
async function saveSession(c, session) {
  const sid = getCookie(c, 'tmtco_sid');
  if (!sid) return;
  await c.env.SESSIONS.put(
    `session:${sid}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL }
  );
}

async function destroySession(c) {
  const sid = getCookie(c, 'tmtco_sid');
  if (sid) {
    try { await c.env.SESSIONS.delete(`session:${sid}`); } catch {}
  }
  deleteCookie(c, 'tmtco_sid', { path: '/' });
}

// ============================================================
// MULTI-DOMAIN HELPERS
// Both redirect URIs are registered in the Entra ID App Registration:
//   https://www.themrtechguy.com/auth/callback
//   https://www.tmtcoau.com/auth/callback
// so the redirect_uri sent to Microsoft is derived from whichever domain
// the user is actually on - no cross-domain bridging needed.
// ============================================================
const ALLOWED_HOSTS = [
  'www.themrtechguy.com',
  'themrtechguy.com',
  'www.tmtcoau.com',
  'tmtcoau.com',
];

function getBaseUrl(c) {
  const url = new URL(c.req.url);
  if (ALLOWED_HOSTS.includes(url.hostname)) {
    return `${url.protocol}//${url.host}`;
  }
  // Fallback for anything not in the allowlist (e.g. workers.dev preview URL)
  return c.env.BASE_URL;
}

// Pages the login flow is allowed to return to after auth.
// Keeps /auth/login?next=... from being usable as an open redirect.
const ALLOWED_NEXT_PATHS = ['/admin', '/dashboard'];
function sanitizeNext(path) {
  return ALLOWED_NEXT_PATHS.includes(path) ? path : '/admin';
}

// The Graph scopes the app requests. offline_access gets us a refresh
// token so an admin's session can renew its Graph access token without
// forcing a re-login every ~60-90 minutes. User.ReadWrite.All and
// Directory.Read.All are what let the Admin Panel search users and
// change accountEnabled / passwordProfile - see the walkthrough notes
// further down for the Entra ID side of this.
const GRAPH_SCOPES =
  'openid profile email offline_access User.Read User.ReadWrite.All Directory.Read.All';

// ============================================================
// GRAPH / TOKEN HELPERS
// ============================================================

// Returns a valid access token for this session, refreshing it via the
// stored refresh_token if it has expired. Returns null if refresh fails
// (caller should treat that as "session no longer valid for Graph calls").
async function getValidAccessToken(c, session) {
  if (session.access_token && session.expires_at && Date.now() < session.expires_at) {
    return session.access_token;
  }
  if (!session.refresh_token) return null;

  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = c.env;
  const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: session.refresh_token,
      grant_type: 'refresh_token',
      scope: GRAPH_SCOPES,
    }),
  });
  if (!res.ok) return null;

  const tokens = await res.json();
  session.access_token = tokens.access_token;
  session.refresh_token = tokens.refresh_token || session.refresh_token;
  session.expires_at = Date.now() + (tokens.expires_in - 60) * 1000;
  await saveSession(c, session);

  return session.access_token;
}

// True if the signed-in user's ID token carried the "PortalAdmin" app
// role. This role is assigned in Entra ID under Enterprise Applications
// -> your app -> Users and groups (see walkthrough notes). Graph itself
// will still separately enforce the signed-in admin's real directory
// role (User Administrator etc.) on every write call below - this check
// is just what decides whether the UI is shown at all.
function isPortalAdmin(session) {
  return Array.isArray(session.roles) && session.roles.includes('PortalAdmin');
}

// Thin wrapper around a Graph v1.0 call using this session's (possibly
// just-refreshed) access token.
async function graphFetch(c, session, path, options = {}) {
  const token = await getValidAccessToken(c, session);
  if (!token) return { ok: false, status: 401, body: null };

  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body = null;
  if (res.status !== 204) {
    try { body = await res.json(); } catch { body = null; }
  }
  return { ok: res.ok, status: res.status, body };
}

// Generates a temporary password that satisfies Entra ID's default
// complexity policy (upper, lower, number, symbol, 12+ chars).
function generateTempPassword() {
  const raw = crypto.randomUUID().replace(/-/g, '').slice(0, 14);
  return `${raw}Aa1!`;
}

// ============================================================
// ROUTES - HOME
// ============================================================
app.get('/', (c) => {
  const body = `
<div class="hero">
<div class="hero-badge">&#x26A1; Tech Solutions &amp; IT Support</div>
<h1>Welcome to<br><span>TMTCoau.com</span></h1>
<p>Your go-to hub for IT services, tech resources, and all things technology &mdash; backed by TMTCo.</p>
<div class="hero-ctas">
<a href="/tech" class="btn btn-primary">Explore Services</a>
<a href="/contact" class="btn btn-ghost">Get in Touch</a>
</div>
</div>

<div class="page-section">
<div class="section-header">
<div class="section-label">What we offer</div>
<h2 class="section-title">Available Services</h2>
<p class="section-sub">A collection of tools, resources, and services available through TheMrTechGuy.com.</p>
</div>
<div class="cards">
<a href="/tech" class="card">
<div class="card-icon">&#x1F4BB;</div>
<h3>Tech Things</h3>
<p>Resources and downloads curated for tech enthusiasts &mdash; including tools like Tiny11 and more.</p>
<span class="card-link">Explore &rarr;</span>
</a>
<a href="/privacy" class="card">
<div class="card-icon">&#x1F194;</div>
<h3>Privacy Statement</h3>
<p>Access the company privacy statement.</p>
<span class="card-link">Access &rarr;</span>
</a>
<a href="/admin" class="card">
<div class="card-icon">&#x1F6E1;&#xFE0F;</div>
<h3>Admin Panel</h3>
<p>Manage Entra ID user accounts &mdash; enable, disable, or reset passwords. Authorised admins only.</p>
<span class="card-link">Go to portal &rarr;</span>
</a>
</div>
</div>

<hr class="divider">

<div class="page-section">
<div class="about-grid">
<div class="about-text">
<div class="section-label">About</div>
<h2 class="section-title">For Hiring &amp; Interviewers</h2>
<p>I'm Logan Yeomans, the person behind themrtechguy.com, tmtcoau.com and TMTCo. I'm passionate about technology, IT infrastructure, and building practical solutions.</p>
<p>If you're a hiring manager or recruiter, you can grab a copy of my resume below.</p>
<div class="resume-box">
<div>
<strong>Logan Yeomans &mdash; Resume</strong>
<!-- Update date when you upload a new resume -->
<p>PDF download &middot; Last updated 2025</p>
</div>
<!-- Update resume URL if it changes -->
<a class="btn btn-primary" href="https://git.github.themrtechguy.com/TMTCo-Main-Site-assets/Logan%20Yeomans%20Resume.pdff" target="_blank">&#x2B07; Download PDF</a>
</div>
</div>
<div class="about-placeholder">&#x1F468;&#x200D;&#x1F4BB;</div>
</div>
</div>`;
  return shell('TMTCo', body, 'home');
});

// ============================================================
// ROUTES - TECH THINGS
// Add more cards in the .cards grid below
// ============================================================
app.get('/tech', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">Resources</div>
<h2 class="section-title">Tech Things</h2>
<p class="section-sub">A curated collection of useful software and resources for tech enthusiasts.</p>
</div>
<div class="cards">
<a href="https://archive.org/details/tiny-11-NTDEV/Screenshot_20230203-100010_YouTube.jpg" target="_blank" class="card">
<div class="card-icon">&#x1FA9F;</div>
<h3>Tiny11</h3>
<p>A lightweight build of Windows 11 that runs smoothly on older or lower-spec hardware. Stripped of bloat, designed to just work.</p>
<span class="card-link">Download from Archive.org &rarr;</span>
</a>
<!-- Add more tech resource cards here -->
</div>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('Tech Things', body, 'tech');
});

// ============================================================
// ROUTES - ADMIN PANEL (auth + role protected)
// Replaces the old "Cloud Password Reset" page. Lets a signed-in,
// role-assigned admin search Entra ID users via Graph and enable,
// disable, or reset the password on an account.
//
// /passreset is kept as a redirect so any old bookmarks/links still work.
// ============================================================
app.get('/passreset', (c) => c.redirect('/admin', 301));

app.get('/admin', async (c) => {
  const session = await getSession(c);
  const error = c.req.query('error');

  // Not signed in at all - show the Microsoft login wall
  if (!session) {
    const body = `
<div class="login-page">
<div class="login-box">
<div class="lock-icon">&#x1F510;</div>
<h2>Authorised Access Only</h2>
<p>This portal is restricted to TMTCo administrators.<br>Sign in with your organisational account to continue.</p>
<a href="/auth/login?next=/admin" class="ms-login-btn">
${MS_LOGO}
Sign in with Microsoft
</a>
${error ? `<div class="error-box">Sign-in failed or access denied. Contact logan.admin@directory.themrtechguy.com for help.</div>` : ''}
<p class="login-note">&#x1F512; Secured via Microsoft Entra ID &middot; TMTCo internal use only</p>
</div>
</div>`;
    return shell('Sign In', body, 'admin');
  }

  // Signed in, but doesn't hold the PortalAdmin app role in Entra ID
  if (!isPortalAdmin(session)) {
    const body = `
<div class="page-section top">
<div class="user-bar">
<div class="user-bar-info">
<div class="user-avatar">&#x1F464;</div>
<div>
<div class="user-name">${escapeHtml(session.name || session.email)}</div>
<div class="user-email">${escapeHtml(session.email)}</div>
</div>
</div>
<a href="/auth/logout" class="btn btn-ghost" style="font-size:.85rem;padding:.5rem 1rem;">Sign out</a>
</div>
<div class="placeholder-box">
<div class="big-icon">&#x26D4;</div>
<h3>Not Authorised</h3>
<p>Your account is signed in but doesn't hold the admin role required for this panel. Contact <a href="mailto:logan.admin@directory.themrtechguy.com">logan.admin@directory.themrtechguy.com</a> if you believe this is a mistake.</p>
</div>
</div>`;
    return shell('Admin Panel', body, 'admin');
  }

  // Authorised - run a search if one was submitted
  const search = c.req.query('q') || '';
  const flashMsg = c.req.query('flash') || '';
  const flashErr = c.req.query('flasherr') || '';

  let results = [];
  let searchFailed = false;

  if (search) {
    const safe = search.replace(/'/g, "''"); // basic OData single-quote escaping
    const filter =
      `startswith(displayName,'${safe}') or startswith(userPrincipalName,'${safe}') or startswith(mail,'${safe}')`;
    const r = await graphFetch(
      c,
      session,
      `/users?$filter=${encodeURIComponent(filter)}&$select=id,displayName,userPrincipalName,mail,accountEnabled&$top=15&$orderby=displayName`
    );
    if (r.ok && r.body) {
      results = r.body.value || [];
    } else {
      searchFailed = true;
      // Temporary debug logging - check Worker logs (wrangler tail) after a
      // failed search to see Graph's actual status/error, then remove this.
      console.error('Graph user search failed:', r.status, JSON.stringify(r.body));
    }
  }

  const rows = results.map((u) => {
    const enabled = !!u.accountEnabled;
    const upn = u.userPrincipalName || u.mail || '';
    return `
<div class="user-row">
  <div>
    <div class="user-row-name">${escapeHtml(u.displayName || '(no name)')}
      <span class="status-pill ${enabled ? 'enabled' : 'disabled'}">
        ${enabled ? '&#9679; Enabled' : '&#9679; Disabled'}
      </span>
    </div>
    <div class="user-row-email">${escapeHtml(upn)}</div>
  </div>
  <div class="user-row-actions">
    <form method="POST" action="/admin/action">
      <input type="hidden" name="userId" value="${escapeHtml(u.id)}">
      <input type="hidden" name="q" value="${escapeHtml(search)}">
      <input type="hidden" name="action" value="${enabled ? 'disable' : 'enable'}">
      <button type="submit" class="btn ${enabled ? 'btn-danger' : 'btn-ghost'}">
        ${enabled ? 'Disable account' : 'Enable account'}
      </button>
    </form>
    <form method="POST" action="/admin/action"
      onsubmit="return confirm('Reset the password for ${escapeHtml((u.displayName || upn).replace(/'/g, "\\'"))}? A new temporary password will be generated and shown once.');">
      <input type="hidden" name="userId" value="${escapeHtml(u.id)}">
      <input type="hidden" name="q" value="${escapeHtml(search)}">
      <input type="hidden" name="action" value="reset">
      <button type="submit" class="btn btn-ghost">Reset password</button>
    </form>
  </div>
</div>`;
  }).join('');

  const body = `
<div class="page-section top">
<div class="user-bar">
<div class="user-bar-info">
<div class="user-avatar">&#x1F464;</div>
<div>
<div class="user-name">${escapeHtml(session.name || session.email)}</div>
<div class="user-email">${escapeHtml(session.email)}</div>
</div>
</div>
<a href="/auth/logout" class="btn btn-ghost" style="font-size:.85rem;padding:.5rem 1rem;">Sign out</a>
</div>

<div class="section-header">
<div class="section-label">Authorised Portal &middot; Microsoft Graph</div>
<h2 class="section-title">Admin Panel</h2>
<p class="section-sub">Search for a user by name or email to enable, disable, or reset their Entra ID account. Actions are performed with your own admin permissions via Microsoft Graph.</p>
</div>

${flashMsg ? `<div class="flash-banner">${flashMsg}</div>` : ''}
${flashErr ? `<div class="flash-banner err">${flashErr}</div>` : ''}

<form method="GET" action="/admin" class="admin-search">
<input type="text" name="q" value="${escapeHtml(search)}" placeholder="Search by name or email&hellip;" autocomplete="off">
<button type="submit" class="btn btn-primary">Search</button>
</form>

${searchFailed ? `<p class="no-results">Search failed &mdash; your session may need refreshing, or you may be missing the required Graph permission. Try signing out and back in.</p>` : ''}
${!searchFailed && search && results.length === 0 ? `<p class="no-results">No users found matching "${escapeHtml(search)}".</p>` : ''}
${rows}

<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('Admin Panel', body, 'admin');
});

// Handles the enable / disable / reset actions from the Admin Panel.
// Every write is made via Graph using the signed-in admin's own
// delegated token, so Graph enforces their real Entra ID role on top
// of the PortalAdmin app-role gate below.
app.post('/admin/action', async (c) => {
  const session = await getSession(c);
  if (!session || !isPortalAdmin(session)) {
    return c.redirect('/admin?error=1');
  }

  const form = await c.req.parseBody();
  const userId = form.userId;
  const action = form.action;
  const q = typeof form.q === 'string' ? form.q : '';

  if (!userId || !['enable', 'disable', 'reset'].includes(action)) {
    return c.redirect(`/admin?q=${encodeURIComponent(q)}&flasherr=${encodeURIComponent('Invalid request.')}`);
  }

  let flash = '';
  let flasherr = '';

  if (action === 'enable' || action === 'disable') {
    const r = await graphFetch(c, session, `/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ accountEnabled: action === 'enable' }),
    });
    if (r.ok) {
      flash = `Account ${action === 'enable' ? 'enabled' : 'disabled'} successfully.`;
    } else {
      flasherr = `Failed to ${action} account (Graph returned status ${r.status}). This usually means your Entra ID role doesn't permit this change for that user.`;
    }
  }

  if (action === 'reset') {
    const tempPassword = generateTempPassword();
    const r = await graphFetch(c, session, `/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password: tempPassword,
        },
      }),
    });
    if (r.ok) {
      flash = `Password reset. Temporary password (share securely &mdash; shown once only): <strong>${escapeHtml(tempPassword)}</strong>`;
    } else {
      flasherr = `Failed to reset password (Graph returned status ${r.status}). This usually means your Entra ID role doesn't permit resetting this user's password (e.g. they hold an admin role themselves).`;
    }
  }

  const params = new URLSearchParams({ q });
  if (flash) params.set('flash', flash);
  if (flasherr) params.set('flasherr', flasherr);
  return c.redirect(`/admin?${params.toString()}`);
});

// ============================================================
// ROUTES - DASHBOARD (auth protected - same login flow as /admin)
// Quick access to Microsoft 365 apps, plus an Admin Centre section at
// the bottom linking to the Microsoft admin portals. Access to each
// admin portal is still gated by the signed-in user's actual admin
// role assignments in Entra ID - these are just direct links, not a
// bypass of that role check.
// ============================================================
app.get('/dashboard', async (c) => {
  const session = await getSession(c);

  if (session) {
    const body = `
<div class="page-section top">
<div class="user-bar">
<div class="user-bar-info">
<div class="user-avatar">&#x1F464;</div>
<div>
<div class="user-name">${escapeHtml(session.name || session.email)}</div>
<div class="user-email">${escapeHtml(session.email)}</div>
</div>
</div>
<a href="/auth/logout" class="btn btn-ghost" style="font-size:.85rem;padding:.5rem 1rem;">Sign out</a>
</div>

<div class="section-header">
<div class="section-label">TMTCo</div>
<h2 class="section-title">Dashboard</h2>
<p class="section-sub">Quick access to your Microsoft 365 apps and files.</p>
</div>
<div class="cards">
<a href="https://outlook.office.com/mail/" target="_blank" class="card">
<div class="card-icon">&#x1F4E7;</div>
<h3>Outlook</h3>
<p>Check email, calendar, and contacts.</p>
<span class="card-link">Open Outlook &rarr;</span>
</a>
<a href="https://tmtcoau-my.sharepoint.com" target="_blank" class="card">
<div class="card-icon">&#x1F4C1;</div>
<h3>OneDrive</h3>
<p>Access your TMTCo OneDrive files and folders.</p>
<span class="card-link">Open OneDrive &rarr;</span>
</a>
<a href="https://www.office.com/launch/word" target="_blank" class="card">
<div class="card-icon">&#x1F4DD;</div>
<h3>Word</h3>
<p>Create and edit documents online.</p>
<span class="card-link">Open Word &rarr;</span>
</a>
<a href="https://www.office.com/launch/excel" target="_blank" class="card">
<div class="card-icon">&#x1F4CA;</div>
<h3>Excel</h3>
<p>Create and edit spreadsheets online.</p>
<span class="card-link">Open Excel &rarr;</span>
</a>
<a href="https://www.office.com/launch/powerpoint" target="_blank" class="card">
<div class="card-icon">&#x1F4FD;&#xFE0F;</div>
<h3>PowerPoint</h3>
<p>Create and edit presentations online.</p>
<span class="card-link">Open PowerPoint &rarr;</span>
</a>
<a href="https://teams.microsoft.com" target="_blank" class="card">
<div class="card-icon">&#x1F4AC;</div>
<h3>Teams</h3>
<p>Chat, meet, and collaborate with the team.</p>
<span class="card-link">Open Teams &rarr;</span>
</a>
<a href="https://tmtcoau.sharepoint.com" target="_blank" class="card">
<div class="card-icon">&#x1F5C2;&#xFE0F;</div>
<h3>SharePoint</h3>
<p>Browse TMTCo team sites and shared document libraries.</p>
<span class="card-link">Open SharePoint &rarr;</span>
</a>
<a href="https://www.office.com" target="_blank" class="card">
<div class="card-icon">&#x1F5C3;&#xFE0F;</div>
<h3>All Apps</h3>
<p>Browse the full Microsoft 365 app launcher.</p>
<span class="card-link">Open Microsoft 365 &rarr;</span>
</a>
</div>

<div class="admin-section">
<div class="admin-header">
<span class="admin-icon">&#x1F6E1;&#xFE0F;</span>
<div>
<h3>Admin Centre</h3>
<p>Direct links to Microsoft's admin portals. Access to each one still depends on your account's assigned admin role in Entra ID.</p>
</div>
</div>
<div class="admin-links">
<a href="https://admin.microsoft.com" target="_blank" class="admin-link">Microsoft 365 admin center</a>
<a href="https://entra.microsoft.com" target="_blank" class="admin-link">Entra admin center</a>
<a href="https://admin.exchange.microsoft.com" target="_blank" class="admin-link">Exchange admin center</a>
<a href="https://tmtcoau-admin.sharepoint.com" target="_blank" class="admin-link">SharePoint admin center</a>
<a href="https://admin.teams.microsoft.com" target="_blank" class="admin-link">Teams admin center</a>
<a href="https://security.microsoft.com" target="_blank" class="admin-link">Security admin center</a>
<a href="https://compliance.microsoft.com" target="_blank" class="admin-link">Purview compliance portal</a>
<a href="https://intune.microsoft.com" target="_blank" class="admin-link">Intune admin center</a>
<a href="https://portal.azure.com" target="_blank" class="admin-link">Azure portal</a>
<a href="https://admin.powerplatform.microsoft.com" target="_blank" class="admin-link">Power Platform admin center</a>
</div>
</div>

<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
    return shell('Dashboard', body, 'dashboard');
  }

  // Not authenticated - show login wall (same flow as /admin)
  const error = c.req.query('error');
  const body = `
<div class="login-page">
<div class="login-box">
<div class="lock-icon">&#x1F510;</div>
<h2>Authorised Access Only</h2>
<p>Sign in with your TMTCo Microsoft account to access your dashboard.</p>
<a href="/auth/login?next=/dashboard" class="ms-login-btn">
${MS_LOGO}
Sign in with Microsoft
</a>
${error ? `<div class="error-box">Sign-in failed or access denied. Contact logan.admin@directory.themrtechguy.com for help.</div>` : ''}
<p class="login-note">&#x1F512; Secured via Microsoft Entra ID &middot; TMTCo internal use only</p>
</div>
</div>`;
  return shell('Sign In', body, 'dashboard');
});

// ============================================================
// ROUTES - AUTH (OAuth2 server-side flow)
// Supports multiple domains via ALLOWED_HOSTS / getBaseUrl() above.
// Supports returning to whichever page started the login (admin
// or dashboard) via a ?next= param stored in a short-lived cookie.
// ============================================================

// Step 1: redirect to Microsoft
app.get('/auth/login', (c) => {
  const { TENANT_ID, CLIENT_ID } = c.env;
  const baseUrl = getBaseUrl(c);
  const redirectUri = `${baseUrl}/auth/callback`;
  const state = crypto.randomUUID();
  const next = sanitizeNext(c.req.query('next') || '/admin');

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: GRAPH_SCOPES,
    state,
  });

  setCookie(c, 'oauth_state', state, {
    httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 300,
  });
  setCookie(c, 'oauth_next', next, {
    httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 300,
  });

  return c.redirect(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`
  );
});

// Step 2: Microsoft redirects back here with a code
app.get('/auth/callback', async (c) => {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = c.env;
  const baseUrl = getBaseUrl(c);
  const { code, state, error } = c.req.query();
  const savedState = getCookie(c, 'oauth_state');
  const next = sanitizeNext(getCookie(c, 'oauth_next') || '/admin');
  deleteCookie(c, 'oauth_state', { path: '/' });
  deleteCookie(c, 'oauth_next', { path: '/' });

  if (error || !code || state !== savedState) {
    return c.redirect(`${next}?error=1`);
  }

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/auth/callback`,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!tokenRes.ok) return c.redirect(`${next}?error=1`);
    const tokens = await tokenRes.json();

    const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!graphRes.ok) return c.redirect(`${next}?error=1`);
    const user = await graphRes.json();

    // Pull the "roles" claim out of the ID token so we know whether this
    // user holds the PortalAdmin app role (assigned in Entra ID under
    // Enterprise Applications -> your app -> Users and groups). This ID
    // token came from the server-to-server call above, not the browser
    // redirect, so it's trustworthy for this purpose without needing a
    // separate signature check.
    let roles = [];
    try {
      let payloadB64 = tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      // base64url has no padding, but atob() requires the string length
      // to be a multiple of 4 - pad it back out before decoding, or this
      // throws and the catch below silently leaves roles as [].
      while (payloadB64.length % 4 !== 0) payloadB64 += '=';
      const payload = JSON.parse(atob(payloadB64));
      roles = Array.isArray(payload.roles) ? payload.roles : [];
      console.log('ID token roles claim:', JSON.stringify(roles), '| aud:', payload.aud, '| appid matches CLIENT_ID:', payload.aud === CLIENT_ID);
    } catch (e) {
      console.error('Failed to decode ID token for roles claim:', e);
    }

    await createSession(c, {
      name: user.displayName || user.givenName || '',
      email: user.mail || user.userPrincipalName || '',
      roles,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: Date.now() + ((tokens.expires_in || 3600) - 60) * 1000,
    });

    return c.redirect(next);
  } catch (err) {
    console.error('Auth callback error:', err);
    return c.redirect(`${next}?error=1`);
  }
});

// Step 3: logout
app.get('/auth/logout', async (c) => {
  const { TENANT_ID } = c.env;
  const baseUrl = getBaseUrl(c);
  await destroySession(c);
  return c.redirect(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${baseUrl}`
  );
});

// ============================================================
// ROUTES - ID CALLBACK
// Kept live (not linked from nav or the home cards) - replace
// placeholder content with real tools later
// ============================================================
app.get('/idcallback', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">Identity Services</div>
<h2 class="section-title">ID Callback</h2>
<p class="section-sub">TMTCo identity callback services. Contact admin if you need access or assistance.</p>
</div>
<div class="placeholder-box">
<div class="big-icon">&#x1F194;</div>
<h3>Coming Soon</h3>
<p>This page is being set up. In the meantime reach out to <a href="mailto:logan.admin@directory.themrtechguy.com">logan.admin@directory.themrtechguy.com</a> for identity callback assistance.</p>
</div>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('ID Callback', body, 'idcallback');
});

// ============================================================
// ROUTES - SERVICES
// Placeholder so the nav link doesn't 404 - replace with real content
// ============================================================
app.get('/services', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">TMTCo</div>
<h2 class="section-title">Services</h2>
<p class="section-sub">An overview of services offered by TMTCo.</p>
</div>
<div class="placeholder-box">
<div class="big-icon">&#x1F6E0;&#xFE0F;</div>
<h3>Coming Soon</h3>
<p>This page is being set up. Reach out to <a href="mailto:logan.kelly@tmtcoau.com">logan.kelly@tmtcoau.com</a> in the meantime.</p>
</div>
<div class="placeholder-box">

<a href="https://themrtechguy.com/spo" target="_blank" class="card">
<div class="card-icon">&#127925;</div>
<h3>Spotify</h3>
<p>Access the TMTCo Spotify page.</p>
<span class="card-link">Open OneDrive &rarr;</span>
</a>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>


</div>`;
  return shell('Services', body, 'services');
});

// ============================================================
// ROUTES - TERMS OF SERVICE
// Edit clauses below - update the date when you revise
// ============================================================
app.get('/tos', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">Legal</div>
<h2 class="section-title">Terms of Service</h2>
<p class="section-sub">Terms of use for all services hosted on themrtechguy.com and operated by TMTCo.</p>
</div>
<div class="tos-body">

<!-- Update this date whenever you revise the TOS -->
<div class="tos-updated">&#x1F4C5; Last reviewed: 2025</div>

<p class="tos-intro">Welcome to themrtechguy.com. These Terms of Service govern your use of all services provided through this website and associated platforms operated by TMTCo. By accessing or using our services, you agree to be bound by these terms. If you do not agree, please discontinue use of our services immediately.</p>

<div class="tos-clause">
<h3><span class="tos-clause-num">1</span> Acceptance of Terms</h3>
<p>By using themrtechguy.com or any associated service, you confirm your acceptance of these Terms and agree to comply with all applicable laws and regulations. These Terms apply to all visitors, users, and anyone else who accesses our services.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">2</span> User Accounts and Data</h3>
<p>Certain services may require you to create an account or have data associated with you. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate and complete information at all times.</p>
<div class="tos-note">&#x26A0;&#xFE0F; This clause applies only to services that require a user account or store your data &mdash; it does not apply to this website itself.</div>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">3</span> Data Ownership and Responsibility</h3>
<p>You retain ownership of all data, files, and content you upload or submit to any TMTCo service. We do not claim ownership of your data. By using our services, you grant us the right to store and process your data only as necessary to deliver the service.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">4</span> Prohibited Activities</h3>
<p>You agree not to use any TMTCo service for illegal or unauthorised purposes. Prohibited activities include but are not limited to: infringing intellectual property rights, distributing malware or malicious content, attempting unauthorised access to systems or data, harassment of other users, and any activity that violates applicable law.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">5</span> Account Termination</h3>
<p>Violation of these Terms may result in the suspension or termination of your access at our sole discretion. In cases involving stored data, termination may result in loss of access to that data. We recommend maintaining your own backups of any critical data held within TMTCo services.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">6</span> Service Availability and Changes</h3>
<p>While we strive to provide reliable and continuous service, we cannot guarantee uninterrupted availability. TMTCo reserves the right to modify, suspend, or discontinue any service at any time.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">7</span> Security</h3>
<p>We implement reasonable security measures to protect data handled by TMTCo services. However, no system is entirely immune to risk. You acknowledge the inherent risks associated with transmitting data over the internet and accept that we cannot guarantee absolute security.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">8</span> Intellectual Property</h3>
<p>All content provided by TMTCo &mdash; including but not limited to software, graphics, logos, and design &mdash; is the property of TMTCo or is used under licence. You may not reproduce, distribute, or use any TMTCo content without explicit written permission.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">9</span> Changes to These Terms</h3>
<p>These Terms may be updated periodically. Changes take effect immediately upon being posted to this page. Continued use of our services after any changes constitutes your acceptance of the revised Terms.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">10</span> Contact</h3>
<p>If you have any questions or feedback regarding these Terms, please get in touch:</p>
<div class="tos-note">&#x1F4E7; <a href="mailto:logan.admin@directory.themrtechguy.com">logan.admin@directory.themrtechguy.com</a> &nbsp;&middot;&nbsp; &#x1F4DE; +61 0493 715 746</div>
</div>

</div>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('Terms of Service', body, 'tos');
});

// ============================================================
// ROUTES - PRIVACY POLICY
// Edit clauses below - update the date when you revise
// ============================================================
app.get('/privacy', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">Legal</div>
<h2 class="section-title">Privacy Policy</h2>
<p class="section-sub">How we collect, use, and protect your information across all services hosted on themrtechguy.com and operated by TMTCo.</p>
</div>
<div class="tos-body">

<!-- Update this date whenever you revise the Privacy Policy -->
<div class="tos-updated">&#x1F4C5; Last reviewed: 2025</div>

<p class="tos-intro">This Privacy Policy explains how TMTCo collects, uses, discloses, and safeguards your information when you use themrtechguy.com or any associated service. By using our services, you consent to the practices described in this policy. If you do not agree with this policy, please discontinue use of our services immediately.</p>

<div class="tos-clause">
<h3><span class="tos-clause-num">1</span> Information We Collect</h3>
<p>We may collect information you provide directly, such as your name, email address, and any content or files you submit to a TMTCo service. We may also automatically collect technical information such as your IP address, browser type, device information, and usage data when you interact with our services.</p>
<div class="tos-note">&#x26A0;&#xFE0F; Account-related data collection applies only to services that require a user account &mdash; it does not apply to this website itself.</div>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">2</span> How We Use Your Information</h3>
<p>We use collected information to operate, maintain, and improve our services, to respond to your inquiries, to monitor and prevent misuse, and to comply with legal obligations. We do not sell your personal information to third parties.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">3</span> Cookies and Tracking</h3>
<p>We may use cookies or similar technologies to support basic site functionality and to understand how our services are used. You can control or disable cookies through your browser settings, though some features may not function correctly without them.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">4</span> Data Sharing and Disclosure</h3>
<p>We do not share your personal information with third parties except: where necessary to provide a service you have requested, where required to comply with applicable law or legal process, to protect the rights, property, or safety of TMTCo or others, or with your explicit consent.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">5</span> Microsoft Entra ID and Company Accounts</h3>
<p>Some TMTCo services are accessed using Microsoft Entra ID (formerly Azure Active Directory) for identity and access management. Where this applies, we may process account information provided by Entra ID, such as your name, organisational email address, user ID, and assigned roles or group memberships, in order to authenticate you and control access to the relevant service.</p>
<p>This includes guest accounts provisioned through Entra ID B2B collaboration for external users invited to access TMTCo services on behalf of a partner organisation or client. Guest account information is used solely to manage access and is subject to the access policies of both TMTCo and the guest's home organisation.</p>
<p>We do not control, and are not responsible for, the identity or directory data managed within a third-party organisation's own Entra ID tenant. Access to TMTCo services via Entra ID can be revoked at any time by TMTCo or by the account's home organisation.</p>
<div class="tos-note">&#x26A0;&#xFE0F; This clause applies only to services that use Entra ID for sign-in &mdash; it does not apply to this website itself.</div>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">6</span> Data Retention</h3>
<p>We retain your information only for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. When information is no longer needed, we take reasonable steps to delete or anonymise it.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">7</span> Data Security</h3>
<p>We implement reasonable security measures to protect information handled by TMTCo services. However, no system is entirely immune to risk. You acknowledge the inherent risks associated with transmitting data over the internet and accept that we cannot guarantee absolute security.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">8</span> Your Rights and Choices</h3>
<p>Depending on your location, you may have rights to access, correct, or request deletion of your personal information, or to object to or restrict certain processing. To exercise any of these rights, please contact us using the details below.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">9</span> Third-Party Links and Services</h3>
<p>Our services may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of those third parties, and we encourage you to review their respective privacy policies.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">10</span> Children's Privacy</h3>
<p>Our services are not directed to children, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">11</span> Changes to This Policy</h3>
<p>This Privacy Policy may be updated periodically. Changes take effect immediately upon being posted to this page. Continued use of our services after any changes constitutes your acceptance of the revised policy.</p>
</div>
<div class="tos-clause">
<h3><span class="tos-clause-num">12</span> Contact</h3>
<p>If you have any questions or concerns regarding this Privacy Policy or your personal information, please get in touch:</p>
<div class="tos-note">&#x1F4E7; <a href="mailto:logan.admin@directory.themrtechguy.com">logan.admin@directory.themrtechguy.com</a> &nbsp;&middot;&nbsp; &#x1F4DE; +61 0493 715 746</div>
</div>

</div>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('Privacy Policy', body, 'privacy');
});

// ============================================================
// ROUTES - CONTACT
// Edit phone, email and details here
// ============================================================
app.get('/contact', (c) => {
  const body = `
<div class="page-section top">
<div class="section-header">
<div class="section-label">Get in touch</div>
<h2 class="section-title">Contact Us</h2>
<p class="section-sub">Reach out any time &mdash; we're happy to help with any questions or tech needs.</p>
</div>
<div class="contact-cards">
<div class="contact-item">
<div class="contact-item-icon">&#x1F4DE;</div>
<div>
<span>Phone</span>
<!-- Update phone number -->
<strong>+61 0493 715 746</strong>
</div>
</div>
<div class="contact-item">
<div class="contact-item-icon">&#x2709;&#xFE0F;</div>
<div>
<span>Email</span>
<strong><a href="mailto:logan.kelly@tmtcoau.com" style="color:var(--text)">logan.kelly@tmtcoau.com</a></strong>
</div>
</div>
<div class="contact-item">
<div class="contact-item-icon">&#x1F310;</div>
<div>
<span>Website</span>
<strong>tmtcoau.com</strong>
</div>
</div>
<!-- Add more contact items here -->
</div>
<div class="back-row"><a href="/" class="btn btn-ghost">&larr; Back to Home</a></div>
</div>`;
  return shell('Contact', body, 'contact');
});

export default app;
