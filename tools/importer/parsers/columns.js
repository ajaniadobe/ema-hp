/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.hp.com/us-en/home.html
 * Structure: 2 columns per row. Col1: image, Col2: heading + subheading + CTAs
 * Used for: IT platform demo section (image left, text right)
 */
export default function parse(element, { document }) {
  // Find the two main content areas (grid children)
  const gridItems = element.querySelectorAll(
    ':scope > [class*="grid"] > [class*="column"], '
    + ':scope > [class*="grid"] > div, '
    + ':scope > div'
  );

  // Identify image column and text column
  let imgCol = null;
  let textCol = null;

  Array.from(gridItems).forEach((item) => {
    const hasImg = item.querySelector('img');
    const hasHeading = item.querySelector('h2, h3');
    if (hasImg && !hasHeading) {
      imgCol = item;
    } else if (hasHeading) {
      textCol = item;
    }
  });

  // Fallback: first child is image, second is text
  if (!imgCol && !textCol && gridItems.length >= 2) {
    imgCol = gridItems[0];
    textCol = gridItems[1];
  }

  const cells = [];

  // Build column 1: image
  const img = imgCol ? imgCol.querySelector('img') : null;
  const col1 = img || document.createTextNode('');

  // Build column 2: text content
  const col2 = [];
  if (textCol) {
    const heading = textCol.querySelector('h2');
    const subheading = textCol.querySelector('h3');
    const ctas = Array.from(
      textCol.querySelectorAll('a[href]:not([href="#"])')
    ).filter((a) => a.textContent.trim().length > 0);

    if (heading) col2.push(heading);
    if (subheading) col2.push(subheading);
    col2.push(...ctas);
  }

  if (col2.length === 0) return;

  cells.push([col1, col2]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns',
    cells,
  });
  element.replaceWith(block);
}
