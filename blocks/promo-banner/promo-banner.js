export default function init(block) {
  const content = block.querySelector(':scope > div');
  if (!content) return;

  const inner = document.createElement('div');
  inner.className = 'promo-banner-inner';

  // Move all content
  while (content.firstChild) inner.append(content.firstChild);

  // Add dismiss button
  const dismiss = document.createElement('button');
  dismiss.className = 'promo-banner-dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss');
  dismiss.innerHTML = '&times;';
  dismiss.addEventListener('click', () => {
    block.remove();
  });

  inner.append(dismiss);
  block.textContent = '';
  block.append(inner);
}
