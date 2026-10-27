import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const domain = "https://julerothe.com/";
const routes = [
  { file: "index.html", url: domain, lang: "de", title: "Tätowiererin in Leipzig" },
  { file: "en/index.html", url: domain + "en/", lang: "en", title: "Tattoo Artist in Leipzig" },
  { file: "impressum.html", url: domain + "impressum.html", lang: "de" },
  { file: "en/impressum.html", url: domain + "en/impressum.html", lang: "en" },
  { file: "datenschutz.html", url: domain + "datenschutz.html", lang: "de" },
  { file: "en/datenschutz.html", url: domain + "en/datenschutz.html", lang: "en" }
];
const read = file => readFile("dist/" + file, "utf8");
const xml = await read("sitemap.xml");
const robots = await read("robots.txt");
assert.ok(robots.includes("Sitemap: " + domain + "sitemap.xml"));
for (const route of routes) {
  const html = await read(route.file);
  assert.match(html, new RegExp('<html lang="' + route.lang + '"'));
  assert.ok(html.includes('<link rel="canonical" href="' + route.url + '">'), route.file + " canonical");
  assert.ok(html.includes('property="og:url" content="' + route.url + '"'), route.file + " OG URL");
  assert.ok(html.includes('name="twitter:card" content="summary"'), route.file + " Twitter card");
  assert.ok(xml.includes("<loc>" + route.url + "</loc>"), route.file + " sitemap");
  assert.ok(html.includes('hreflang="de" href="' + domain + route.url.slice(domain.length).replace(/^en\//, "") + '"') || html.includes('hreflang="de" href="' + domain + '"'));
  assert.ok(html.includes('hreflang="en" href="' + domain + "en/" + route.url.slice(domain.length).replace(/^en\//, "") + '"'));
  if (route.title) {
    assert.ok(html.includes(route.title), "Title not localized " + route.file);
    assert.ok(html.includes("application/ld+json"), "Missing structured data " + route.file);
    assert.ok(html.includes("assets/works/"), "Gallery not pre-rendered " + route.file);
    assert.ok(!html.includes("Jule Rothe – Electric Avenue. Arbeiten, Newsletter und Kontakt."), "Old SEO description");
  }
  if (route.lang === "en") {
    assert.ok(html.includes('src="../i18n.js"') || html.includes('src="../main.js"'), "English asset prefix " + route.file);
    assert.ok(html.includes('href="../' + (route.file === "en/index.html" ? "" : route.file.slice(3)) + '" data-lang-switch="de"'), "German switch " + route.file);
  } else {
    assert.ok(html.includes('href="./en/' + (route.file === "index.html" ? "" : route.file) + '" data-lang-switch="en"'), "English switch " + route.file);
  }
}
assert.ok(xml.match(/<loc>/g)?.length === routes.length, "Sitemap page count");
// File names are intentionally independent from image content and can be renamed.
// The build sorts by metadata.order, with reverse filename sorting as fallback.
const metadata = JSON.parse(await readFile("assets/works/metadata.json", "utf8"));
const imageFiles = (await readdir("assets/works"))
  .filter(name => /\.(?:avif|jpe?g|png|webp|gif)$/i.test(name));
const rank = name => Number.isFinite(metadata[name]?.order)
  ? metadata[name].order : Number.MAX_SAFE_INTEGER;
const expectedImageNames = imageFiles.sort((a, b) => rank(a) - rank(b) || b.localeCompare(a, "de"));
const gallery = JSON.parse(await read("gallery.json"));
assert.ok(Array.isArray(gallery.works), "Gallery JSON must contain works");
const actualImageNames = gallery.works.map(work => {
  assert.ok(typeof work.src === "string" && work.src.startsWith("./assets/works/"), "Invalid gallery asset path");
  return decodeURIComponent(work.src.slice("./assets/works/".length));
});
assert.deepEqual(actualImageNames, expectedImageNames, "Gallery order must match metadata.order and available image files");
assert.equal(new Set(actualImageNames).size, actualImageNames.length, "Gallery must not contain duplicate images");
assert.ok(gallery.works.every(work => !Object.hasOwn(work, "title") && !Object.hasOwn(work, "category")), "Gallery JSON must contain no visible captions");
for (const work of gallery.works) {
  for (const lang of ["de", "en"]) {
    const alt = typeof work.alt === "string" ? work.alt : (work.alt?.[lang] ?? work.alt?.de);
    assert.ok(typeof alt === "string" && alt.trim(), "Missing " + lang + " image alt text: " + work.src);
  }
}
const de = await read("index.html");
const en = await read("en/index.html");
// Both localized pages must resolve the hero to the same existing root asset.
const heroSrc = html => {
  const match = html.match(/<div class="hero-media">[\s\S]*?<img[^>]*\bsrc="([^"]+)"/);
  assert.ok(match, "Hero image missing");
  return match[1];
};
const deHero = heroSrc(de);
const enHero = heroSrc(en);
assert.ok(deHero.startsWith("./assets/hero/"), "German hero must use root-level assets");
assert.equal(enHero, "../" + deHero.slice(2), "English hero path must point to shared assets");
await readFile("dist/" + deHero.slice(2)); // Asset must exist in the production output.
assert.ok(!en.includes('src="./assets/'), "English images cannot reference /en/assets/");
assert.ok(!en.includes('href="./assets/'), "English asset links cannot reference /en/assets/");
const staticWorks = (markup, prefix) => [...markup.matchAll(new RegExp('<img src="' + prefix + 'assets/works/([^"]+)"', "g"))].map(match => match[1]);
const firstFour = gallery.works.slice(0, 4).map(work => work.src.slice("./assets/works/".length));
assert.deepEqual(staticWorks(de, "./"), firstFour, "German pre-rendered gallery order must match gallery.json");
assert.deepEqual(staticWorks(en, "../"), firstFour, "English pre-rendered gallery order must match gallery.json");
for (const html of [de, en]) {
  assert.ok(!html.includes('class="work-title"') && !html.includes('class="work-category"'), "No visible captions in pre-rendered gallery");
  assert.ok(!html.includes('id="lightbox-caption"'), "Lightbox must have no visible caption");
}
const browserJs = await readFile("main.js", "utf8");
assert.ok(!browserJs.includes('className = "work-title"') && !browserJs.includes('className = "work-category"'), "Browser gallery must not render captions");

assert.ok(de.includes("Meine Arbeiten") && en.includes("My Work"), "Pre-rendering localized content");
assert.ok(de.includes("Deine Fragen, Ideen und Anfragen") && en.includes("Your Questions, Ideas and Enquiries"), "Content translations");
assert.ok(en.includes('src="../main.js"'), "EN scripts");
assert.ok(en.includes('href="../styles.css"'), "EN CSS");
const privacy = await read("en/datenschutz.html");
assert.ok(privacy.includes("Privacy Notice"), "Localized privacy notice");
console.log("SEO validation passed: six localized pages, canonical/hreflang, metadata, gallery, sitemap and robots.txt.");
