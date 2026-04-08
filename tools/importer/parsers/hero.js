/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: HP.com pages.
 * Structure: 1 column, row 1: background image, row 2: text content
 *
 * Handles: featured content cards (WRI, Space article),
 * hero banners with video backgrounds, experience fragments.
 */
export default function parse(element, { document }) {
  // Background image — largest img, or video poster
  const imgs = Array.from(element.querySelectorAll('img'));
  const bgImg = imgs.find((img) => {
    const src = img.getAttribute('src') || '';
    return src.includes('banner') || src.includes('hero')
      || img.closest('[class*="image"]')
      || img.closest('[class*="background"]');
  }) || imgs.reduce((best, img) => {
    const w = parseInt(img.getAttribute('width'), 10)
      || img.naturalWidth || 0;
    const bw = parseInt(best?.getAttribute('width'), 10)
      || best?.naturalWidth || 0;
    return w > bw ? img : best;
  }, imgs[0]);

  // Video (if present)
  const video = element.querySelector('video source, video');
  const videoSrc = video?.getAttribute('src')
    || video?.querySelector('source')?.getAttribute('src');

  // Text content
  const allParas = Array.from(element.querySelectorAll('p'));
  const eyebrow = allParas.find(
    (p) => !p.querySelector('a') && !p.querySelector('img')
      && p.textContent.trim().length > 2
      && p.textContent.trim().length < 60
  );
  const heading = element.querySelector('h2, h1');
  const subheading = element.querySelector('h3');

  // CTAs — deduplicate by href
  const seenHrefs = new Set();
  const ctas = [];
  element.querySelectorAll('a[href]:not([href="#"])').forEach((a) => {
    const text = a.textContent.trim();
    if (text.length === 0) return;
    const href = a.getAttribute('href');
    if (seenHrefs.has(href)) return;
    seenHrefs.add(href);
    ctas.push(a);
  });

  const cells = [];

  // Row 1: background image or video
  if (bgImg) {
    cells.push([bgImg]);
  } else if (videoSrc) {
    const link = document.createElement('a');
    link.href = videoSrc;
    link.textContent = videoSrc;
    cells.push([link]);
  }

  // Row 2: text content
  const contentCell = [];
  if (eyebrow && eyebrow !== heading?.parentElement) {
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
    name: 'hero',
    cells,
  });
  element.replaceWith(block);
}
