document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function restartTimer() {
            window.clearInterval(timer);
            startTimer();
        }

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(index - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")));
                restartTimer();
            });
        });

        startTimer();
    }

    var filterForm = document.querySelector("[data-filter-form]");

    if (filterForm) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        var keywordInput = filterForm.querySelector("[name='keyword']");
        var regionSelect = filterForm.querySelector("[name='region']");
        var yearSelect = filterForm.querySelector("[name='year']");
        var typeSelect = filterForm.querySelector("[name='type']");
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var keep = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    keep = false;
                }

                if (region && normalize(card.getAttribute("data-region")) !== region) {
                    keep = false;
                }

                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    keep = false;
                }

                if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
                    keep = false;
                }

                card.style.display = keep ? "" : "none";
                if (keep) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        filterForm.addEventListener("input", applyFilter);
        filterForm.addEventListener("change", applyFilter);
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });

        applyFilter();
    }
});
