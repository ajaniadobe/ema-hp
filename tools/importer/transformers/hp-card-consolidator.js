/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: HP card item consolidation.
 * Runs beforeTransform to move flat sibling card items
 * (img, h3, p, a) into their container elements
 * so the cards parser can find them.
 *
 * HP renders card sections as flat siblings:
 *   <container>  ← parser matches this
 *   <p><img></p> ← card 1 image (sibling!)
 *   <h3>Title</h3>
 *   <p>Desc</p>
 *   <p><a>CTA</a></p>
 *   <p><img></p> ← card 2 image
 *   <h3>Title</h3>
 *   ...
 *
 * This transformer moves the siblings into the container.
 */
const H = {
  before: 'beforeTransform',
  after: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== H.before) return;

  // Find sections that have both a cards-like heading container
  // and sibling h3 elements (card items outside the container)
  const root = element.querySelector('.root.responsivegrid')
    || element.querySelector('[class*="responsivegrid"]')
    || element;

  const gridCols = root.querySelectorAll(
    '.aem-Grid > .aem-GridColumn'
  );

  gridCols.forEach((col) => {
    // Find all h3 elements in this column
    const h3s = col.querySelectorAll('h3');
    if (h3s.length < 2) return;

    // Check if h3s are direct children or shallow descendants
    // (not deeply nested in a single component)
    const directH3s = Array.from(h3s).filter((h3) => {
      const depth = getDepth(h3, col);
      return depth <= 4;
    });

    if (directH3s.length < 2) return;

    // Find the section heading (h2) container — this is
    // where the cards block name lives
    const h2 = col.querySelector('h2');
    if (!h2) return;

    // Create a wrapper div for all card items
    const wrapper = element.ownerDocument.createElement('div');
    wrapper.setAttribute('data-cards-wrapper', 'true');

    // Collect all siblings after the h2's container
    // that look like card content
    const h2Container = h2.closest(
      '[class*="title"], [class*="heading"]'
    ) || h2.parentElement;

    let sibling = h2Container.nextElementSibling;
    const toMove = [];

    while (sibling) {
      const next = sibling.nextElementSibling;
      toMove.push(sibling);
      sibling = next;
    }

    if (toMove.length > 0) {
      toMove.forEach((el) => wrapper.appendChild(el));
      h2Container.after(wrapper);
    }
  });
}

function getDepth(child, ancestor) {
  let depth = 0;
  let current = child;
  while (current && current !== ancestor) {
    depth++;
    current = current.parentElement;
  }
  return depth;
}
