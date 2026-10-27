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
  lightboxImage.alt = localized(work.alt, t("works.defaultTitle"));
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
    button.setAttribute("aria-label", localized(work.alt, t("works.defaultTitle")) + " " + t("works.zoom"));
    const picture = document.createElement("img");
    picture.src = src;
    picture.alt = localized(work.alt, localized(work.title, t("works.defaultTitle")));
    picture.loading = "lazy";
    button.append(picture);
    button.addEventListener("click", () => openLightbox(work, src));
    article.append(button);
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

const faqList = document.getElementById("faq-list");
const faqStatus = document.getElementById("faq-status");
const faqUrl = new URL("./content/faq.json", import.meta.url);
function faqField(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (typeof value[language] === "string" && value[language].trim()) return value[language].trim();
    if (typeof value.de === "string") return value.de.trim();
  }
  return "";
}
async function loadFaq() {
  if (!faqList || !faqStatus) return;
  faqList.setAttribute("aria-busy", "true");
  faqStatus.textContent = t("faq.loading");
  try {
    const response = await fetch(faqUrl, {cache:"no-store"});
    if (!response.ok) throw new Error(`FAQ request failed: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("Invalid FAQ JSON");
    const usedIds = new Set();
    const items = data.items.filter(item => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(item.id) || usedIds.has(item.id)) return false;
      if (!faqField(item.question) || !faqField(item.answer)) return false;
      usedIds.add(item.id);
      return true;
    }).sort((a,b) => (Number.isFinite(a.order) ? a.order : 999999) - (Number.isFinite(b.order) ? b.order : 999999));

    faqList.replaceChildren();
    for (const item of items) {
      const details = document.createElement("details");
      details.className = "faq-item";
      details.dataset.faqId = item.id;
      const summary = document.createElement("summary");
      summary.className = "faq-question";
      const question = document.createElement("span");
      question.className = "faq-question-title";
      question.textContent = faqField(item.question);
      summary.append(question);
      const icon = document.createElement("span");
      icon.className = "faq-expand-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "+";
      summary.append(icon);

      const answer = document.createElement("div");
      answer.className = "faq-answer";
      const category = faqField(item.category);
      if (category) {
        const label = document.createElement("span");
        label.className = "faq-category";
        label.textContent = category;
        answer.append(label);
      }
      for (const paragraph of faqField(item.answer).split(/\n\s*\n/)) {
        if (!paragraph.trim()) continue;
        const p = document.createElement("p");
        p.textContent = paragraph.trim();
        answer.append(p);
      }
      details.append(summary, answer);
      faqList.append(details);
    }
    faqStatus.textContent = items.length ? "" : t("faq.empty");
  } catch (error) {
    console.warn(t("faq.error"), error);
    faqList.replaceChildren();
    faqStatus.textContent = t("faq.error");
  } finally {
    faqList.setAttribute("aria-busy", "false");
  }
}
loadFaq();

const testimonialsSection = document.getElementById("testimonials");
const testimonialsGrid = document.getElementById("testimonials-grid");
const testimonialsUrl = new URL("./content/testimonials.json", import.meta.url);

function testimonialField(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const translated = value[language];
    if (typeof translated === "string" && translated.trim()) return translated.trim();
    return typeof value.de === "string" ? value.de.trim() : "";
  }
  return "";
}

function validTestimonial(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(item.id)) return false;
  if (typeof item.firstName !== "string" || !item.firstName.trim()) return false;
  if (!testimonialField(item.quote)) return false;
  if (item.status !== "demo" && item.status !== "published") return false;
  // The JSON field is only an administrative check; keep consent evidence private.
  if (item.status === "published" && item.consentConfirmed !== true) return false;
  return true;
}

function avatarFilename(value) {
  if (typeof value !== "string" || value.length > 120) return "";
  if (!/^[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(value)) return "";
  return value;
}

async function loadTestimonials() {
  if (!testimonialsSection || !testimonialsGrid) return;
  testimonialsGrid.setAttribute("aria-busy", "true");
  try {
    const response = await fetch(testimonialsUrl, {cache:"no-store"});
    if (!response.ok) throw new Error(`Testimonials request failed: ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("Invalid testimonials JSON");
    const seenIds = new Set();
    const items = data.items.filter(item => {
      if (!validTestimonial(item) || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    }).sort((a,b) => (Number.isFinite(a.order) ? a.order : 999999) - (Number.isFinite(b.order) ? b.order : 999999));
    testimonialsGrid.replaceChildren();
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "testimonial-card";
      card.dataset.testimonialId = item.id;

      const mark = document.createElement("span");
      mark.className = "testimonial-card-quote-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "“";

      const quote = document.createElement("blockquote");
      quote.className = "testimonial-quote";
      quote.textContent = testimonialField(item.quote);

      const footer = document.createElement("div");
      footer.className = "testimonial-card-footer";
      const avatar = document.createElement("div");
      avatar.className = "testimonial-avatar";
      avatar.setAttribute("aria-hidden", "true");
      const imageName = avatarFilename(item.avatar);
      if (imageName) {
        const image = document.createElement("img");
        image.alt = "";
        image.loading = "lazy";
        image.src = new URL("./assets/testimonials/" + encodeURIComponent(imageName), import.meta.url).href;
        image.addEventListener("error", () => {
          image.remove();
          avatar.textContent = item.firstName.trim().charAt(0).toUpperCase();
        }, {once:true});
        avatar.append(image);
      } else {
        avatar.textContent = item.firstName.trim().charAt(0).toUpperCase();
      }
      const details = document.createElement("div");
      const name = document.createElement("p");
      name.className = "testimonial-card-name";
      name.textContent = item.firstName.trim();
      details.append(name);
      if (item.status === "demo") {
        const demoNote = document.createElement("div");
        demoNote.className = "testimonial-demo-note";
        demoNote.textContent = t("testimonials.demo");
        details.append(demoNote);
      }
      footer.append(avatar, details);
      card.append(mark, quote, footer);
      testimonialsGrid.append(card);
    }
    testimonialsSection.hidden = items.length === 0;
  } catch (error) {
    console.warn("Testimonials unavailable:", error);
    testimonialsGrid.replaceChildren();
    testimonialsSection.hidden = true;
  } finally {
    testimonialsGrid.setAttribute("aria-busy", "false");
  }
}
loadTestimonials();
