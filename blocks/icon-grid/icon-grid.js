export default function init(block) {
  const items = block.querySelectorAll(':scope > div');
  const grid = document.createElement('div');
  grid.className = 'icon-grid-items';

  items.forEach((item) => {
    const cols = item.querySelectorAll(':scope > div');
    const card = document.createElement('a');
    card.className = 'icon-grid-card';

    // Find link destination
    const link = item.querySelector('a');
    if (link) card.href = link.href;

    // Icon (first column or first image)
    const icon = cols[0]?.querySelector('img, picture, .icon');
    if (icon) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'icon-grid-icon';
      iconWrap.append(icon);
      card.append(iconWrap);
    }

    // Title (second column or heading)
    const title = cols[1]?.querySelector('h3, h4, strong')
      || item.querySelector('h3, h4, strong');
    if (title) {
      const titleEl = document.createElement('span');
      titleEl.className = 'icon-grid-title';
      titleEl.textContent = title.textContent.trim();
      card.append(titleEl);
    }

    if (card.children.length > 0) grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
