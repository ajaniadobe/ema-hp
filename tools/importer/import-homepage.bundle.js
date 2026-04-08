var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(
      '[class*="slide"]:not([class*="clone"]):not([class*="duplicate"])'
    );
    const seen = /* @__PURE__ */ new Set();
    const uniqueSlides = [];
    slides.forEach((slide) => {
      const h2 = slide.querySelector("h2");
      if (!h2) return;
      const key = h2.textContent.trim();
      if (seen.has(key)) return;
      seen.add(key);
      uniqueSlides.push(slide);
    });
    uniqueSlides.forEach((slide) => {
      const imgs = Array.from(slide.querySelectorAll("img"));
      const bgImg = imgs.reduce((best, img) => {
        const w = img.naturalWidth || img.width || 0;
        return w > ((best == null ? void 0 : best.naturalWidth) || (best == null ? void 0 : best.width) || 0) ? img : best;
      }, imgs[0]);
      const heading = slide.querySelector("h2");
      const subheading = slide.querySelector("h3");
      const para = slide.querySelector("p:not(:empty)");
      const ctas = Array.from(
        slide.querySelectorAll('a[href]:not([href="#"])')
      ).filter((a) => a.textContent.trim().length > 0);
      const imgCell = bgImg ? bgImg : document.createTextNode("");
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (subheading) contentCell.push(subheading);
      if (para && para.textContent.trim()) contentCell.push(para);
      contentCell.push(...ctas);
      if (contentCell.length > 0) {
        cells.push([imgCell, contentCell]);
      }
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(
      ':scope > [class*="grid"] > [class*="column"], :scope > [class*="grid"] > [class*="item"], :scope [class*="card"], :scope [class*="tile"], :scope > [class*="container"] > div > div'
    );
    const cardItems = items.length > 0 ? items : element.querySelectorAll(":scope > div > div");
    cardItems.forEach((item) => {
      const heading = item.querySelector("h3, h2");
      if (!heading) return;
      const img = item.querySelector("img");
      const paragraphs = Array.from(item.querySelectorAll("p"));
      const datePara = paragraphs.find(
        (p) => /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i.test(p.textContent.trim())
      );
      const descParas = paragraphs.filter(
        (p) => p !== datePara && p.textContent.trim().length > 10 && !p.querySelector("img") && !p.querySelector("strong")
      );
      const cta = item.querySelector(
        'a[class*="button"], a[class*="cta"], a[href]'
      );
      const imgCell = img || document.createTextNode("");
      const contentCell = [];
      if (datePara) contentCell.push(datePara);
      if (heading) contentCell.push(heading);
      descParas.forEach((p) => contentCell.push(p));
      if (cta && cta !== heading.closest("a")) contentCell.push(cta);
      if (contentCell.length > 0) {
        cells.push([imgCell, contentCell]);
      }
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero.js
  function parse3(element, { document }) {
    const imgs = Array.from(element.querySelectorAll("img"));
    const bgImg = imgs.reduce((best, img) => {
      const w = img.naturalWidth || img.width || 0;
      return w > ((best == null ? void 0 : best.naturalWidth) || (best == null ? void 0 : best.width) || 0) ? img : best;
    }, imgs[0]);
    const eyebrow = element.querySelector(
      "p:not(:empty):not(:has(a)):not(:has(img))"
    );
    const heading = element.querySelector("h2");
    const subheading = element.querySelector("h3");
    const ctas = Array.from(
      element.querySelectorAll('a[href]:not([href="#"])')
    ).filter((a) => a.textContent.trim().length > 0);
    const cells = [];
    if (bgImg) {
      cells.push([bgImg]);
    }
    const contentCell = [];
    if (eyebrow && eyebrow !== heading && eyebrow.textContent.trim().length > 2) {
      contentCell.push(eyebrow);
    }
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctas);
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse4(element, { document }) {
    const gridItems = element.querySelectorAll(
      ':scope > [class*="grid"] > [class*="column"], :scope > [class*="grid"] > div, :scope > div'
    );
    let imgCol = null;
    let textCol = null;
    Array.from(gridItems).forEach((item) => {
      const hasImg = item.querySelector("img");
      const hasHeading = item.querySelector("h2, h3");
      if (hasImg && !hasHeading) {
        imgCol = item;
      } else if (hasHeading) {
        textCol = item;
      }
    });
    if (!imgCol && !textCol && gridItems.length >= 2) {
      imgCol = gridItems[0];
      textCol = gridItems[1];
    }
    const cells = [];
    const img = imgCol ? imgCol.querySelector("img") : null;
    const col1 = img || document.createTextNode("");
    const col2 = [];
    if (textCol) {
      const heading = textCol.querySelector("h2");
      const subheading = textCol.querySelector("h3");
      const ctas = Array.from(
        textCol.querySelectorAll('a[href]:not([href="#"])')
      ).filter((a) => a.textContent.trim().length > 0);
      if (heading) col2.push(heading);
      if (subheading) col2.push(subheading);
      col2.push(...ctas);
    }
    if (col2.length === 0) return;
    cells.push([col1, col2]);
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/hp-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="cookie"]',
        '[class*="privacy-banner"]',
        ".c-hp-modal",
        ".modal",
        '[class*="overlay"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "noscript"
      ]);
      element.querySelectorAll('a[href*="jumpid="]').forEach((a) => {
        try {
          const url = new URL(a.href);
          url.searchParams.delete("jumpid");
          a.href = url.toString();
        } catch (e) {
        }
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "#header",
        "footer",
        "#footer",
        '[class*="skip-link"]',
        '[class*="skip-to"]',
        ".c-hp-global-header",
        ".c-hp-global-footer",
        "#countryselector",
        '[class*="footer-sections"]',
        "nav"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".sign-in-section",
        '[class*="sign-in"]',
        '[class*="related-links"]',
        "iframe",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("data-analytics");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/hp-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== H2.after) return;
    const { template } = payload || {};
    if (!template || !template.sections || template.sections.length < 2) return;
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const doc = document || element.ownerDocument;
    const sections = template.sections;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel": parse,
    "cards": parse2,
    "hero": parse3,
    "columns": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "HP homepage with hero carousel, product category tiles, featured products, editorial content cards, case studies, news articles, and support quick links",
    urls: [
      "https://www.hp.com/us-en/home.html"
    ],
    blocks: [
      {
        name: "carousel",
        instances: [
          ".root.responsivegrid > .aem-Grid > .genericCarousel"
        ]
      },
      {
        name: "cards",
        instances: [
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(2) .c-hp-bg-container",
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4) .c-hp-bg-container",
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .c-hp-grid",
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-hp-grid",
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(13) .c-hp-bg-container"
        ]
      },
      {
        name: "hero",
        instances: [
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6) .c-hp-bg-container",
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8) .c-hp-bg-container"
        ]
      },
      {
        name: "columns",
        instances: [
          ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7) .c-hp-grid"
        ]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero Carousel",
        selector: ".root.responsivegrid > .aem-Grid > .genericCarousel",
        style: null,
        blocks: ["carousel"],
        defaultContent: []
      },
      {
        id: "section-products",
        name: "Our Products",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(2)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-must-haves",
        name: "Shop These Must Haves",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-wri",
        name: "Work Relationship Index",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6)",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-it-platform",
        name: "IT Platform",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7)",
        style: "shaded",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-space",
        name: "Space Article",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8)",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-case-studies",
        name: "Customer Case Studies",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-news",
        name: "Latest from HP",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-support",
        name: "Support Quick Links",
        selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(13)",
        style: "dark",
        blocks: ["cards"],
        defaultContent: ["h2"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
