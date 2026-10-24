import { cp, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "dist");
const worksDir = path.join(root, "assets", "works");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const file of ["index.html", "styles.css", "main.js", "i18n.js", "site-config.js", "favicon.svg", "impressum.html", "datenschutz.html"]) {
  await copyFile(path.join(root, file), path.join(target, file));
}
await cp(path.join(root, "assets"), path.join(target, "assets"), { recursive: true });
await cp(path.join(root, "locales"), path.join(target, "locales"), { recursive: true });
await cp(path.join(root, "content"), path.join(target, "content"), { recursive: true });

let metadata = {};
try {
  metadata = JSON.parse(await readFile(path.join(worksDir, "metadata.json"), "utf8"));
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) metadata = {};
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const files = (await readdir(worksDir, { withFileTypes: true }))
  .filter(entry => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
  .map(entry => entry.name)
  .sort((a, b) => b.localeCompare(a, "de"));

const works = files.map(name => {
  const details = metadata[name] || {};
  const fallback = path.parse(name).name.replace(/^\d{4}-\d{2}-\d{2}[-_]?/, "").replace(/[-_]+/g, " ").trim();
  // Metadata fields accept either a string or {de, en}.
  // Keep localized values intact in gallery.json for the client-side language switch.
  const translatedField = (value, fallbackValue = "") => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const out = {};
      for (const locale of ["de", "en"]) {
        if (typeof value[locale] === "string") out[locale] = value[locale];
      }
      return Object.keys(out).length ? out : fallbackValue;
    }
    return fallbackValue;
  };
  return {
    src: "./assets/works/" + encodeURIComponent(name),
    title: translatedField(details.title, fallback || "Tattoo-Arbeit"),
    alt: translatedField(details.alt, translatedField(details.title, fallback || "Tattoo-Arbeit")),
    category: translatedField(details.category)
  };
});

await writeFile(path.join(target, "gallery.json"), JSON.stringify({ works }, null, 2) + "\n");
console.log("Website erstellt: " + target + " | " + works.length + " Galerie-Bilder");
