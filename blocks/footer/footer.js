import { getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

function decorateLinks(section) {
  const dc = section.querySelector('.default-content');
  if (!dc) return;

  // Find all group headings (strong in p) and their following lists
  const groups = [];
  let currentGroup = null;

  [...dc.children].forEach((child) => {
    const strong = child.querySelector('strong');
    if (strong && child.tagName === 'P') {
      currentGroup = document.createElement('div');
      currentGroup.className = 'footer-group';
      currentGroup.append(child);
      groups.push(currentGroup);
    } else if (currentGroup) {
      currentGroup.append(child);
    }
  });

  if (groups.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'footer-grid';
    groups.forEach((g) => grid.append(g));
    dc.textContent = '';
    dc.append(grid);
  }
}

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
function buildFallbackFooter() {
  const fragment = document.createElement('div');
  fragment.classList.add('footer-content');

  const links = document.createElement('div');
  links.className = 'section section-links';
  links.innerHTML = `<div class="default-content"><div class="footer-grid">
    <div class="footer-group"><p><strong>About Us</strong></p><ul>
      <li><a href="/us-en/hp-information">Company Information</a></li>
      <li><a href="/us-en/newsroom">Newsroom</a></li>
      <li><a href="https://investor.hp.com/">Investor Relations</a></li>
      <li><a href="/us-en/sustainable-impact">Sustainable Impact</a></li>
      <li><a href="https://jobs.hp.com/">Careers</a></li>
    </ul></div>
    <div class="footer-group"><p><strong>Ways to buy</strong></p><ul>
      <li><a href="/us-en/shop">Shop Online</a></li>
      <li><a href="/us-en/shop/cv/hp-sales-certified">Call to Order</a></li>
      <li><a href="/us-en/shop/cv/authorized-resellers">Resellers</a></li>
    </ul></div>
    <div class="footer-group"><p><strong>Support</strong></p><ul>
      <li><a href="https://support.hp.com/us-en/drivers">Software &amp; Drivers</a></li>
      <li><a href="https://support.hp.com/us-en">Product Support</a></li>
      <li><a href="https://support.hp.com/us-en/check-warranty">Check Warranty</a></li>
      <li><a href="https://support.hp.com/us-en/contact">Contact Support</a></li>
    </ul></div>
    <div class="footer-group"><p><strong>Stay connected</strong></p><ul>
      <li><a href="https://www.facebook.com/HP">Facebook</a></li>
      <li><a href="https://twitter.com/HP">X</a></li>
      <li><a href="https://www.linkedin.com/company/hp">LinkedIn</a></li>
      <li><a href="https://www.instagram.com/hp/">Instagram</a></li>
      <li><a href="https://www.youtube.com/hp">YouTube</a></li>
      <li><a href="https://www.tiktok.com/@hp">TikTok</a></li>
    </ul></div>
  </div></div>`;

  const legal = document.createElement('div');
  legal.className = 'section section-legal';
  legal.innerHTML = `<div class="default-content"><ul>
    <li><a href="/us-en/hp-information/recalls">Recalls</a></li>
    <li><a href="/us-en/privacy/privacy-central">Privacy</a></li>
    <li><a href="/us-en/terms-of-use">Terms of use</a></li>
  </ul></div>`;

  const copyright = document.createElement('div');
  copyright.className = 'section section-copyright';
  copyright.innerHTML = '<div class="default-content"><p>©2026 HP Development Company, L.P. The information contained herein is subject to change without notice.</p></div>';

  fragment.append(links, legal, copyright);
  return fragment;
}

function decorateFooterFragment(fragment) {
  fragment.classList.add('footer-content');
  const sections = [...fragment.querySelectorAll('.section')];

  if (sections.length >= 1) {
    const copyright = sections.pop();
    copyright.classList.add('section-copyright');
  }

  if (sections.length >= 1) {
    const legal = sections.pop();
    legal.classList.add('section-legal');
  }

  if (sections.length > 0) {
    sections[0].classList.add('section-links');
    decorateLinks(sections[0]);
  }

  const socialGroup = fragment.querySelector('.footer-group:last-child ul')
    || fragment.querySelector('.section-links .footer-grid > :last-child ul');
  if (socialGroup && !socialGroup.querySelector('a[href*="youtube"]')) {
    [
      { label: 'YouTube', url: 'https://www.youtube.com/hp' },
      { label: 'TikTok', url: 'https://www.tiktok.com/@hp' },
    ].forEach(({ label, url }) => {
      const li = document.createElement('li');
      const a = Object.assign(document.createElement('a'), { href: url, textContent: label, target: '_blank', rel: 'noopener' });
      li.append(a);
      socialGroup.append(li);
    });
  }
}

export default async function init(el) {
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(path);
    const hasContent = fragment && fragment.querySelector('.section');
    if (hasContent) {
      decorateFooterFragment(fragment);
      el.append(fragment);
    } else {
      el.append(buildFallbackFooter());
    }
  } catch {
    el.append(buildFallbackFooter());
  }
}
