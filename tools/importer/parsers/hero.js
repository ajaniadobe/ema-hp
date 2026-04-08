/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.hp.com/us-en/home.html
 * Structure: 1 column, row 1: background image, row 2: heading + subheading + CTA
 * Used for: WRI featured content, Space workplace article
 */
export default function parse(element, { document }) {
  // Background image (largest img)
  const imgs = Array.from(element.querySelectorAll('img'));
  const bgImg = imgs.reduce((best, img) => {
    const w = img.naturalWidth || img.width || 0;
    return w > (best?.naturalWidth || best?.width || 0) ? img : best;
  }, imgs[0]);

  // Text content
  const eyebrow = element.querySelector(
    'p:not(:empty):not(:has(a)):not(:has(img))'
  );
  const heading = element.querySelector('h2');
  const subheading = element.querySelector('h3');
  const ctas = Array.from(
    element.querySelectorAll('a[href]:not([href="#"])')
  ).filter((a) => a.textContent.trim().length > 0);

  const cells = [];

  // Row 1: background image
  if (bgImg) {
    cells.push([bgImg]);
  }

  // Row 2: text content
  const contentCell = [];
  if (eyebrow && eyebrow !== heading && eyebrow.textContent.trim().length > 2) {
    contentCell.push(eyebrow);
  }
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctas);

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero',
    cells,
  });
  element.replaceWith(block);
}
