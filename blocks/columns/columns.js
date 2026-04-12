function decorateCover(col) {
  const children = [...col.children];
  if (children.length === 1 && children[0].nodeName === 'PICTURE') {
    col.classList.add('cover-image');
    col.parentElement.classList.add('cover-row');
  } else {
    col.classList.add('cover-content');
  }
}

function decorateCols(el, cols) {
  const hasCover = el.classList.contains('image-cover');
  for (const [idx, col] of cols.entries()) {
    col.classList.add('col', `col-${idx + 1}`);
    if (hasCover) decorateCover(col);
  }
}

function decorateRows(el, rows) {
  for (const [idx, row] of rows.entries()) {
    row.classList.add('row', `row-${idx + 1}`);
    const cols = [...row.children];
    row.style = `--child-count: ${cols.length}`;
    decorateCols(el, cols);
  }
}

function isMediaWrapper(el, rows) {
  if (rows.length !== 1) return false;
  const cols = [...rows[0].children];
  if (cols.length !== 2) return false;
  const firstCol = cols[0];
  const secondCol = cols[1];
  const hasOnlyImage = firstCol.children.length === 1 && firstCol.querySelector('picture');
  const hasHeading = secondCol.querySelector('h2');
  const hasCTA = secondCol.querySelector('a');
  return hasOnlyImage && hasHeading && hasCTA;
}

export default function init(el) {
  const rows = [...el.children];
  if (!el.classList.contains('image-cover') && isMediaWrapper(el, rows)) {
    el.classList.add('media-wrapper');
  }
  decorateRows(el, rows);
}
