const fallbackLanguage = "de";
const languages = new Set(["de", "en"]);
const queryLanguage = new URLSearchParams(window.location.search).get("lang");
const requestedLanguage = languages.has(queryLanguage) ? queryLanguage : fallbackLanguage;

async function loadDictionary(language) {
  const response = await fetch(new URL(`./locales/${language}.json`, import.meta.url));
  if (!response.ok) throw new Error(`Translation load failed: ${language}`);
  return response.json();
}

async function initializeI18n() {
  let base = {};
  let translated = {};
  let language = fallbackLanguage;
  try {
    base = await loadDictionary(fallbackLanguage);
    if (requestedLanguage !== fallbackLanguage) {
      translated = await loadDictionary(requestedLanguage);
      language = requestedLanguage;
    }
  } catch (error) {
    console.warn("Translation files unavailable. Falling back to German.", error);
    language = fallbackLanguage;
  }
  const dictionary = { ...base, ...translated };
  const t = (key) => dictionary[key] ?? base[key] ?? key;
  document.documentElement.lang = language;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const text = t(element.dataset.i18n);
    if (text !== element.dataset.i18n) element.textContent = text;
  }
  const attributes = {
    "data-i18n-placeholder":"placeholder",
    "data-i18n-aria-label":"aria-label",
    "data-i18n-content":"content",
    "data-i18n-title":"title"
  };
  for (const [dataAttribute, attribute] of Object.entries(attributes)) {
    for (const element of document.querySelectorAll(`[${dataAttribute}]`)) {
      const key = element.getAttribute(dataAttribute);
      const text = t(key);
      if (text !== key) element.setAttribute(attribute, text);
    }
  }
  document.title = t(document.body.dataset.pageTitle || "page.title");

  // Carry ?lang= through links to the legal pages and back.
  for (const anchor of document.querySelectorAll("a[data-localized-link]")) {
    const target = new URL(anchor.getAttribute("href"), window.location.href);
    target.searchParams.set("lang", language);
    anchor.href = target.href;
  }

  // Language links preserve the current path, other query parameters and hash.
  for (const anchor of document.querySelectorAll("[data-lang-switch]")) {
    const targetLanguage = anchor.dataset.langSwitch;
    const target = new URL(window.location.href);
    target.searchParams.set("lang", targetLanguage);
    anchor.href = target.href;
    if (targetLanguage === language) {
      anchor.setAttribute("aria-current", "true");
    } else {
      anchor.removeAttribute("aria-current");
    }
  }
  return { language, t };
}

export const i18nReady = initializeI18n();
