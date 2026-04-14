import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';
import { setColorScheme } from '../section-metadata/section-metadata.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';
const HEADER_ACTIONS = [
  '/tools/widgets/scheme',
  '/tools/widgets/language',
  '/tools/widgets/toggle',
];

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
  }
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }

  // Setup the global close event
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLanguage(btn) {
  const section = btn.closest('.section');
  btn.addEventListener('click', async () => {
    let menu = section.querySelector('.language.menu');
    if (!menu) {
      const content = document.createElement('div');
      content.classList.add('block-content');
      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/languages`);
      menu = document.createElement('div');
      menu.className = 'language menu';
      menu.append(fragment);
      content.append(menu);
      section.append(content);
    }
    toggleMenu(section);
  });
}

function decorateScheme(btn) {
  btn.addEventListener('click', async () => {
    const { body } = document;

    let currPref = localStorage.getItem('color-scheme');
    if (!currPref) {
      currPref = matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark-scheme' : 'light-scheme';
    }

    const theme = currPref === 'dark-scheme'
      ? { add: 'light-scheme', remove: 'dark-scheme' }
      : { add: 'dark-scheme', remove: 'light-scheme' };

    body.classList.remove(theme.remove);
    body.classList.add(theme.add);
    localStorage.setItem('color-scheme', theme.add);
    // Re-calculatie section schemes
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
      setColorScheme(section);
    }
  });
}

function decorateNavToggle(btn) {
  btn.addEventListener('click', () => {
    const header = document.body.querySelector('header');
    if (header) header.classList.toggle('is-mobile-open');
  });
}

async function decorateAction(header, pattern) {
  const link = header.querySelector(`[href*="${pattern}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent;
  const btn = document.createElement('button');
  if (icon) btn.append(icon);
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }
  const wrapper = document.createElement('div');
  const iconClass = icon?.classList?.[1]?.replace('icon-', '') || 'action';
  wrapper.className = `action-wrapper ${iconClass}`;
  wrapper.append(btn);
  const linkParent = link.parentElement;
  if (linkParent?.parentElement) {
    linkParent.parentElement.replaceChild(wrapper, linkParent);
  }

  if (pattern === '/tools/widgets/language') decorateLanguage(btn);
  if (pattern === '/tools/widgets/scheme') decorateScheme(btn);
  if (pattern === '/tools/widgets/toggle') decorateNavToggle(btn);
}

function decorateMenu() {
  // TODO: finish single menu support
  return null;
}

function decorateMegaMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

function decorateNavItem(li) {
  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');
  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!(menu || link)) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(li);
  });
}

function decorateBrandSection(section) {
  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  if (!brandLink) return;
  const textNode = brandLink.childNodes[1];
  if (textNode) {
    const span = document.createElement('span');
    span.className = 'brand-text';
    span.append(textNode);
    brandLink.append(span);
  }
}

function decorateNavSection(section) {
  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);
  navContent.append(nav);

  const mainNavItems = section.querySelectorAll('nav > ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem);
  }
}

function addHeaderActions(section) {
  const defaultContent = section.querySelector('.default-content');
  if (!defaultContent) return;
  const ul = defaultContent.querySelector('ul') || defaultContent;

  const actions = [
    { icon: 'search', label: 'Search', href: '#search' },
    { icon: 'cart', label: 'Cart', href: 'https://www.hp.com/us-en/shop/cart' },
    { icon: 'user', label: 'Sign In', href: '#sign-in' },
  ];

  const toggle = ul.querySelector('.action-wrapper.toggle');

  actions.forEach(({ icon, label, href }) => {
    if (ul.querySelector(`.action-wrapper.${icon}`)) return;
    const wrapper = document.createElement('div');
    wrapper.className = `action-wrapper ${icon}`;
    const btn = icon === 'cart'
      ? Object.assign(document.createElement('a'), { href, className: 'action-link' })
      : document.createElement('button');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `icon icon-${icon}`);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `/img/icons/${icon}.svg#${icon}`);
    svg.append(use);
    btn.append(svg);
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = label;
    btn.append(text);
    wrapper.append(btn);
    if (toggle) ul.insertBefore(wrapper, toggle);
    else ul.append(wrapper);
  });
}

async function decorateActionSection(section) {
  section.classList.add('actions-section');
  addHeaderActions(section);
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');

  if (sections.length >= 3) {
    // Standard 3-section fragment (brand, nav, actions)
    decorateBrandSection(sections[0]);
    decorateNavSection(sections[1]);
    decorateActionSection(sections[2]);
  } else if (sections.length === 1) {
    // Single-section DA fragment — split into brand, nav, actions
    const single = sections[0];
    const dc = single.querySelector('.default-content');
    if (!dc) return;

    // Brand: first p with a link/image
    const brandP = dc.querySelector(':scope > p:first-child');
    const brandSection = document.createElement('div');
    brandSection.className = 'section';
    const brandDC = document.createElement('div');
    brandDC.className = 'default-content';
    if (brandP) brandDC.append(brandP);
    brandSection.append(brandDC);

    // Nav: first ul with li items
    const navUl = dc.querySelector(':scope > ul');
    const navSection = document.createElement('div');
    navSection.className = 'section';
    const navDC = document.createElement('div');
    navDC.className = 'default-content';
    if (navUl) navDC.append(navUl);
    navSection.append(navDC);

    // Actions: remaining content (second ul or remaining elements)
    const actionsSection = document.createElement('div');
    actionsSection.className = 'section';
    const actionsDC = document.createElement('div');
    actionsDC.className = 'default-content';
    const remaining = dc.querySelector(':scope > ul');
    if (remaining) actionsDC.append(remaining);
    actionsSection.append(actionsDC);

    // Remove old single section content and replace with split sections
    single.remove();
    fragment.append(brandSection, navSection, actionsSection);

    decorateBrandSection(brandSection);
    decorateNavSection(navSection);
    decorateActionSection(actionsSection);
  }

  for (const pattern of HEADER_ACTIONS) {
    decorateAction(fragment, pattern);
  }
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
function buildFallbackHeader() {
  const fragment = document.createElement('div');
  fragment.classList.add('header-content');

  const brand = document.createElement('div');
  brand.className = 'section brand-section';
  brand.innerHTML = '<div class="default-content"><p><a href="/us-en/home"><span class="icon icon-hp-logo"></span><span class="brand-text">HP</span></a></p></div>';

  const nav = document.createElement('div');
  nav.className = 'section main-nav-section';
  const links = [
    ['Laptops', '/us-en/laptops-and-2-in-1s'],
    ['Desktops', '/us-en/desktops'],
    ['Printers', '/us-en/printers'],
    ['Accessories', '/us-en/shop/cat/accessories-88342--1'],
    ['Subscriptions', '/us-en/all-in-plan'],
    ['Business Solutions', '/us-en/business-solutions'],
    ['Support', 'https://support.hp.com/us-en'],
  ];
  nav.innerHTML = `<div class="default-content"><nav><ul class="main-nav-list">${links.map(([t, h]) => `<li class="main-nav-item"><p><a class="main-nav-link" href="${h}">${t}</a></p></li>`).join('')}</ul></nav></div>`;

  const actions = document.createElement('div');
  actions.className = 'section actions-section';
  actions.innerHTML = '<div class="default-content"><ul></ul></div>';

  fragment.append(brand, nav, actions);
  addHeaderActions(actions);

  return fragment;
}

export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(path);
    const hasContent = fragment && fragment.querySelector('.section');
    if (hasContent) {
      fragment.classList.add('header-content');
      await decorateHeader(fragment);
      el.append(fragment);
    } else {
      el.append(buildFallbackHeader());
    }
  } catch {
    el.append(buildFallbackHeader());
  }
}
