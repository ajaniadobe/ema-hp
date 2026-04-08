export default function init(block) {
  const items = block.querySelectorAll(':scope > div');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');

  items.forEach((item, idx) => {
    const li = document.createElement('li');
    const link = item.querySelector('a');
    const text = item.textContent.trim();

    if (link) {
      li.append(link);
    } else if (text) {
      li.setAttribute('aria-current', 'page');
      li.textContent = text;
    }

    if (idx < items.length - 1) {
      li.classList.add('breadcrumb-has-separator');
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
