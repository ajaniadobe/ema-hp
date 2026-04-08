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
  function parse2(element, { document }) {
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
      const skipLists = element.querySelectorAll("ul");
      skipLists.forEach((ul) => {
        const links = ul.querySelectorAll('a[href="#body"], a[href="#footer"], a[href="#countryselector"]');
        if (links.length > 0) ul.remove();
      });
      element.querySelectorAll("a").forEach((a) => {
        const text = a.textContent.trim().toLowerCase();
        if (text === "related links" || a.href.includes("void(0)")) {
          const p = a.closest("p") || a;
          p.remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text.includes("Show Next Slide") || text.includes("Show Previous Slide") || text.includes("Go to slide") || text.includes("Close Clear Play")) {
          p.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".c-hp-modal",
        '[class*="modal"]'
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
  return __toCommonJS(import_content_editorial_exports);
})();
