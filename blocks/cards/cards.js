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
    // Only add if the li has meaningful content (not just empty divs)
    if (li.textContent.trim().length > 0 || li.querySelector('img')) {
      ul.append(li);
    }
  });

  // Sibling card items: check for h3 elements in adjacent
  // default-content that belong to this cards section
  const section = block.closest('.section');
  if (section) {
    const dc = section.querySelector('.default-content');
    if (dc) {
      const h3s = dc.querySelectorAll('h3');
      if (h3s.length > 1) {
        // Group siblings by h3: each card = preceding img + h3 + following p/a
        h3s.forEach((h3) => {
          const li = document.createElement('li');

          // Image: look backward for preceding <p> with <img>
          let imgWrap = null;
          let prev = h3.previousElementSibling;
          while (prev) {
            if (prev.tagName === 'H3') break;
            if (prev.querySelector('picture, img')) {
              imgWrap = document.createElement('div');
              imgWrap.className = 'cards-card-image';
              const pic = prev.querySelector('picture')
                || prev.querySelector('img');
              if (pic) imgWrap.append(pic);
              prev.remove();
              break;
            }
            prev = prev.previousElementSibling;
          }

          // Body: h3 + following content until next h3 or img
          const body = document.createElement('div');
          body.className = 'cards-card-body';
          body.append(h3);

          let next = body.querySelector('h3')
            ? null
            : h3.nextElementSibling;
          // Re-check: h3 was moved into body, so check dc directly
          const dcChildren = [...dc.children];
          const h3Idx = dcChildren.indexOf(h3);
          // h3 is now in body, scan remaining dc children
          let sib = dc.children[0];
          const toMove = [];
          let foundH3 = false;
          while (sib) {
            const nextSib = sib.nextElementSibling;
            if (sib.tagName === 'H3') break;
            if (sib.querySelector('picture, img')) break;
            toMove.push(sib);
            sib = nextSib;
          }
          toMove.forEach((el) => body.append(el));

          if (imgWrap) li.append(imgWrap);
          li.append(body);
          ul.append(li);
        });
      }
    }
  }

  block.textContent = '';
  block.append(ul);
}
