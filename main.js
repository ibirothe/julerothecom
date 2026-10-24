import { i18nReady } from "./i18n.js";
const { t, language } = await i18nReady;
const config = window.JULE_SITE_CONFIG || {};
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const galleryGrid = document.getElementById("works-grid");
const viewAllButton = document.getElementById("view-all-works");
const worksMessage = document.getElementById("works-message");
const lightbox = document.getElementById("work-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const galleryUrl = new URL("./gallery.json", import.meta.url);

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", t(isOpen ? "menu.close" : "menu.open"));
});
navigation?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", t("menu.open"));
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});

const localized = (value, fallback = "") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return typeof value[language] === "string" ? value[language] : (typeof value.de === "string" ? value.de : fallback);
  }
  return typeof value === "string" && value.length ? value : fallback;
};

const openLightbox = (work, src) => {
  if (typeof lightbox?.showModal !== "function") {
    window.open(src, "_blank", "noopener,noreferrer");
    return;
  }
  lightboxImage.src = src;
  lightboxImage.alt = localized(work.alt, localized(work.title, t("works.defaultTitle")));
  lightboxCaption.textContent = localized(work.title);
  lightbox.showModal();
};
document.getElementById("lightbox-close")?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener("close", () => { lightboxImage.removeAttribute("src"); });

let allWorks = [];
let showAllWorks = false;
function renderWorks() {
  if (!allWorks.length) return;
  galleryGrid.replaceChildren();
  const displayed = showAllWorks ? allWorks : allWorks.slice(0, 4);
  for (const work of displayed) {
    const src = new URL(work.src, galleryUrl).href;
    const article = document.createElement("article");
    article.className = "work-card";
    const button = document.createElement("button");
    button.className = "work-open";
    button.type = "button";
    button.setAttribute("aria-label", localized(work.title, t("works.defaultTitle")) + " " + t("works.zoom"));
    const picture = document.createElement("img");
    picture.src = src;
    picture.alt = localized(work.alt, localized(work.title, t("works.defaultTitle")));
    picture.loading = "lazy";
    button.append(picture);
    button.addEventListener("click", () => openLightbox(work, src));
    article.append(button);
    if (work.title) {
      const title = document.createElement("span");
      title.className = "work-title";
      title.textContent = localized(work.title);
      article.append(title);
    }
    if (work.category) {
      const category = document.createElement("span");
      category.className = "work-category";
      category.textContent = localized(work.category);
      article.append(category);
    }
    galleryGrid.append(article);
  }
  viewAllButton.hidden = allWorks.length <= 4;
  viewAllButton.replaceChildren();
  const label = document.createElement("span");
  label.textContent = t(showAllWorks ? "works.less" : "works.more");
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = showAllWorks ? "↑" : "→";
  viewAllButton.append(label, arrow);
  worksMessage.textContent = "";
}
viewAllButton?.addEventListener("click", () => {
  showAllWorks = !showAllWorks;
  renderWorks();
  if (!showAllWorks) document.getElementById("arbeiten").scrollIntoView({behavior:"smooth"});
});

async function loadGallery() {
  try {
    const response = await fetch(galleryUrl, {cache:"no-store"});
    if (!response.ok) throw new Error("Gallery unavailable");
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.works)) throw new Error("Invalid gallery data");
    allWorks = payload.works.filter(work => work && typeof work.src === "string" && work.src.startsWith("./assets/works/"));
    if (allWorks.length) renderWorks();
    // Ohne echte Bilder bleiben bewusst die grauen Platzhalter sichtbar.
  } catch (error) {
    console.warn(t("works.galleryUnavailable"), error);
    worksMessage.textContent = t("works.galleryUnavailable");
  }
}
loadGallery();

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
contactForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const endpoint = String(config.contactEndpoint || "").trim();
  if (!endpoint || !/^https:\/\/formspree\.io\/f\/[\w-]+$/.test(endpoint)) {
    contactStatus.textContent = t("contact.unconfigured");
    return;
  }
  if (contactForm.elements._gotcha?.value) return;
  const button = contactForm.querySelector('button[type="submit"]');
  button.disabled = true;
  contactStatus.textContent = t("contact.sending");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {Accept:"application/json"}
    });
    if (!response.ok) throw new Error("Submission failed");
    contactForm.reset();
    contactStatus.textContent = t("contact.success");
  } catch {
    contactStatus.textContent = t("contact.failure");
  } finally {
    button.disabled = false;
  }
});
