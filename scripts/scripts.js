import { loadArea, setConfig } from './ak.js';

const hostnames = ['www.hp.com'];

const locales = {
  '': { lang: 'en' },
  '/us-en': { lang: 'en' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

/* Fallback: replace broken DA media proxy images with local /hp-media/ files */
const mediaFallbacks = {
  media_156a001658389d6f0e1da300c6b9f8425f67a1c3d: '/hp-media/hp-series-5-pro-desktop-v2.jpg',
  media_1b9c90703f4e862c02189db8111226dca61ea8803: '/hp-media/omnibook-ultra-visid-desktop.png',
  media_1b90f3fe9fd90c83aba5289a4375f3f6f6b6e9192: '/hp-media/smart-tank-visid-desktop.png',
  media_13e39048a221fe4bfa8d234cdf54724bc1d226acc: '/hp-media/future-of-work-visid-desktop.png',
  media_1f60ddc753a309a22e11dcbf83df4982b602011ff: '/hp-media/banner-desktop-v3.png',
  media_1e5fa44f2b31c1fb553b6021e7360d07d5d91ff5e: '/hp-media/workforce-experience-desktop.png',
  media_1deb00bc8751bfc901efa74735d2d5237fa8a0341: '/hp-media/Zaha-Hadid.png',
  media_180ee172d9b67c63c3da4d9fa14d797239468bc8a: '/hp-media/Kinepolis-desktop.png',
  media_115e2643fde8a909792f600d5a572e57e8a4e09b1: '/hp-media/UKHS.png',
  media_11465bef246af5a086c162a15884e3e7eb0cc4c5a: '/hp-media/future-of-work.png',
  media_190e1341250e8a9a81cdadd60ab3efdc2a3d064ba: '/hp-media/hp_unveils.png',
  media_1d8465917ebf6ddcdc5bb0558078ff3b26e3696dd: '/hp-media/workloads.png',
  media_115ee72e48f4cc9df01c57ee276b1a59c741a7524: '/hp-media/software-drivers.png',
  media_1976c4b4c64d6c004f72064b05498e3ad51825279: '/hp-media/check-warranty.png',
  media_12b1ed10d7d848ba2e901c1fbf42b10ac04878f11: '/hp-media/contact-hp-agent.png',
  media_1025dad520a3660cc2e8df042f562e233dd3001b3: '/hp-media/support.png',
  media_198d1f119f509de4cbe6f85ab98bf313031ca2c3c: '/hp-media/computer-support.png',
  media_174ef88097d4a23abe5a27821a61aafd919ac9363: '/hp-media/omnibook-7-visid-desktop.png',
  media_1c1b1be5e5b201cba8f52daa3e1e2ac64f7a65ee7: '/hp-media/hp-all-in-plan-visid-desktop1.png',
  media_127c1eba14b84e37a2f3cdb0b8082120aa2daa67e: '/hp-media/laptops-visid-desk.png',
  media_121c7e1fd39a3b3afb5f4e9d9a2d8e1ef8b4dbcff: '/hp-media/desktops-visid-desk.png',
  media_14e5d98c4f0f5cf88cb5c1e62f6e3cdcab44c2cde: '/hp-media/printers-visid-desk.png',
  media_1a81293f2f885e438673be191fe38b47da10b1358: '/hp-media/cartridge-visid-desk.png',
  media_1fa8e6c24b97e9d9cc44ac4f02cd7ec07ec5cfcb3: '/hp-media/monitors-desktop.png',
  media_16c2b2e8ad4f65c46b1ba8c5f0ac2c63a8ddfaa0f: '/hp-media/enterprise-desktop.png',
  media_1c0a0dbb5dc7a8e0ded4ac9b6d5c6aa8bbb1f0da5: '/hp-media/omnidesk-desktop-2.png',
  media_1eb62a73e8ffb6cd54f2b0eef14ccce9fa5d8c93e: '/hp-media/hp-monitors-desktop-2.png',
  media_135e2ab0e8cc12c14f63ff06c6a18d8a3aa52c1c6: '/hp-media/omnibook-7-desktop.png',
  media_17c0bc09c4565f4d5baab62c77b6c7cc7236b5b7e: '/hp-media/workstations-desktops.png',
  media_1ab3ba07c8e1f3e09be20618c6b3ed5cba2e7ad41: '/hp-media/real-madrid-desktop.png',
};

/* Redirect /us-en/ to /us-en/home */
if (window.location.pathname === '/us-en/' || window.location.pathname === '/us-en') {
  window.location.replace('/us-en/home');
}

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();
  const altOverrides = {
    'HP and Real Madrid partnership': '/hp-media/real-madrid-desktop.png',
  };
  function resolveMediaSrc(src, alt) {
    if (altOverrides[alt]) return altOverrides[alt];
    const match = (src || '').match(/(media_[a-f0-9]+)/);
    return match && mediaFallbacks[match[1]] ? mediaFallbacks[match[1]] : null;
  }
  document.querySelectorAll('picture').forEach((pic) => {
    const img = pic.querySelector('img');
    if (!img) return;
    const newSrc = resolveMediaSrc(img.getAttribute('src'), img.alt);
    if (!newSrc) return;
    const inAbsPos = !!pic.closest('[style*="position"],.col-1,.media-wrapper');
    const newImg = document.createElement('img');
    newImg.src = newSrc;
    newImg.alt = img.alt || '';
    newImg.loading = inAbsPos ? 'eager' : (img.loading || 'lazy');
    newImg.width = img.width;
    newImg.height = img.height;
    pic.parentNode.replaceChild(newImg, pic);
  });
  document.querySelectorAll('img[src*="media_"]').forEach((img) => {
    const newSrc = resolveMediaSrc(img.getAttribute('src'), img.alt);
    if (!newSrc) return;
    const inAbsPos = !!img.closest('.col-1,.media-wrapper');
    const newImg = document.createElement('img');
    newImg.src = newSrc;
    newImg.alt = img.alt || '';
    newImg.loading = inAbsPos ? 'eager' : (img.loading || 'lazy');
    img.parentNode.replaceChild(newImg, img);
  });

  /* Fallback: load broken DA media images from aem.live */
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete && img.naturalWidth > 0) return;
      img.addEventListener('error', () => {
        const src = img.getAttribute('src') || '';
        if (src.includes('aem.live')) return;
        const match = src.match(/(media_[a-f0-9]+\.\w+)/);
        if (match) {
          img.src = `https://main--ema-hp--ajaniadobe.aem.live/${match[1]}`;
        }
      }, { once: true });
    });
  }

  /* Rewrite unmigrated .html links to point to www.hp.com */
  document.querySelectorAll('a[href*=".html"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http')) return;
    if (href.startsWith('/us-en/')) {
      a.href = `https://www.hp.com${href}`;
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
