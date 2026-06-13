import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-mobile-menu]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function initHero() {
  const hero = $("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = $$("[data-hero-slide]", hero);
  const dots = $$("[data-hero-dot]", hero);
  const prev = $("[data-hero-prev]", hero);
  const next = $("[data-hero-next]", hero);
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  };

  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => show(active + 1), 5000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      play();
    });
  });

  prev?.addEventListener("click", () => {
    show(active - 1);
    play();
  });

  next?.addEventListener("click", () => {
    show(active + 1);
    play();
  });

  show(0);
  play();
}

function initPlayers() {
  $$("[data-player]").forEach((player) => {
    const video = $("video", player);
    const button = $("[data-play-button]", player);
    const message = $("[data-player-message]", player);
    const source = player.dataset.src;
    let hls = null;
    let attached = false;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const attach = () => {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage("");
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setMessage("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        setMessage("当前浏览器暂不支持播放");
      }
    };

    const togglePlay = async () => {
      attach();
      if (!video) {
        return;
      }
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        setMessage("点击播放器开始观看");
      }
    };

    button?.addEventListener("click", togglePlay);
    video?.addEventListener("click", togglePlay);
    video?.addEventListener("play", () => player.classList.add("is-playing"));
    video?.addEventListener("pause", () => player.classList.remove("is-playing"));
    video?.addEventListener("ended", () => player.classList.remove("is-playing"));
    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function cardTemplate(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
        <a class="movie-card" href="${movie.href}">
          <div class="card-cover">
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="duration">${escapeHtml(movie.duration)}</span>
            <span class="play-icon">▶</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.oneLine)}</p>
            <div class="meta-row">
              <span>${escapeHtml(movie.year)}</span>
              <span>${escapeHtml(movie.region)}</span>
            </div>
            <div class="tag-list">${tags}</div>
          </div>
        </a>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initSearch() {
  const form = $("[data-search-form]");
  const results = $("[data-search-results]");
  const meta = $("[data-search-meta]");
  const loadMore = $("[data-load-more]");
  const data = window.MOVIE_DATA || [];
  if (!form || !results || !data.length) {
    return;
  }

  const input = $("[data-search-input]", form);
  const region = $("[data-region-filter]", form);
  const type = $("[data-type-filter]", form);
  const genre = $("[data-genre-filter]", form);
  let visible = 24;
  let current = data.slice(0, visible);

  const params = new URLSearchParams(window.location.search);
  const initialKeyword = params.get("q");
  if (initialKeyword && input) {
    input.value = initialKeyword;
  }

  const normalize = (text) => String(text || "").toLowerCase().trim();

  const apply = () => {
    const keyword = normalize(input?.value);
    const regionValue = region?.value || "";
    const typeValue = type?.value || "";
    const genreValue = genre?.value || "";
    current = data.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" "));
      return (!keyword || haystack.includes(keyword))
        && (!regionValue || movie.regionGroup === regionValue)
        && (!typeValue || movie.typeGroup === typeValue)
        && (!genreValue || movie.genre.includes(genreValue) || movie.tags.includes(genreValue));
    });
    visible = 24;
    render();
  };

  const render = () => {
    const shown = current.slice(0, visible);
    results.innerHTML = shown.map(cardTemplate).join("");
    if (meta) {
      meta.textContent = shown.length ? "当前筛选结果" : "没有找到匹配影片";
    }
    if (loadMore) {
      loadMore.hidden = visible >= current.length;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    apply();
  });

  [input, region, type, genre].forEach((control) => {
    control?.addEventListener("input", apply);
    control?.addEventListener("change", apply);
  });

  loadMore?.addEventListener("click", () => {
    visible += 24;
    render();
  });

  apply();
}

initMobileMenu();
initHero();
initPlayers();
initSearch();
