/* eslint-disable */
/* global WebImporter */

import carouselParser from './parsers/carousel.js';
import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';
import accordionParser from './parsers/accordion.js';

import hpCleanupTransformer from './transformers/hp-cleanup.js';
import hpSectionsTransformer from './transformers/hp-sections.js';

const parsers = {
  carousel: carouselParser,
  cards: cardsParser,
  hero: heroParser,
  accordion: accordionParser,
};

const PAGE_TEMPLATE = {
  name: 'category-landing',
  description: 'Category landing page with hero, featured products, carousel, use-case cards, comparison grid, and FAQ',
  urls: ['https://www.hp.com/us-en/laptops-and-2-in-1s.html'],
  blocks: [
    { name: 'hero', instances: ['.root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type'] },
    { name: 'cards', instances: [
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6) .c-bg-container',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .c-hp-grid',
      '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-compare-feature',
    ]},
    { name: 'carousel', instances: ['.root.responsivegrid > .aem-Grid > .genericcarousel'] },
    { name: 'accordion', instances: ['.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(12)'] },
  ],
  sections: [
    { id: 'section-hero', name: 'Hero', selector: '.root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'section-featured', name: 'Featured AI PCs', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-carousel', name: 'Product Carousel', selector: '.root.responsivegrid > .aem-Grid > .genericcarousel', style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 'section-use-cases', name: 'Choose Your Laptop', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-compare', name: 'Explore All Laptops', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)', style: null, blocks: ['cards'], defaultContent: ['h2'] },
    { id: 'section-faq', name: 'FAQ', selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(12)', style: null, blocks: ['accordion'], defaultContent: ['h2'] },
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
