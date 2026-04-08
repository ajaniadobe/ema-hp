/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: HP.com pages.
 *
 * HP's DOM has card items as flat sibling elements (not nested):
 *   <img> <h3> <p> <a>  <img> <h3> <p> <a>  ...
 *
 * Strategy: find all h3 elements in the container, then for each h3
 * look backwards for its image and forwards for its description/CTA.
 * Group these into card rows: [image, [h3 + desc + cta]]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Collect all direct child nodes that are content
  const parent = element.parentElement || element;
  const allNodes = Array.from(parent.querySelectorAll(
    ':scope h3, :scope img, :scope p, :scope a[href]'
  ));

  // Find all h3 elements as card anchors
  const headings = Array.from(parent.querySelectorAll('h3'));

  if (headings.length === 0) {
    // Fallback: try children with images
    const items = element.querySelectorAll(
      ':scope > div, :scope > [class*="card"], :scope > [class*="tile"]'
    );
    items.forEach((item) => {
      const h = item.querySelector('h3, h2');
      if (!h) return;
      const img = item.querySelector('img');
      const desc = item.querySelector('p');
      const cta = item.querySelector('a[href]');
      const contentCell = [];
      if (h) contentCell.push(h);
      if (desc) contentCell.push(desc);
      if (cta && cta !== h.closest('a')) contentCell.push(cta);
      cells.push([img || document.createTextNode(''), contentCell]);
    });
  } else {
    // Group content by h3: for each h3, find preceding img
    // and following p/a elements until next h3 or img
    headings.forEach((h3, idx) => {
      let img = null;
      let desc = null;
      let datePara = null;
      let cta = null;

      // Look backwards from h3 for the nearest preceding img
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
        // Date paragraph (appears before h3 in news cards)
        if (prev.tagName === 'P' && !prev.querySelector('a')
            && !prev.querySelector('img')
            && prev.textContent.trim().length < 30) {
          datePara = prev;
        }
        prev = prev.previousElementSibling;
      }

      // Look forwards from h3 for description and CTA
      let next = h3.nextElementSibling;
      const forwardContent = [];
      while (next) {
        // Stop at the next h3 or an image paragraph (next card)
        if (next.tagName === 'H3') break;
        if (next.tagName === 'P' && next.querySelector('img')) break;
        if (next.tagName === 'IMG') break;

        if (next.tagName === 'P') {
          const link = next.querySelector('a[href]');
          if (link && next.children.length === 1) {
            cta = link;
          } else if (next.textContent.trim().length > 0) {
            forwardContent.push(next);
          }
        } else if (next.tagName === 'A') {
          cta = next;
        }
        next = next.nextElementSibling;
      }

      // Build card row
      const imgCell = img || document.createTextNode('');
      const contentCell = [];
      if (datePara) contentCell.push(datePara);
      contentCell.push(h3);
      forwardContent.forEach((p) => contentCell.push(p));
      if (cta) contentCell.push(cta);

      if (contentCell.length > 0) {
        cells.push([imgCell, contentCell]);
      }
    });
  }

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards',
    cells,
  });

  // Replace the entire parent section content, not just the element
  // since card items are siblings outside the matched element
  if (element !== parent) {
    element.replaceWith(block);
  } else {
    element.replaceWith(block);
  }
}
