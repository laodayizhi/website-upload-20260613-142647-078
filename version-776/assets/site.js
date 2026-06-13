(function () {
  var body = document.body;
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var next = document.querySelector('[data-hero-next]');
  var prev = document.querySelector('[data-hero-prev]');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    stopHero();
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();
    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startHero();
      });
    });
    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopHero);
      carousel.addEventListener('mouseleave', startHero);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var clearFilter = document.querySelector('[data-clear-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var selectedType = normalize(typeFilter ? typeFilter.value : '');
    var selectedYear = normalize(yearFilter ? yearFilter.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-keywords'));
      var type = normalize(card.getAttribute('data-type'));
      var year = normalize(card.getAttribute('data-year'));
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesType = !selectedType || type.indexOf(selectedType) !== -1;
      var matchesYear = !selectedYear || year.indexOf(selectedYear) !== -1;
      var matches = matchesKeyword && matchesType && matchesYear;
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }
  if (clearFilter) {
    clearFilter.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
      }
      if (typeFilter) {
        typeFilter.value = '';
      }
      if (yearFilter) {
        yearFilter.value = '';
      }
      applyFilters();
    });
  }
})();
