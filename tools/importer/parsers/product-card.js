/* eslint-disable */
/* global WebImporter */

/**
 * Parser for product-card block.
 * Extracts product tiles with image, title, description, spec list, CTA.
 * Used for HP's "Must Have" and product recommendation sections.
 * Structure: 2 columns per row. Col1: product image, Col2: title + desc + specs + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find h3 elements as card anchors (same pattern as cards parser)
  const headings = Array.from(element.querySelectorAll('h3'));

  headings.forEach((h3) => {
    let img = null;
    let desc = null;
    let cta = null;
    const specs = [];

    // Look backwards for image
    let prev = h3.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && prev.querySelector('img')) {
        img = prev.querySelector('img');
        break;
      }
      if (prev.tagName === 'IMG') {
        img = prev;
        break;
      }
      prev = prev.previousElementSibling;
    }

    // Look forwards for description, specs, CTA
    let next = h3.nextElementSibling;
    while (next) {
      if (next.tagName === 'H3' || (next.tagName === 'P' && next.querySelector('img'))) break;
      if (next.tagName === 'IMG') break;

      if (next.tagName === 'UL') {
        next.querySelectorAll('li').forEach((li) => specs.push(li.textContent.trim()));
      } else if (next.tagName === 'P') {
        const link = next.querySelector('a[href]');
        if (link && next.children.length === 1) {
          cta = link;
        } else if (next.textContent.trim().length > 5) {
          desc = next;
        }
      } else if (next.tagName === 'A') {
        cta = next;
      }
      next = next.nextElementSibling;
    }

    const imgCell = img || document.createTextNode('');
    const contentCell = [];
    contentCell.push(h3);
    if (desc) contentCell.push(desc);
    if (specs.length > 0) {
      const ul = document.createElement('ul');
      specs.forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      contentCell.push(ul);
    }
    if (cta) contentCell.push(cta);

    cells.push([imgCell, contentCell]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'product-card',
    cells,
  });
  element.replaceWith(block);
}
