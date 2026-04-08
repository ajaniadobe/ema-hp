/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel (hero carousel).
 * Base: carousel. Source: https://www.hp.com/us-en/home.html
 * Structure: 2 columns per row. Col1: image, Col2: heading + subheading + CTAs
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all carousel slides
  const slides = element.querySelectorAll(
    '[class*="slide"]:not([class*="clone"]):not([class*="duplicate"])'
  );

  // Deduplicate slides (Swiper clones first/last)
  const seen = new Set();
  const uniqueSlides = [];
  slides.forEach((slide) => {
    const h2 = slide.querySelector('h2');
    if (!h2) return;
    const key = h2.textContent.trim();
    if (seen.has(key)) return;
    seen.add(key);
    uniqueSlides.push(slide);
  });

  uniqueSlides.forEach((slide) => {
    // Background image (largest img in slide)
    const imgs = Array.from(slide.querySelectorAll('img'));
    const bgImg = imgs.reduce((best, img) => {
      const w = img.naturalWidth || img.width || 0;
      return w > (best?.naturalWidth || best?.width || 0) ? img : best;
    }, imgs[0]);

    // Text content
    const heading = slide.querySelector('h2');
    const subheading = slide.querySelector('h3');
    const para = slide.querySelector('p:not(:empty)');
    const ctas = Array.from(
      slide.querySelectorAll('a[href]:not([href="#"])')
    ).filter((a) => a.textContent.trim().length > 0);

    // Build image cell
    const imgCell = bgImg ? bgImg : document.createTextNode('');

    // Build content cell
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
    name: 'carousel',
    cells,
  });
  element.replaceWith(block);
}
