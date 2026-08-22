(() => {
  const search = document.getElementById('manualSearch');
  const searchButton = document.getElementById('manualSearchButton');
  const status = document.getElementById('searchStatus');
  const noResults = document.getElementById('noResults');
  const clear = document.getElementById('clearSearch');
  const select = document.getElementById('chapterSelect');
  const terms = [...document.querySelectorAll('.term')];
  const glossary = document.getElementById('glossary');
  const navLinks = [...document.querySelectorAll('.contents a')];
  const sections = [...document.querySelectorAll('.chapter')];
  const chapters = [...document.querySelectorAll('.chapter:not(.glossary)')];
  const progress = document.getElementById('readingProgress');

  const normalise = (value) => value
    .toLocaleLowerCase('en-AU')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const matchesQuery = (item, words) => {
    if (words.length === 0) return true;
    const text = normalise(item.textContent);
    return words.every((word) => text.includes(word));
  };

  const filter = (moveToResult = false) => {
    const query = normalise(search.value);
    const words = query ? query.split(/\s+/) : [];
    let chapterMatches = 0;
    let termMatches = 0;
    chapters.forEach((item) => {
      const visible = matchesQuery(item, words);
      item.classList.toggle('is-filtered', !visible);
      if (visible) chapterMatches += 1;
    });
    terms.forEach((item) => {
      const visible = matchesQuery(item, words);
      item.classList.toggle('is-filtered', !visible);
      if (visible) termMatches += 1;
    });
    glossary.classList.toggle('is-filtered', words.length > 0 && termMatches === 0);
    const matches = chapterMatches + termMatches;
    noResults.hidden = matches !== 0;
    status.textContent = words.length > 0
      ? `${matches} matching ${matches === 1 ? 'chapter or definition' : 'chapters or definitions'}.`
      : 'Search all chapters and glossary definitions.';

    if (moveToResult && matches > 0 && words.length > 0) {
      const firstResult = document.querySelector('.chapter:not(.is-filtered), .term:not(.is-filtered)');
      firstResult?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  search.addEventListener('input', () => filter(false));
  search.addEventListener('search', () => filter(false));
  search.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    filter(true);
  });
  searchButton.addEventListener('click', () => filter(true));
  clear.addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  select.addEventListener('change', () => {
    const target = document.getElementById(select.value);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, .2, .5] });
  sections.forEach((section) => observer.observe(section));

  addEventListener('scroll', () => {
    const available = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${available > 0 ? Math.min(100, scrollY / available * 100) : 0}%`;
  }, { passive: true });
})();
