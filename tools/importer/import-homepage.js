/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import hpCleanupTransformer from './transformers/hp-cleanup.js';
import hpSectionsTransformer from './transformers/hp-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel': carouselParser,
  'cards': cardsParser,
  'hero': heroParser,
  'columns': columnsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'HP homepage with hero carousel, product category tiles, featured products, editorial content cards, case studies, news articles, and support quick links',
  urls: [
    'https://www.hp.com/us-en/home.html',
  ],
  blocks: [
    {
      name: 'carousel',
      instances: [
        '.root.responsivegrid > .aem-Grid > .genericCarousel',
      ],
    },
    {
      name: 'cards',
      instances: [
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(2) .c-hp-bg-container',
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4) .c-hp-bg-container',
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .c-hp-grid',
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-hp-grid',
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(13) .c-hp-bg-container',
      ],
    },
    {
      name: 'hero',
      instances: [
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6) .c-hp-bg-container',
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8) .c-hp-bg-container',
      ],
    },
    {
      name: 'columns',
      instances: [
        '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7) .c-hp-grid',
      ],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Carousel',
      selector: '.root.responsivegrid > .aem-Grid > .genericCarousel',
      style: null,
      blocks: ['carousel'],
      defaultContent: [],
    },
    {
      id: 'section-products',
      name: 'Our Products',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(2)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-must-haves',
      name: 'Shop These Must Haves',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-wri',
      name: 'Work Relationship Index',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6)',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-it-platform',
      name: 'IT Platform',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7)',
      style: 'shaded',
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-space',
      name: 'Space Article',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8)',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-case-studies',
      name: 'Customer Case Studies',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-news',
      name: 'Latest from HP',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-support',
      name: 'Support Quick Links',
      selector: '.root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(13)',
      style: 'dark',
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  hpCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [hpSectionsTransformer]
    : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page using template selectors
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover and parse blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Parser failed for ${block.name}:`, e);
        }
      }
    });

    // 3. Execute afterTransform (sections, final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '')
        .replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
