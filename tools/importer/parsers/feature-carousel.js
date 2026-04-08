/* eslint-disable */
/* global WebImporter */

/**
 * Parser for feature-carousel block.
 * Extracts numbered feature panels with image + text.
 * Used for HP's "Explore Features" sections on marketing pages.
 * Structure: 2 columns per row. Col1: feature image, Col2: title + description
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find feature items — numbered panels, slides, or card-like children
  const items = element.querySelectorAll(
    ':scope > div, [class*="feature"], [class*="slide"], '
    + '[class*="panel"], [class*="item"]'
  );

  const candidates = items.length > 1 ? items
    : element.querySelectorAll(':scope > * > div');

  candidates.forEach((item) => {
    const img = item.querySelector('img');
    const heading = item.querySelector('h3, h4, [class*="title"]');
    const desc = item.querySelector('p, [class*="desc"]');

    if (!heading && !img) return;

    const imgCell = img ? img.cloneNode(true) : document.createTextNode('');
    const contentCell = [];
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      contentCell.push(p);
    }

    if (contentCell.length > 0) {
      cells.push([imgCell, contentCell]);
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'feature-carousel',
    cells,
  });
  element.replaceWith(block);
}
