const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const toggleLabel = document.querySelector(".theme-toggle__label");
const storageKey = "portfolio-theme";
let themeTransitionTimer;

const getPreferredTheme = () => {
  const savedTheme = window.localStorage.getItem(storageKey);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  toggleLabel.textContent = theme === "light" ? "Light" : "Dark";
  toggle.setAttribute(
    "aria-label",
    theme === "light" ? "Aktifkan tema gelap" : "Aktifkan tema terang"
  );
};

applyTheme(getPreferredTheme());

toggle.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.classList.add("theme-transitioning");
  applyTheme(nextTheme);
  window.localStorage.setItem(storageKey, nextTheme);
  window.clearTimeout(themeTransitionTimer);
  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 580);
});

const projectSlider = document.querySelector("#project-slider");

if (projectSlider) {
  const section = projectSlider.closest("section");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let autoplayEnabled = !reducedMotion.matches;
  let visible = false;
  let hovered = false;
  let touching = false;
  let autoplayTimer;

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    if (!autoplayEnabled || !visible || document.hidden || hovered || touching ||
        section.contains(document.activeElement)) return;
    autoplayTimer = window.setTimeout(() => {
      const maxScroll = projectSlider.scrollWidth - projectSlider.clientWidth;
      if (maxScroll > 2) {
        if (projectSlider.scrollLeft >= maxScroll - 2) {
          projectSlider.scrollTo({ left: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
        } else {
          moveProject(1);
        }
      }
      scheduleAutoplay();
    }, 4000);
  };

  const moveProject = (direction) => {
    const cards = projectSlider.querySelectorAll(".project-card");
    if (cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    projectSlider.scrollBy({
      left: direction * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  projectSlider.addEventListener("keydown", (event) => {
    if (event.target !== projectSlider) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveProject(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  projectSlider.addEventListener("scroll", scheduleAutoplay, { passive: true });
  section.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    scheduleAutoplay();
  });
  section.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = false;
    scheduleAutoplay();
  });
  section.addEventListener("pointerdown", () => {
    touching = true;
    scheduleAutoplay();
  });
  const releasePointer = () => {
    touching = false;
    scheduleAutoplay();
  };
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);
  section.addEventListener("focusin", scheduleAutoplay);
  section.addEventListener("focusout", () => window.setTimeout(scheduleAutoplay, 0));
  projectSlider.addEventListener("wheel", scheduleAutoplay, { passive: true });
  document.addEventListener("visibilitychange", scheduleAutoplay);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    scheduleAutoplay();
  }, { threshold: 0.2 }).observe(projectSlider);
  reducedMotion.addEventListener("change", () => {
    autoplayEnabled = !reducedMotion.matches;
    scheduleAutoplay();
  });
  window.addEventListener("resize", scheduleAutoplay);
}
