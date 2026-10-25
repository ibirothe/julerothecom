import { cp, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "dist");
const worksDir = path.join(root, "assets", "works");
const domain = "https://julerothe.com";
const languages = ["de", "en"];
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const pages = [
  { source: "index.html", filename: "", name: "home", titleKey: "page.title", descriptionKey: "page.description" },
  { source: "impressum.html", filename: "impressum.html", name: "imprint", titleKey: "legal.imprint.title", descriptionKey: "legal.imprint.metaDescription" },
  { source: "datenschutz.html", filename: "datenschutz.html", name: "privacy", titleKey: "legal.privacy.title", descriptionKey: "legal.privacy.metaDescription" }
];

const dictionaries = Object.fromEntries(await Promise.all(languages.map(async lang => [
  lang, JSON.parse(await readFile(path.join(root, "locales", lang + ".json"), "utf8"))
])));
const tr = (lang, key) => dictionaries[lang][key] ?? dictionaries.de[key] ?? key;
const escapeHTML = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = value => escapeHTML(value).replace(/"/g, "&quot;");
const urlFor = (lang, page) => domain + "/" + (lang === "en" ? "en/" : "") + page.filename;

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const file of ["styles.css", "main.js", "i18n.js", "site-config.js", "favicon.svg"]) {
  await copyFile(path.join(root, file), path.join(target, file));
}
for (const dir of ["assets", "locales", "content"]) {
  await cp(path.join(root, dir), path.join(target, dir), { recursive: true });
}

let metadata = {};
try {
  metadata = JSON.parse(await readFile(path.join(worksDir, "metadata.json"), "utf8"));
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) metadata = {};
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const filenames = (await readdir(worksDir, { withFileTypes: true }))
  .filter(entry => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
  .map(entry => entry.name)
  .sort((a, b) => {
    const rank = name => Number.isFinite(metadata[name]?.order) ? metadata[name].order : Number.MAX_SAFE_INTEGER;
    return rank(a) - rank(b) || b.localeCompare(a, "de");
  });

const translatedField = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const out = {};
    for (const lang of languages) if (typeof value[lang] === "string") out[lang] = value[lang];
    return Object.keys(out).length ? out : fallback;
  }
  return fallback;
};
const gallery = filenames.map(name => {
  const details = metadata[name] || {};
  const fallback = path.parse(name).name.replace(/^\d{4}-\d{2}-\d{2}[-_]?/, "").replace(/[-_]+/g, " ").trim();
  return {
    src: "./assets/works/" + encodeURIComponent(name),
    title: translatedField(details.title, fallback || "Tattoo-Arbeit"),
    alt: translatedField(details.alt, translatedField(details.title, fallback || "Tattoo-Arbeit")),
    category: translatedField(details.category)
  };
});
await writeFile(path.join(target, "gallery.json"), JSON.stringify({ works: gallery }, null, 2) + "\n");
const fieldFor = (value, lang) =>
  typeof value === "string" ? value : (value && (value[lang] || value.de)) || "";

function renderGallery(html, lang) {
  if (!gallery.length) return html;
  const assetPrefix = lang === "en" ? "../" : "./";
  const cards = gallery.slice(0, 4).map(work => {
    const image = assetPrefix + work.src.slice(2);
    const title = fieldFor(work.title, lang);
    const alt = fieldFor(work.alt, lang) || title;
    const category = fieldFor(work.category, lang);
    return '            <article class="work-card">' +
      '<a class="work-open" href="' + escapeAttr(image) + '" target="_blank" rel="noopener" aria-label="' + escapeAttr(title + " " + tr(lang, "works.zoom")) + '">' +
      '<img src="' + escapeAttr(image) + '" alt="' + escapeAttr(alt) + '" loading="lazy" decoding="async"></a>' +
      (title ? '<span class="work-title">' + escapeHTML(title) + '</span>' : "") +
      (category ? '<span class="work-category">' + escapeHTML(category) + '</span>' : "") +
      '</article>';
  }).join("\n");
  const pattern = /(<div class="works-grid" id="works-grid" aria-live="polite">)[\s\S]*?(\n          <\/div>\s*\n          <p class="works-message")/;
  if (!pattern.test(html)) throw new Error("Cannot find the gallery container");
  return html.replace(pattern, (_match, open, close) => open + "\n" + cards + close);
}

function renderPage(source, lang, page) {
  const isEnglish = lang === "en";
  let html = source.replace(/<html lang="[^"]*">/, '<html lang="' + lang + '">');
  // Render visible translations at build time, without requiring JavaScript from crawlers.
  html = html.replace(/<([a-z][a-z0-9-]*)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag, attributes, key) => '<' + tag + attributes + '>' + escapeHTML(tr(lang, key)) + '</' + tag + '>');
  html = html.replace(/<[^>]+>/g, tag => {
    for (const [dataAttribute, realAttribute] of [
      ["data-i18n-placeholder", "placeholder"],
      ["data-i18n-aria-label", "aria-label"],
      ["data-i18n-content", "content"],
      ["data-i18n-title", "title"]
    ]) {
      const match = tag.match(new RegExp(dataAttribute + '="([^"]+)"'));
      if (match) {
        const value = escapeAttr(tr(lang, match[1]));
        const attributePattern = new RegExp('(?:^|\\s)' + realAttribute + '="[^"]*"');
        if (attributePattern.test(tag)) tag = tag.replace(attributePattern, ' ' + realAttribute + '="' + value + '"');
      }
    }
    return tag;
  });

  const title = tr(lang, page.titleKey);
  const description = tr(lang, page.descriptionKey);
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHTML(title) + '</title>');
  if (page.name === "imprint") html = html.replace(/<title>/,
    '<meta name="description" content="' + escapeAttr(description) + '">\n<title>');
  if (page.name === "home") html = renderGallery(html, lang);
  if (isEnglish) {
    html = html.replace(/((?:src|href)=")\.\/(styles\.css|main\.js|i18n\.js|site-config\.js|favicon\.svg)"/g, '$1../$2"');
  }
  // Static language links and local legal links also work without JavaScript.
  html = html.replace(/<a\b[^>]*data-lang-switch="(de|en)"[^>]*>/g, (tag, targetLang) => {
    const prefix = isEnglish ? (targetLang === "en" ? "./" : "../") : (targetLang === "en" ? "./en/" : "./");
    const link = prefix + page.filename;
    return tag.replace(/href="[^"]*"/, 'href="' + link + '"')
      .replace(/aria-current="true"/, targetLang === lang ? 'aria-current="true"' : "");
  });
  if (page.name !== "home") {
    html = html.replace(/href="\.\/index\.html"(?=\s+data-localized-link)/g, 'href="./"');
  }
  const canonical = urlFor(lang, page);
  const deUrl = urlFor("de", page);
  const enUrl = urlFor("en", page);
  const seo = [
    '<link rel="canonical" href="' + canonical + '">',
    '<link rel="alternate" hreflang="de" href="' + deUrl + '">',
    '<link rel="alternate" hreflang="en" href="' + enUrl + '">',
    '<link rel="alternate" hreflang="x-default" href="' + deUrl + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Jule Rothe">',
    '<meta property="og:locale" content="' + (isEnglish ? "en_GB" : "de_DE") + '">',
    '<meta property="og:locale:alternate" content="' + (isEnglish ? "de_DE" : "en_GB") + '">',
    '<meta property="og:title" content="' + escapeAttr(title) + '">',
    '<meta property="og:description" content="' + escapeAttr(description) + '">',
    '<meta property="og:url" content="' + canonical + '">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + escapeAttr(title) + '">',
    '<meta name="twitter:description" content="' + escapeAttr(description) + '">'
  ];
  if (page.name === "home") {
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": domain + "/#jule-rothe",
      name: "Jule Rothe",
      url: domain + "/",
      jobTitle: isEnglish ? "Tattoo artist" : "Tätowiererin",
      sameAs: ["https://www.instagram.com/julerothe/"],
      workLocation: {
        "@type": "Place",
        name: "Electric Avenue",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Wolfgang-Heinze-Straße 16",
          postalCode: "04277",
          addressLocality: "Leipzig",
          addressCountry: "DE"
        }
      }
    };
    seo.push('<script type="application/ld+json">' + JSON.stringify(person).replace(/</g, "\\u003c") + '</script>');
  }
  if (!html.includes("</head>")) throw new Error("Missing head in " + page.source);
  return html.replace("</head>", '  ' + seo.join("\n  ") + "\n</head>");
}

for (const page of pages) {
  const source = await readFile(path.join(root, page.source), "utf8");
  for (const lang of languages) {
    const subdir = lang === "en" ? "en" : "";
    const directory = path.join(target, subdir);
    await mkdir(directory, { recursive: true });
    const outputName = page.filename || "index.html";
    await writeFile(path.join(directory, outputName), renderPage(source, lang, page));
  }
}
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];
for (const page of pages) for (const lang of languages) {
  sitemap.push('  <url><loc>' + escapeHTML(urlFor(lang, page)) + '</loc></url>');
}
sitemap.push("</urlset>");
await writeFile(path.join(target, "sitemap.xml"), sitemap.join("\n") + "\n");
await writeFile(path.join(target, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: " + domain + "/sitemap.xml\n");
console.log("Website erstellt: " + target + " | " + gallery.length +
  " Galerie-Bilder | " + (pages.length * languages.length) + " lokalisierte HTML-Seiten");
