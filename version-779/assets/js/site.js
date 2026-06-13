(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function step(delta) {
      show(index + delta);
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        step(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        step(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        step(1);
        start();
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-search-input]");
      var category = scope.querySelector("[data-filter-category]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var q = normalizeText(input ? input.value : "");
        var c = normalizeText(category ? category.value : "");
        var y = normalizeText(year ? year.value : "");
        var visible = 0;

        cards.forEach(function(card) {
          var haystack = normalizeText([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
          ].join(" "));
          var okText = !q || haystack.indexOf(q) !== -1;
          var okCategory = !c || normalizeText(card.dataset.category) === c;
          var okYear = !y || normalizeText(card.dataset.year) === y;
          var ok = okText && okCategory && okYear;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, category, year].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-play-overlay]");
      if (!video) {
        return;
      }
      var url = video.getAttribute("data-video-url");
      var started = false;

      function bind() {
        if (started || !url) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
        } else {
          video.src = url;
        }
        started = true;
      }

      function play() {
        bind();
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function() {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function() {
        if (!started) {
          play();
        }
      });
    });
  }

  ready(function() {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
