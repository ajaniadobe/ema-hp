/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: HP site cleanup.
 * Selectors from captured DOM of https://www.hp.com/us-en/home.html
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent dialogs, overlays, modals
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '[class*="privacy-banner"]',
      '.c-hp-modal',
      '.modal',
      '[class*="overlay"]',
    ]);

    // Remove tracking scripts and noscript tags
    WebImporter.DOMUtils.remove(element, [
      'script',
      'noscript',
    ]);

    // Clean jumpid tracking params from all links
    element.querySelectorAll('a[href*="jumpid="]').forEach((a) => {
      try {
        const url = new URL(a.href);
        url.searchParams.delete('jumpid');
        a.href = url.toString();
      } catch (e) {
        // skip malformed URLs
      }
    });
  }

  if (hookName === H.after) {
    // Remove non-authorable: header, footer, nav, skip links
    WebImporter.DOMUtils.remove(element, [
      'header',
      '#header',
      'footer',
      '#footer',
      '[class*="skip-link"]',
      '[class*="skip-to"]',
      '.c-hp-global-header',
      '.c-hp-global-footer',
      '#countryselector',
      '[class*="footer-sections"]',
      'nav',
    ]);

    // Remove social share, related links, sign-in popups
    WebImporter.DOMUtils.remove(element, [
      '.sign-in-section',
      '[class*="sign-in"]',
      '[class*="related-links"]',
      'iframe',
      'link',
    ]);

    // Remove skip links
    const skipLists = element.querySelectorAll('ul');
    skipLists.forEach((ul) => {
      const links = ul.querySelectorAll('a[href="#body"], a[href="#footer"], a[href="#countryselector"]');
      if (links.length > 0) ul.remove();
    });

    // Remove "Related links" and placeholder text
    element.querySelectorAll('a').forEach((a) => {
      const text = a.textContent.trim().toLowerCase();
      if (text === 'related links' || a.href.includes('void(0)')) {
        const p = a.closest('p') || a;
        p.remove();
      }
    });

    // Remove carousel placeholder text artifacts
    element.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text.includes('Show Next Slide') || text.includes('Show Previous Slide')
          || text.includes('Go to slide') || text.includes('Close Clear Play')) {
        p.remove();
      }
    });

    // Remove modal elements
    WebImporter.DOMUtils.remove(element, [
      '.c-hp-modal',
      '[class*="modal"]',
    ]);

    // Remove tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
      el.removeAttribute('onclick');
    });
  }
}
