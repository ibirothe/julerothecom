// Lightweight, dependency-free infinite carousel; core helpers are regression-tested in CI.
export function shuffleTestimonials(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function circularIndex(index, total) {
  return total > 0 ? ((index % total) + total) % total : 0;
}
export function carouselLabel(index, visible, total) {
  if (!total) return "";
  const digits = n => String(n).padStart(2, "0");
  const first = circularIndex(index, total);
  const last = circularIndex(first + Math.min(visible, total) - 1, total);
  return digits(first + 1) + (visible > 1 ? "–" + digits(last + 1) : "") + " / " + digits(total);
}

export function createTestimonialCarousel({ grid, controls, progress, previous, next, createCard }) {
  if (!grid || !controls || !progress || !previous || !next) return { setItems() {} };
  let items = [];
  let active = 0;
  let looping = false;
  let slots = 0;
  let width = 0;
  let target = null;
  let pending = false;
  let idle;
  let jumpVersion = 0;

  const visibleSlots = () => grid.clientWidth >= 700 ? 2 : 1; // Matches the CSS container query.
  const step = () => {
    const first = grid.querySelector(".testimonial-card");
    const second = first?.nextElementSibling;
    if (!first) return 0;
    return second ? second.getBoundingClientRect().left - first.getBoundingClientRect().left
      : first.getBoundingClientRect().width;
  };
  const jump = left => {
    const version = ++jumpVersion;
    grid.style.scrollSnapType = "none";
    grid.style.scrollBehavior = "auto";
    grid.scrollLeft = left;
    requestAnimationFrame(() => {
      if (version !== jumpVersion) return;
      grid.style.removeProperty("scroll-snap-type");
      grid.style.removeProperty("scroll-behavior");
    });
  };
  const update = () => {
    const distance = step();
    const scrollable = looping && items.length > slots && distance > 0;
    controls.hidden = !scrollable;
    grid.tabIndex = scrollable ? 0 : -1;
    if (!scrollable) {
      progress.textContent = "";
      return;
    }
    active = circularIndex(Math.round(grid.scrollLeft / distance), items.length);
    progress.textContent = carouselLabel(active, slots, items.length);
    previous.disabled = false;
    next.disabled = false;
  };
  const queueUpdate = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      update();
    });
  };
  const settle = () => {
    clearTimeout(idle);
    if (!looping) return;
    const distance = step();
    if (!distance) return;
    const physical = Math.round(grid.scrollLeft / distance);
    active = circularIndex(physical, items.length);
    if (physical < items.length || physical >= 2 * items.length) {
      const offset = grid.scrollLeft - physical * distance;
      // An identical slide in the middle set keeps this reset invisible.
      jump((items.length + active) * distance + offset);
    }
    target = null;
    queueUpdate();
  };
  const move = direction => {
    if (!looping) return;
    const distance = step();
    if (!distance) return;
    let current = target ?? Math.round(grid.scrollLeft / distance);
    let destination = current + direction;
    if (destination < 0 || destination > items.length * 3 - slots) {
      current = items.length + circularIndex(current, items.length);
      jump(current * distance);
      destination = current + direction;
    }
    target = destination;
    grid.scrollTo({
      left: destination * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  };
  const render = () => {
    slots = visibleSlots();
    width = grid.clientWidth;
    looping = items.length > slots;
    const fragment = document.createDocumentFragment();
    for (let copy = 0; copy < (looping ? 3 : 1); copy++) {
      for (const item of items) {
        const card = createCard(item);
        if (looping && copy !== 1) {
          card.setAttribute("aria-hidden", "true");
          card.inert = true;
        }
        fragment.append(card);
      }
    }
    grid.replaceChildren(fragment);
    grid.classList.toggle("is-looping", looping);
    target = null;
    jump((looping ? items.length + active : 0) * step());
    update();
  };
  const resize = () => {
    if (!items.length) return;
    const newWidth = grid.clientWidth;
    if (visibleSlots() !== slots) render();
    else if (Math.abs(newWidth - width) > 1) {
      width = newWidth;
      jump((looping ? items.length + active : 0) * step());
      update();
    }
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  grid.addEventListener("scroll", () => {
    queueUpdate();
    clearTimeout(idle);
    idle = setTimeout(settle, 190); // Fallback for browsers without scrollend.
  }, { passive: true });
  grid.addEventListener("scrollend", settle);
  grid.addEventListener("pointerdown", () => { target = null; });
  grid.addEventListener("wheel", () => { target = null; }, { passive: true });
  grid.addEventListener("keydown", event => {
    if (event.target !== grid || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(grid);
  window.addEventListener("resize", resize);

  return {
    setItems(nextItems) {
      items = shuffleTestimonials(nextItems);
      active = 0;
      render();
    }
  };
}
