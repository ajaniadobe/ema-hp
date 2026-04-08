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

  // tools/importer/import-category-landing.js
  var import_category_landing_exports = {};
  __export(import_category_landing_exports, {
    default: () => import_category_landing_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document }) {
    const cells = [];
    const allSlides = element.querySelectorAll(
      '[class*="slide"]:not([class*="clone"]):not([class*="duplicate"])'
    );
    const seen = /* @__PURE__ */ new Set();
    const slides = [];
    allSlides.forEach((slide) => {
      const h2 = slide.querySelector("h2");
      if (!h2) return;
      const key = h2.textContent.trim();
      if (seen.has(key)) return;
      seen.add(key);
      slides.push(slide);
    });
    slides.forEach((slide) => {
      const imgs = Array.from(slide.querySelectorAll("img"));
      const bgImg = imgs.find((img) => {
        const w = parseInt(img.getAttribute("width"), 10) || 0;
        return w > 400 || img.className.includes("bg") || img.closest('[class*="image"]');
      }) || imgs[imgs.length - 1];
      const heading = slide.querySelector("h2");
      const subheading = slide.querySelector("h3");
      const desc = slide.querySelector("p:not(:empty)");
      const seenHrefs = /* @__PURE__ */ new Set();
      const ctas = [];
      slide.querySelectorAll('a[href]:not([href="#"])').forEach((a) => {
        if (a.textContent.trim().length === 0) return;
        const href = a.getAttribute("href");
        if (seenHrefs.has(href)) return;
        seenHrefs.add(href);
        ctas.push(a);
      });
      const imgCell = bgImg || document.createTextNode("");
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (subheading) contentCell.push(subheading);
      if (desc && desc.textContent.trim().length > 5) {
        contentCell.push(desc);
      }
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
    const parent = element.parentElement || element;
    const allNodes = Array.from(parent.querySelectorAll(
      ":scope h3, :scope img, :scope p, :scope a[href]"
    ));
    const headings = Array.from(parent.querySelectorAll("h3"));
    if (headings.length === 0) {
      const items = element.querySelectorAll(
        ':scope > div, :scope > [class*="card"], :scope > [class*="tile"]'
      );
      items.forEach((item) => {
        const h = item.querySelector("h3, h2");
        if (!h) return;
        const img = item.querySelector("img");
        const desc = item.querySelector("p");
        const cta = item.querySelector("a[href]");
        const contentCell = [];
        if (h) contentCell.push(h);
        if (desc) contentCell.push(desc);
        if (cta && cta !== h.closest("a")) contentCell.push(cta);
        cells.push([img || document.createTextNode(""), contentCell]);
      });
    } else {
      headings.forEach((h3, idx) => {
        let img = null;
        let desc = null;
        let datePara = null;
        let cta = null;
        let prev = h3.previousElementSibling;
        while (prev) {
          if (prev.tagName === "P" && prev.querySelector("img")) {
            img = prev.querySelector("img");
            break;
          }
          if (prev.tagName === "IMG") {
            img = prev;
            break;
          }
          if (prev.tagName === "P" && !prev.querySelector("a") && !prev.querySelector("img") && prev.textContent.trim().length < 30) {
            datePara = prev;
          }
          prev = prev.previousElementSibling;
        }
        let next = h3.nextElementSibling;
        const forwardContent = [];
        while (next) {
          if (next.tagName === "H3") break;
          if (next.tagName === "P" && next.querySelector("img")) break;
          if (next.tagName === "IMG") break;
          if (next.tagName === "P") {
            const link = next.querySelector("a[href]");
            if (link && next.children.length === 1) {
              cta = link;
            } else if (next.textContent.trim().length > 0) {
              forwardContent.push(next);
            }
          } else if (next.tagName === "A") {
            cta = next;
          }
          next = next.nextElementSibling;
        }
        const imgCell = img || document.createTextNode("");
        const contentCell = [];
        if (datePara) contentCell.push(datePara);
        contentCell.push(h3);
        forwardContent.forEach((p) => contentCell.push(p));
        if (cta) contentCell.push(cta);
        if (contentCell.length > 0) {
          cells.push([imgCell, contentCell]);
        }
      });
    }
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards",
      cells
    });
    if (element !== parent) {
      element.replaceWith(block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/hero.js
  function parse3(element, { document }) {
    var _a;
    const imgs = Array.from(element.querySelectorAll("img"));
    const bgImg = imgs.find((img) => {
      const src = img.getAttribute("src") || "";
      return src.includes("banner") || src.includes("hero") || img.closest('[class*="image"]') || img.closest('[class*="background"]');
    }) || imgs.reduce((best, img) => {
      const w = parseInt(img.getAttribute("width"), 10) || img.naturalWidth || 0;
      const bw = parseInt(best == null ? void 0 : best.getAttribute("width"), 10) || (best == null ? void 0 : best.naturalWidth) || 0;
      return w > bw ? img : best;
    }, imgs[0]);
    const video = element.querySelector("video source, video");
    const videoSrc = (video == null ? void 0 : video.getAttribute("src")) || ((_a = video == null ? void 0 : video.querySelector("source")) == null ? void 0 : _a.getAttribute("src"));
    const allParas = Array.from(element.querySelectorAll("p"));
    const eyebrow = allParas.find(
      (p) => !p.querySelector("a") && !p.querySelector("img") && p.textContent.trim().length > 2 && p.textContent.trim().length < 60
    );
    const heading = element.querySelector("h2, h1");
    const subheading = element.querySelector("h3");
    const seenHrefs = /* @__PURE__ */ new Set();
    const ctas = [];
    element.querySelectorAll('a[href]:not([href="#"])').forEach((a) => {
      const text = a.textContent.trim();
      if (text.length === 0) return;
      const href = a.getAttribute("href");
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);
      ctas.push(a);
    });
    const cells = [];
    if (bgImg) {
      cells.push([bgImg]);
    } else if (videoSrc) {
      const link = document.createElement("a");
      link.href = videoSrc;
      link.textContent = videoSrc;
      cells.push([link]);
    }
    const contentCell = [];
    if (eyebrow && eyebrow !== (heading == null ? void 0 : heading.parentElement)) {
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

  // tools/importer/parsers/accordion.js
  function parse4(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(
      '[class*="collapsible"], [class*="accordion"], details, [class*="faq-item"], [class*="question"]'
    );
    const faqItems = items.length > 0 ? items : element.querySelectorAll(":scope > div");
    faqItems.forEach((item) => {
      const label = item.querySelector(
        'h2, h3, h4, summary, [class*="title"], [class*="header"], [class*="question"], button'
      );
      const content = item.querySelector(
        '[class*="content"], [class*="body"], [class*="answer"], [class*="panel"]'
      );
      if (!label) return;
      const labelText = label.cloneNode(true);
      const contentEl = content ? content.cloneNode(true) : document.createTextNode("");
      cells.push([labelText, contentEl]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "accordion",
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

  // tools/importer/transformers/hp-card-consolidator.js
  var H3 = {
    before: "beforeTransform",
    after: "afterTransform"
  };
  function transform3(hookName, element, payload) {
    if (hookName !== H3.before) return;
    const root = element.querySelector(".root.responsivegrid") || element.querySelector('[class*="responsivegrid"]') || element;
    const gridCols = root.querySelectorAll(
      ".aem-Grid > .aem-GridColumn"
    );
    gridCols.forEach((col) => {
      const h3s = col.querySelectorAll("h3");
      if (h3s.length < 2) return;
      const directH3s = Array.from(h3s).filter((h3) => {
        const depth = getDepth(h3, col);
        return depth <= 4;
      });
      if (directH3s.length < 2) return;
      const h2 = col.querySelector("h2");
      if (!h2) return;
      const wrapper = element.ownerDocument.createElement("div");
      wrapper.setAttribute("data-cards-wrapper", "true");
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

  // tools/importer/import-category-landing.js
  var parsers = {
    carousel: parse,
    cards: parse2,
    hero: parse3,
    accordion: parse4
  };
  var PAGE_TEMPLATE = {
    name: "category-landing",
    description: "Category landing page with hero, featured products, carousel, use-case cards, comparison grid, and FAQ",
    urls: ["https://www.hp.com/us-en/laptops-and-2-in-1s.html"],
    blocks: [
      { name: "hero", instances: [".root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type"] },
      { name: "cards", instances: [
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6) .c-bg-container",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9) .c-hp-grid",
        ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11) .c-compare-feature"
      ] },
      { name: "carousel", instances: [".root.responsivegrid > .aem-Grid > .genericcarousel"] },
      { name: "accordion", instances: [".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(12)"] }
    ],
    sections: [
      { id: "section-hero", name: "Hero", selector: ".root.responsivegrid > .aem-Grid > .experiencefragment:first-of-type", style: null, blocks: ["hero"], defaultContent: [] },
      { id: "section-featured", name: "Featured AI PCs", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(6)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-carousel", name: "Product Carousel", selector: ".root.responsivegrid > .aem-Grid > .genericcarousel", style: null, blocks: ["carousel"], defaultContent: [] },
      { id: "section-use-cases", name: "Choose Your Laptop", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(9)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-compare", name: "Explore All Laptops", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(11)", style: null, blocks: ["cards"], defaultContent: ["h2"] },
      { id: "section-faq", name: "FAQ", selector: ".root.responsivegrid > .aem-Grid > .aem-GridColumn:nth-child(12)", style: null, blocks: ["accordion"], defaultContent: ["h2"] }
    ]
  };
  var transformers = [
    transform3,
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
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_category_landing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          if (block.name === "cards") {
            const el = block.element;
            const parent = el.parentElement;
            if (parent) {
              let sib = el.nextElementSibling;
              while (sib) {
                const next = sib.nextElementSibling;
                el.appendChild(sib);
                sib = next;
              }
            }
          }
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Parser failed for ${block.name}:`, e);
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
  return __toCommonJS(import_category_landing_exports);
})();
