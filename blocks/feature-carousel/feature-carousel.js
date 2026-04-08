export default function init(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'feature-carousel-wrapper';

  // Navigation dots (numbered)
  const nav = document.createElement('div');
  nav.className = 'feature-carousel-nav';

  // Panels
  const panels = document.createElement('div');
  panels.className = 'feature-carousel-panels';

  rows.forEach((row, idx) => {
    const cols = [...row.children];

    // Navigation button
    const btn = document.createElement('button');
    btn.className = 'feature-carousel-dot';
    btn.textContent = idx + 1;
    btn.setAttribute('aria-label', `Feature ${idx + 1}`);
    if (idx === 0) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      block.querySelectorAll('.feature-carousel-dot').forEach(
        (b) => b.classList.remove('is-active'),
      );
      btn.classList.add('is-active');
      block.querySelectorAll('.feature-carousel-panel').forEach(
        (p) => p.classList.remove('is-active'),
      );
      const target = block.querySelectorAll('.feature-carousel-panel')[idx];
      if (target) target.classList.add('is-active');
    });
    nav.append(btn);

    // Panel content
    const panel = document.createElement('div');
    panel.className = `feature-carousel-panel${idx === 0 ? ' is-active' : ''}`;

    // Image (col 0)
    if (cols[0]) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'feature-carousel-image';
      const pic = cols[0].querySelector('picture, img');
      if (pic) imgWrap.append(pic);
      panel.append(imgWrap);
    }

    // Text (col 1)
    if (cols[1]) {
      const text = document.createElement('div');
      text.className = 'feature-carousel-text';
      while (cols[1].firstChild) text.append(cols[1].firstChild);
      panel.append(text);
    }

    panels.append(panel);
  });

  wrapper.append(nav);
  wrapper.append(panels);
  block.textContent = '';
  block.append(wrapper);
}
