/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: HP section breaks and section-metadata.
 * Runs afterTransform only. Uses payload.template.sections
 * from page-templates.json.
 */
const H = { after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== H.after) return;

  const { template } = payload || {};
  if (!template || !template.sections || template.sections.length < 2) return;

  const { document } = element.ownerDocument
    ? { document: element.ownerDocument }
    : { document: element.getRootNode() };

  const doc = document || element.ownerDocument;
  const sections = template.sections;

  // Process sections in reverse order to preserve DOM positions
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const selectors = Array.isArray(section.selector)
      ? section.selector
      : [section.selector];

    let sectionEl = null;
    for (const sel of selectors) {
      sectionEl = element.querySelector(sel);
      if (sectionEl) break;
    }

    if (!sectionEl) continue;

    // Add section-metadata block if section has a style
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Add section break (hr) before non-first sections
    if (i > 0) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
