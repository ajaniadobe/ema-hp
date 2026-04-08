/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel (hero carousel).
 * Base: carousel. Source: HP.com pages.
 * Structure: 2 columns per row. Col1: image, Col2: heading + subheading + CTAs
 *
 * HP uses Swiper which clones first/last slides. Deduplicate by h2 text.
 * Each slide has: background image, h2 title, h3 subtitle, optional p, 1-2 CTA links.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all slides — exclude clones
  const allSlides = element.querySelectorAll(
    '[class*="slide"]:not([class*="clone"]):not([class*="duplicate"])'
  );

  // Deduplicate by h2 text (Swiper duplicates first/last)
  const seen = new Set();
  const slides = [];
  allSlides.forEach((slide) => {
    const h2 = slide.querySelector('h2');
    if (!h2) return;
    const key = h2.textContent.trim();
    if (seen.has(key)) return;
    seen.add(key);
    slides.push(slide);
  });

  slides.forEach((slide) => {
    // Background image — find the largest or the dedicated bg img
    const imgs = Array.from(slide.querySelectorAll('img'));
    const bgImg = imgs.find((img) => {
      const w = parseInt(img.getAttribute('width'), 10) || 0;
      return w > 400 || img.className.includes('bg')
        || img.closest('[class*="image"]');
    }) || imgs[imgs.length - 1];

    // Text content
    const heading = slide.querySelector('h2');
    const subheading = slide.querySelector('h3');
    const desc = slide.querySelector('p:not(:empty)');

    // CTAs — deduplicate by href
    const seenHrefs = new Set();
    const ctas = [];
    slide.querySelectorAll('a[href]:not([href="#"])').forEach((a) => {
      if (a.textContent.trim().length === 0) return;
      const href = a.getAttribute('href');
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);
      ctas.push(a);
    });

    // Build image cell
    const imgCell = bgImg || document.createTextNode('');

    // Build content cell
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
    name: 'carousel',
    cells,
  });
  element.replaceWith(block);
}
