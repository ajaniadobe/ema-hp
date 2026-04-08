/* eslint-disable */
/* global WebImporter */

import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';

import hpCleanupTransformer from './transformers/hp-cleanup.js';
import hpSectionsTransformer from './transformers/hp-sections.js';

const parsers = {
  cards: cardsParser,
  hero: heroParser,
};

const PAGE_TEMPLATE = {
  name: 'content-editorial',
  description: 'Content/editorial page with hero, content grids, recognition, timeline, products',
  urls: ['https://www.hp.com/us-en/sustainable-impact.html'],
  blocks: [
    { name: 'hero', instances: ['.root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type'] },
    { name: 'cards', instances: [
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(3) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(5) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-horizontal-scroll',
    ]},
  ],
  sections: [
    { id: 'section-hero', name: 'Hero', selector: '.root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'section-report', name: 'Read the Report', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(3)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-pillars', name: 'Sustainability Pillars', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4)', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'section-recognition', name: 'Recognition', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-history', name: 'History', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-products', name: 'Sustainable Products', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
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
      document.querySelectorAll(selector).forEach((element) => {
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
