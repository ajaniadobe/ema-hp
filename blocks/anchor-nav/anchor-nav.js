export default function init(block) {
  const items = block.querySelectorAll(':scope > div');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Page sections');
  nav.className = 'anchor-nav-inner';

  const ul = document.createElement('ul');

  items.forEach((item) => {
    const link = item.querySelector('a');
    if (!link) return;
    const li = document.createElement('li');
    li.append(link);
    ul.append(li);
  });

  nav.append(ul);
  block.textContent = '';
  block.append(nav);

  // Sticky behavior
  const observer = new IntersectionObserver(
    ([entry]) => {
      block.classList.toggle('is-stuck', !entry.isIntersecting);
    },
    { threshold: [1], rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 64}px 0px 0px 0px` },
  );

  const sentinel = document.createElement('div');
  sentinel.className = 'anchor-nav-sentinel';
  block.before(sentinel);
  observer.observe(sentinel);

  // Active link tracking
  const links = nav.querySelectorAll('a[href^="#"]');
  const sections = [];
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) sections.push({ link, target });
  });

  if (sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const match = sections.find((s) => s.target === entry.target);
          if (match) {
            match.link.classList.toggle('is-active', entry.isIntersecting);
          }
        });
      },
      { threshold: 0.3 },
    );
    sections.forEach((s) => sectionObserver.observe(s.target));
  }
}
