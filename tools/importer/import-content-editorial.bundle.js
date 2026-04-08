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

  // tools/importer/import-content-editorial.js
  var import_content_editorial_exports = {};
  __export(import_content_editorial_exports, {
    default: () => import_content_editorial_default
  });

  // tools/importer/parsers/cards.js
  function parse(element, { document }) {
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
  function parse2(element, { document }) {
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

  // tools/importer/import-content-editorial.js
  var parsers = {
    cards: parse,
    hero: parse2
  };
  var PAGE_TEMPLATE = {
    name: "content-editorial",
    description: "Content/editorial page with hero, content grids, recognition, timeline, products",
    urls: ["https://www.hp.com/us-en/sustainable-impact.html"],
    blocks: [
      { name: "hero", instances: [".root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type"] },
      { name: "cards", instances: [
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(3) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(5) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(8) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-horizontal-scroll"
      ] }
    ],
    sections: [
      { id: "section-hero", name: "Hero", selector: ".root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type", style: null, blocks: ["hero"], defaultContent: [] },
      { id: "section-report", name: "Read the Report", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(3)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-pillars", name: "Sustainability Pillars", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(4)", style: null, blocks: ["cards"], defaultContent: [] },
      { id: "section-recognition", name: "Recognition", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(7)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-history", name: "History", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-products", name: "Sustainable Products", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)", style: null, blocks: ["cards"], defaultContent: ["h2"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhanced = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhanced);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_content_editorial_default = {
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
            console.error(`Parser failed: ${block.name}`, e);
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
      return [{ element: main, path, report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name)
      } }];
    }
  };
  return __toCommonJS(import_content_editorial_exports);
})();
