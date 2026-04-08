/* eslint-disable */
/* global WebImporter */

/**
 * Parser for icon-grid block.
 * Extracts category tiles with image + title + link.
 * Used for HP's "Our Products" and "How can we help?" sections.
 * Structure: 2 columns per row. Col1: icon/image, Col2: title + link
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find h3 elements as tile anchors
  const headings = Array.from(element.querySelectorAll('h3'));

  headings.forEach((h3) => {
    let img = null;
    let link = null;

    // Look backwards for image (usually in a linked paragraph)
    let prev = h3.previousElementSibling;
    while (prev) {
      if (prev.querySelector('img')) {
        img = prev.querySelector('img');
        break;
      }
      prev = prev.previousElementSibling;
    }

    // Look forwards for link
    let next = h3.nextElementSibling;
    while (next) {
      if (next.tagName === 'H3' || next.querySelector('img')) break;
      const a = next.querySelector('a[href]') || (next.tagName === 'A' ? next : null);
      if (a) {
        link = a;
        break;
      }
      next = next.nextElementSibling;
    }

    // Also check if h3 itself or its parent is linked
    if (!link) {
      const parentLink = h3.closest('a');
      if (parentLink) link = parentLink;
    }

    // Also check backward links (image link often is the CTA)
    if (!link && img) {
      const imgLink = img.closest('a');
      if (imgLink) link = imgLink;
    }

    const imgCell = img || document.createTextNode('');
    const contentCell = [];
    contentCell.push(h3);
    if (link) contentCell.push(link);

    cells.push([imgCell, contentCell]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'icon-grid',
    cells,
  });
  element.replaceWith(block);
}
