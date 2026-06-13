let hlsLoader = null;

function getHls() {
  if (!hlsLoader) {
    hlsLoader = import('./hls-vendor.js').then((module) => module.H);
  }
  return hlsLoader;
}

function setupMobileMenu() {
  const button = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.mobile-nav');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };
  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      restart();
    });
  });
  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      restart();
    });
  }
  restart();
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('.movie-player-box[data-stream]'));
  players.forEach((box) => {
    const video = box.querySelector('video');
    const overlay = box.querySelector('.player-overlay');
    const stream = box.getAttribute('data-stream');
    let ready = false;
    let hls = null;
    const prepare = async () => {
      if (ready || !video || !stream) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }
      const Hls = await getHls();
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal && overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };
    const start = async () => {
      if (!video) {
        return;
      }
      await prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      video.play().catch(() => {});
    };
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', () => {
        if (!ready) {
          start();
        }
      });
    }
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function movieCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `<article class="movie-card">
  <a class="card-cover" href="${escapeHtml(movie.url)}" aria-label="${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="card-play">▶</span>
    <span class="card-duration">${escapeHtml(movie.duration)}</span>
  </a>
  <div class="card-body">
    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine || '')}</p>
    <div class="card-tags">${tags}</div>
    <div class="card-meta"><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.year)}</span><span>${escapeHtml(movie.views)}观看</span></div>
  </div>
</article>`;
}

function setupSearch() {
  const form = document.querySelector('[data-search-form]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const data = window.SITE_MOVIES || [];
  if (!form || !results || !data.length) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (initial) {
    form.elements.q.value = initial;
  }
  const render = () => {
    const query = (form.elements.q.value || '').trim().toLowerCase();
    const region = form.elements.region.value;
    const type = form.elements.type.value;
    const found = data.filter((movie) => {
      const haystack = `${movie.title} ${movie.region} ${movie.regionGroup} ${movie.type} ${movie.typeGroup} ${movie.year} ${movie.genre} ${(movie.tags || []).join(' ')} ${movie.oneLine}`.toLowerCase();
      const matchQuery = !query || haystack.includes(query);
      const matchRegion = !region || movie.regionGroup === region;
      const matchType = !type || movie.typeGroup === type;
      return matchQuery && matchRegion && matchType;
    }).slice(0, 80);
    results.innerHTML = found.map(movieCard).join('');
    if (status) {
      status.textContent = found.length ? `匹配结果 ${found.length}` : '暂无匹配结果';
    }
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  if (initial) {
    render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHero();
  setupPlayers();
  setupSearch();
});
