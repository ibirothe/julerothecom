import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = ["index.html", "impressum.html", "datenschutz.html"];
const locales = {};
for (const code of ["de", "en"]) {
  const content = await readFile(`locales/${code}.json`, "utf8");
  locales[code] = JSON.parse(content);
}
const de = new Set(Object.keys(locales.de));
const en = new Set(Object.keys(locales.en));
// English may intentionally omit a key: runtime falls back to German.
for (const key of en) assert.ok(de.has(key), `English translation has no German fallback: ${key}`);
const fallback = (key, translations) => translations[key] ?? locales.de[key] ?? key;
assert.equal(fallback("contact.success", {}), locales.de["contact.success"], "Fallback to German must work");

for (const file of source) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) {
    assert.ok(de.has(match[1]), `Unknown translation key in ${file}: ${match[1]}`);
  }
}
const js = await readFile("main.js", "utf8");
for (const match of js.matchAll(/\bt\("([^"]+)"\)/g)) {
  assert.ok(de.has(match[1]), `Unknown translation key in main.js: ${match[1]}`);
}
for (const [name, data] of Object.entries(locales)) {
  for (const [key, value] of Object.entries(data)) {
    assert.ok(typeof value === "string" && value.trim(), `Empty translation: ${name}:${key}`);
  }
}
console.log(`Translations validated: ${de.size} German keys, ${en.size} English overrides with German fallback.`);
