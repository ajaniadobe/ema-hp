export default function init(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'comparison-table-wrapper';

  const table = document.createElement('div');
  table.className = 'comparison-table-grid';

  // First row defines column count (header row with product names)
  const headerRow = rows[0];
  const colCount = headerRow.children.length;
  table.style.setProperty('--col-count', colCount);

  rows.forEach((row, rowIdx) => {
    const cells = [...row.children];
    const rowEl = document.createElement('div');
    rowEl.className = rowIdx === 0
      ? 'comparison-table-row comparison-table-header'
      : 'comparison-table-row';

    cells.forEach((cell) => {
      const cellEl = document.createElement('div');
      cellEl.className = 'comparison-table-cell';

      // Move all content
      while (cell.firstChild) cellEl.append(cell.firstChild);

      // Style images in header
      if (rowIdx === 0) {
        const img = cellEl.querySelector('img');
        if (img) img.className = 'comparison-table-product-img';
      }

      rowEl.append(cellEl);
    });

    table.append(rowEl);
  });

  wrapper.append(table);
  block.textContent = '';
  block.append(wrapper);
}
