/* eslint-disable */
/* global WebImporter */

import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import accordionParser from './parsers/accordion.js';

import hpCleanupTransformer from './transformers/hp-cleanup.js';
import hpSectionsTransformer from './transformers/hp-sections.js';

const parsers = {
  cards: cardsParser,
  hero: heroParser,
  columns: columnsParser,
  accordion: accordionParser,
};

const PAGE_TEMPLATE = {
  name: 'product-marketing',
  description: 'Product marketing page with video hero, benefits, comparison, features, sustainability, support, FAQ',
  urls: ['https://www.hp.com/us-en/printers/smart-tank.html'],
  blocks: [
    { name: 'hero', instances: ['.root.responsivegrid > .aem-Grid > .heroBanner'] },
    { name: 'cards', instances: [
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4) .c-hp-bg-container',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6) .c-hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7) .c-hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-hp-grid',
    ]},
    { name: 'columns', instances: ['.root.responsivegrid > .aem-Grid > .mediaContent'] },
    { name: 'accordion', instances: ['.root.responsivegrid > .aem-Grid > .collapsibleSection'] },
  ],
  sections: [
    { id: 'section-hero', name: 'Hero Banner', selector: '.root.responsivegrid > .aem-Grid > .heroBanner', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'section-benefits', name: 'Benefits', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-compare', name: 'Compare Printers', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-more', name: 'More Printers', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-sustainability', name: 'Sustainability', selector: '.root.responsivegrid > .aem-Grid > .mediaContent', style: null, blocks: ['columns'], defaultContent: ['h2'] },
    { id: 'section-support', name: 'Support', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-faq', name: 'FAQ', selector: '.root.responsivegrid > .aem-Grid > .collapsibleSection:first-of-type', style: null, blocks: ['accordion'], defaultContent: ['h2'] },
  ],
};

const transformers = [
  hpCleanupTransformer,
  ...(PAGE_TEMPLATE.sections.length > 1 ? [hpSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhanced = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhanced); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Parser failed: ${block.name}`, e); }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{ element: main, path, report: {
      title: document.title,
      template: PAGE_TEMPLATE.name,
      blocks: pageBlocks.map((b) => b.name),
    }}];
  },
};
