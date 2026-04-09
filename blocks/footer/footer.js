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
export default async function init(el) {
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(path);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];

    const copyright = sections.pop();
    copyright.classList.add('section-copyright');

    const legal = sections.pop();
    legal.classList.add('section-legal');

    // Restructure the main links section into a column grid
    if (sections.length > 0) {
      sections[0].classList.add('section-links');
      decorateLinks(sections[0]);
    }

    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
