/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.hp.com/us-en/home.html
 * Structure: 2 columns per row. Col1: image/icon, Col2: title + desc + CTA
 * Handles 5 use cases: category tiles, product cards, case studies, news, support
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find card-like items: grid children, tile items, or repeated structures
  const items = element.querySelectorAll(
    ':scope > [class*="grid"] > [class*="column"], '
    + ':scope > [class*="grid"] > [class*="item"], '
    + ':scope [class*="card"], '
    + ':scope [class*="tile"], '
    + ':scope > [class*="container"] > div > div'
  );

  // Fallback: direct children that contain headings
  const cardItems = items.length > 0
    ? items
    : element.querySelectorAll(':scope > div > div');

  cardItems.forEach((item) => {
    const heading = item.querySelector('h3, h2');
    if (!heading) return;

    // Image (first meaningful img in card)
    const img = item.querySelector('img');

    // Description paragraph (not date-like)
    const paragraphs = Array.from(item.querySelectorAll('p'));
    const datePara = paragraphs.find(
      (p) => /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i.test(p.textContent.trim())
    );
    const descParas = paragraphs.filter(
      (p) => p !== datePara
        && p.textContent.trim().length > 10
        && !p.querySelector('img')
        && !p.querySelector('strong')
    );

    // CTA link
    const cta = item.querySelector(
      'a[class*="button"], a[class*="cta"], a[href]'
    );

    // Build image cell
    const imgCell = img || document.createTextNode('');

    // Build content cell
    const contentCell = [];
    if (datePara) contentCell.push(datePara);
    if (heading) contentCell.push(heading);
    descParas.forEach((p) => contentCell.push(p));
    if (cta && cta !== heading.closest('a')) contentCell.push(cta);

    if (contentCell.length > 0) {
      cells.push([imgCell, contentCell]);
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards',
    cells,
  });
  element.replaceWith(block);
}
