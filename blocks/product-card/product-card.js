export default function init(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'product-card-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.className = 'product-card-item';

    // Column 1: image
    const imgCol = cols[0];
    if (imgCol) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-card-image';
      const pic = imgCol.querySelector('picture') || imgCol.querySelector('img');
      if (pic) imgWrap.append(pic);
      card.append(imgWrap);
    }

    // Column 2: content
    const textCol = cols[1];
    if (textCol) {
      const body = document.createElement('div');
      body.className = 'product-card-body';

      const heading = textCol.querySelector('h3, h4, strong');
      if (heading) {
        const h = document.createElement('h3');
        h.className = 'product-card-title';
        h.textContent = heading.textContent;
        body.append(h);
      }

      // Description paragraphs
      textCol.querySelectorAll('p').forEach((p) => {
        if (p.querySelector('a') && p.children.length === 1) return;
        if (p.textContent.trim().length > 5) {
          const desc = document.createElement('p');
          desc.className = 'product-card-desc';
          desc.textContent = p.textContent.trim();
          body.append(desc);
        }
      });

      // Spec list
      const ul = textCol.querySelector('ul');
      if (ul) {
        ul.className = 'product-card-specs';
        body.append(ul);
      }

      // CTA
      const cta = textCol.querySelector('a');
      if (cta) {
        cta.className = 'product-card-cta';
        body.append(cta);
      }

      card.append(body);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
