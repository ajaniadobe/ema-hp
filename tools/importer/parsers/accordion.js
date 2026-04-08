/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Base: accordion. Source: HP category/product pages.
 * Structure: 2 columns per row. Col1: question/label, Col2: answer/content
 * Handles: FAQ sections, collapsible sections, disclaimers
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find accordion items — collapsible sections or details elements
  const items = element.querySelectorAll(
    '[class*="collapsible"], [class*="accordion"], details, '
    + '[class*="faq-item"], [class*="question"]'
  );

  // Fallback: look for paired heading + content patterns
  const faqItems = items.length > 0
    ? items
    : element.querySelectorAll(':scope > div');

  faqItems.forEach((item) => {
    // Find the question/label
    const label = item.querySelector(
      'h2, h3, h4, summary, [class*="title"], '
      + '[class*="header"], [class*="question"], button'
    );

    // Find the answer/content
    const content = item.querySelector(
      '[class*="content"], [class*="body"], '
      + '[class*="answer"], [class*="panel"]'
    );

    if (!label) return;

    const labelText = label.cloneNode(true);
    const contentEl = content
      ? content.cloneNode(true)
      : document.createTextNode('');

    cells.push([labelText, contentEl]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion',
    cells,
  });
  element.replaceWith(block);
}
