export default function init(block) {
  const items = block.querySelectorAll(':scope > div');
  const row = document.createElement('div');
  row.className = 'badge-row-items';

  items.forEach((item) => {
    const badge = document.createElement('div');
    badge.className = 'badge-row-badge';

    const img = item.querySelector('img, picture');
    const link = item.querySelector('a');

    if (link && img) {
      link.className = 'badge-row-link';
      link.append(img);
      badge.append(link);
    } else if (img) {
      badge.append(img);
    }

    if (badge.children.length > 0) row.append(badge);
  });

  block.textContent = '';
  block.append(row);
}
