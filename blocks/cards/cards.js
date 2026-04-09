/**
 * Scan default-content children and group them into card items.
 * Pattern: [img-paragraph] h3 [p...] [a-paragraph] repeated.
 * Each h3 starts a new card. Preceding image belongs to that card.
 */
function collectCardItems(dc) {
  const items = [];
  const children = [...dc.children];
  let i = 0;

  while (i < children.length) {
    const el = children[i];

    if (el.tagName === 'H3') {
      // h3 starts a new card
      const card = { image: null, content: [] };

      // Check if preceding element was an image (belongs to this card)
      if (i > 0) {
        const prev = children[i - 1];
        const img = prev.querySelector('picture') || prev.querySelector('img');
        if (img && (prev.tagName === 'P' || prev.tagName === 'DIV')) {
          card.image = img;
          prev.remove();
        }
      }

      // Add the h3 itself
      card.content.push(el);
      i += 1;

      // Collect following content until next h3 or image-paragraph
      while (i < children.length) {
        const next = children[i];
        if (next.tagName === 'H3' || next.tagName === 'H2') break;
        if (next.querySelector('picture, img') && next.tagName === 'P') break;
        card.content.push(next);
        i += 1;
      }

      items.push(card);
    } else {
      // Skip h2 headings, stray images, and other non-card content
      i += 1;
    }
  }

  // Remove collected elements from dc
  items.forEach((item) => {
    item.content.forEach((el) => {
      if (el.parentNode === dc) el.remove();
    });
  });

  return items;
}

export default function init(block) {
  const ul = document.createElement('ul');

  // Standard cards: process rows inside the block table
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    if (li.textContent.trim().length > 0 || li.querySelector('img')) {
      ul.append(li);
    }
  });

  // Sibling card items: flat content in adjacent default-content
  const section = block.closest('.section');
  if (section) {
    const dc = section.querySelector('.default-content');
    if (dc) {
      const items = collectCardItems(dc);
      items.forEach((item) => {
        const li = document.createElement('li');
        if (item.image) {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'cards-card-image';
          imgDiv.append(item.image);
          li.append(imgDiv);
        }
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'cards-card-body';
        item.content.forEach((el) => bodyDiv.append(el));
        li.append(bodyDiv);
        ul.append(li);
      });
    }
  }

  block.textContent = '';
  block.append(ul);
}
