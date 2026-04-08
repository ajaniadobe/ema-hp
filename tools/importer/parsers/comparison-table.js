/* eslint-disable */
/* global WebImporter */

/**
 * Parser for comparison-table block.
 * Extracts product comparison grids with images, model names,
 * spec rows, and CTAs.
 * Structure: N columns per row. Each column = one product.
 * First row = product headers (image + name). Subsequent rows = specs.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find product cards/columns in the comparison grid
  const products = element.querySelectorAll(
    ':scope > div, [class*="card"], [class*="column"], '
    + '[class*="product"], [class*="compare-item"]'
  );

  if (products.length < 2) {
    // Fallback: look for a table structure
    const rows = element.querySelectorAll('tr, :scope > div > div');
    if (rows.length > 0) {
      rows.forEach((row) => {
        const rowCells = row.querySelectorAll('td, :scope > div');
        const cellContents = [];
        rowCells.forEach((cell) => {
          cellContents.push(cell.cloneNode(true));
        });
        if (cellContents.length > 0) cells.push(cellContents);
      });
    }
  } else {
    // Build header row (images + titles)
    const headerRow = [];
    // Build spec rows by collecting all specs across products
    const specMap = new Map();

    products.forEach((prod, colIdx) => {
      const img = prod.querySelector('img');
      const title = prod.querySelector('h3, h4, [class*="title"]');
      const subtitle = prod.querySelector(
        '[class*="best-for"], [class*="subtitle"], p'
      );
      const cta = prod.querySelector('a[href]');

      // Header cell
      const headerCell = document.createElement('div');
      if (img) headerCell.appendChild(img.cloneNode(true));
      if (title) {
        const h = document.createElement('h3');
        h.textContent = title.textContent.trim();
        headerCell.appendChild(h);
      }
      if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle.textContent.trim();
        headerCell.appendChild(p);
      }
      headerRow.push(headerCell);

      // Specs
      const specs = prod.querySelectorAll(
        '[class*="spec"], [class*="feature"], li, dt, dd'
      );
      specs.forEach((spec, specIdx) => {
        if (!specMap.has(specIdx)) specMap.set(specIdx, []);
        const specCell = document.createElement('div');
        specCell.textContent = spec.textContent.trim();
        specMap.get(specIdx).push(specCell);
      });

      // CTA row
      if (cta) {
        const ctaKey = 'cta';
        if (!specMap.has(ctaKey)) specMap.set(ctaKey, []);
        specMap.get(ctaKey).push(cta.cloneNode(true));
      }
    });

    if (headerRow.length > 0) cells.push(headerRow);
    specMap.forEach((row) => {
      if (row.length > 0) cells.push(row);
    });
  }

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'comparison-table',
    cells,
  });
  element.replaceWith(block);
}
