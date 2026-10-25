const fallbackLanguage = "de";
const languages = new Set(["de", "en"]);
const params = new URLSearchParams(window.location.search);
const queryLanguage = params.get("lang");
const pathIsEnglish = /\/en\/(?:index\.html|impressum\.html|datenschutz\.html)?$/.test(window.location.pathname);
const pageLanguage = pathIsEnglish ? "en" : fallbackLanguage;
const currentFilename = window.location.pathname.split("/").pop();
const pageFilename = !currentFilename || currentFilename === "index.html" ? "" : currentFilename;
const siteRoot = new URL(pathIsEnglish ? "../" : "./", window.location.href);

function pageUrl(language) {
  return new URL((language === "en" ? "en/" : "") + pageFilename, siteRoot);
}

// Backward compatibility for links that used ?lang=de or ?lang=en.
if (languages.has(queryLanguage) && queryLanguage !== pageLanguage) {
  const target = pageUrl(queryLanguage);
  for (const [key, value] of params) if (key !== "lang") target.searchParams.append(key, value);
  target.hash = window.location.hash;
  window.location.replace(target.href);
}

async function loadDictionary(language) {
  const response = await fetch(new URL("./locales/" + language + ".json", import.meta.url));
  if (!response.ok) throw new Error("Translation load failed: " + language);
  return response.json();
}

async function initializeI18n() {
  let base = {};
  let translated = {};
  let language = pageLanguage;
  try {
    base = await loadDictionary(fallbackLanguage);
    if (pageLanguage !== fallbackLanguage) translated = await loadDictionary(pageLanguage);
  } catch (error) {
    console.warn("Translation files unavailable. Keeping pre-rendered page text.", error);
    // Build output already contains localized text in the original HTML.
  }
  const dictionary = { ...base, ...translated };
  const t = key => dictionary[key] ?? base[key] ?? key;
  document.documentElement.lang = language;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const text = t(element.dataset.i18n);
    if (text !== element.dataset.i18n) element.textContent = text;
  }
  const attributes = {
    "data-i18n-placeholder": "placeholder",
    "data-i18n-aria-label": "aria-label",
    "data-i18n-content": "content",
    "data-i18n-title": "title"
  };
  for (const [dataAttribute, attribute] of Object.entries(attributes)) {
    for (const element of document.querySelectorAll("[" + dataAttribute + "]")) {
      const key = element.getAttribute(dataAttribute);
      const text = t(key);
      if (text !== key) element.setAttribute(attribute, text);
    }
  }
  document.title = t(document.body.dataset.pageTitle || "page.title");

  // Links to legal pages retain their current language.
  for (const anchor of document.querySelectorAll("a[data-localized-link]")) {
    const target = new URL(anchor.getAttribute("href"), window.location.href);
    target.searchParams.delete("lang");
    anchor.href = target.href;
  }

  // Language switching preserves the page, extra query parameters and the fragment.
  for (const anchor of document.querySelectorAll("[data-lang-switch]")) {
    const nextLanguage = anchor.dataset.langSwitch;
    const target = pageUrl(nextLanguage);
    for (const [key, value] of params) if (key !== "lang") target.searchParams.append(key, value);
    target.hash = window.location.hash;
    anchor.href = target.href;
    if (nextLanguage === language) anchor.setAttribute("aria-current", "true");
    else anchor.removeAttribute("aria-current");
  }
  return { language, t };
}

export const i18nReady = initializeI18n();
