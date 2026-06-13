import { H as Hls } from './hls-vendor-dru42stk.js';

const body = document.body;
const navToggle = document.querySelector('[data-nav-toggle]');
const backTop = document.querySelector('[data-back-top]');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    body.classList.toggle('nav-open');
  });
}

if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('is-visible', window.scrollY > 320);
  });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let index = 0;

  if (slides.length <= 1) {
    return;
  }

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => showSlide(dotIndex));
  });

  window.setInterval(() => showSlide(index + 1), 5200);
}

function setupSearchFilters() {
  const input = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('.searchable-card'));
  const counter = document.querySelector('[data-result-count]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const clearButton = document.querySelector('[data-clear-search]');

  if (!cards.length) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchesSelect(card, selector, key) {
    if (!selector || !selector.value) {
      return true;
    }

    return normalize(card.dataset[key]) === normalize(selector.value);
  }

  function applyFilters() {
    const query = normalize(input ? input.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.tags
      ].join(' '));

      const matched = (!query || haystack.includes(query)) &&
        matchesSelect(card, yearSelect, 'year') &&
        matchesSelect(card, typeSelect, 'type') &&
        matchesSelect(card, categorySelect, 'category');

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = `共 ${visible} 部影片`;
    }
  }

  [input, yearSelect, typeSelect, categorySelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (input) {
        input.value = '';
      }

      [yearSelect, typeSelect, categorySelect].forEach((select) => {
        if (select) {
          select.value = '';
        }
      });

      applyFilters();
    });
  }

  applyFilters();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const startButton = player.querySelector('[data-player-start]');
    const source = video ? video.dataset.src : '';
    let initialized = false;
    let hls = null;

    if (!video || !source || !startButton) {
      return;
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      player.classList.add('is-playing');

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);

        return new Promise((resolve) => {
          hls.on(Hls.Events.MANIFEST_PARSED, resolve);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
              console.warn('HLS playback error:', data.type, data.details);
            }
          });
        });
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      return Promise.resolve();
    }

    async function playVideo() {
      try {
        await initialize();
        await video.play();
      } catch (error) {
        console.warn('Playback was blocked or failed:', error);
        player.classList.remove('is-playing');
      }
    }

    startButton.addEventListener('click', playVideo);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

setupHeroCarousel();
setupSearchFilters();
setupPlayers();
