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
  menuButton.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
});
navigation?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Menü öffnen");
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});

const openLightbox = (work, src) => {
  if (typeof lightbox?.showModal !== "function") {
    window.open(src, "_blank", "noopener,noreferrer");
    return;
  }
  lightboxImage.src = src;
  lightboxImage.alt = work.alt || work.title || "Tattoo-Arbeit";
  lightboxCaption.textContent = work.title || "";
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
    button.setAttribute("aria-label", (work.title || "Tattoo-Arbeit") + " vergrößern");
    const picture = document.createElement("img");
    picture.src = src;
    picture.alt = work.alt || work.title || "Tattoo-Arbeit";
    picture.loading = "lazy";
    button.append(picture);
    button.addEventListener("click", () => openLightbox(work, src));
    article.append(button);
    if (work.title) {
      const title = document.createElement("span");
      title.className = "work-title";
      title.textContent = work.title;
      article.append(title);
    }
    if (work.category) {
      const category = document.createElement("span");
      category.className = "work-category";
      category.textContent = work.category;
      article.append(category);
    }
    galleryGrid.append(article);
  }
  viewAllButton.hidden = allWorks.length <= 4;
  viewAllButton.innerHTML = showAllWorks ? 'Weniger Arbeiten <span aria-hidden="true">↑</span>' : 'Alle Arbeiten ansehen <span aria-hidden="true">→</span>';
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
    console.warn("Die Galerie konnte nicht geladen werden:", error);
  }
}
loadGallery();

const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
contactForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const endpoint = String(config.contactEndpoint || "").trim();
  if (!endpoint || !/^https:\/\/formspree\.io\/f\/[\w-]+$/.test(endpoint)) {
    contactStatus.textContent = "Das Kontaktformular ist noch nicht eingerichtet.";
    return;
  }
  if (contactForm.elements._gotcha?.value) return;
  const button = contactForm.querySelector('button[type="submit"]');
  button.disabled = true;
  contactStatus.textContent = "Nachricht wird gesendet …";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {Accept:"application/json"}
    });
    if (!response.ok) throw new Error("Submission failed");
    contactForm.reset();
    contactStatus.textContent = "Vielen Dank. Deine Nachricht wurde versendet.";
  } catch {
    contactStatus.textContent = "Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.";
  } finally {
    button.disabled = false;
  }
});

const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatus = document.getElementById("newsletter-status");
const newsletterAction = String(config.newsletterAction || "").trim();
if (newsletterForm && /^https:\/\//i.test(newsletterAction)) {
  newsletterForm.action = newsletterAction;
  const email = newsletterForm.querySelector("#newsletter-email");
  if (email) email.name = config.newsletterEmailField || "EMAIL";
}
newsletterForm?.addEventListener("submit", event => {
  if (!newsletterAction || !/^https:\/\//i.test(newsletterAction)) {
    event.preventDefault();
    newsletterStatus.textContent = "Die Newsletter-Anmeldung ist noch nicht eingerichtet.";
    return;
  }
  newsletterStatus.textContent = "Bitte schließe die Anmeldung im geöffneten Fenster ab.";
});
