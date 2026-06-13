const MovieSite = (() => {
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMobileNav() {
    const toggle = select('[data-mobile-toggle]');
    const nav = select('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    const hero = select('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = selectAll('[data-hero-slide]', hero);
    const dots = selectAll('[data-hero-dot]', hero);
    const prev = select('[data-hero-prev]', hero);
    const next = select('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll('[data-filter-form]').forEach((panel) => {
      const root = panel.closest('section') || document;
      const cards = selectAll('[data-card]', root);
      const input = select('[data-search-input]', panel);
      const year = select('[data-year-filter]', panel);
      const type = select('[data-type-filter]', panel);
      const empty = select('[data-empty-state]', root);

      function run() {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const yearValue = year ? year.value : '';
        const typeValue = type ? type.value : '';
        let visible = 0;
        cards.forEach((card) => {
          const text = (card.getAttribute('data-search') || '').toLowerCase();
          const matchKeyword = !keyword || text.includes(keyword);
          const matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          const matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          const ok = matchKeyword && matchYear && matchType;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', run);
      }
      if (year) {
        year.addEventListener('change', run);
      }
      if (type) {
        type.addEventListener('change', run);
      }
      run();
    });
  }

  function initPlayer(source) {
    const video = select('#movieVideo');
    const overlay = select('#playOverlay');
    const wrap = select('#playerWrap');
    if (!video || !overlay || !source) {
      return;
    }
    let started = false;
    let instance = null;

    function attach() {
      if (started) {
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
        return;
      }
      started = true;
      overlay.classList.add('hidden');
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    }

    overlay.addEventListener('click', attach);
    video.addEventListener('click', () => {
      if (!started) {
        attach();
      }
    });
    if (wrap) {
      wrap.addEventListener('click', (event) => {
        if (!started && event.target !== overlay) {
          attach();
        }
      });
    }
    window.addEventListener('beforeunload', () => {
      if (instance) {
        instance.destroy();
      }
    });
  }

  function init() {
    initMobileNav();
    initHero();
    initFilters();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    initPlayer
  };
})();
