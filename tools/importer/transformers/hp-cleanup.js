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

    // Remove tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
      el.removeAttribute('onclick');
    });
  }
}
