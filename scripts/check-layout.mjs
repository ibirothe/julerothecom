import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const order = ["start", "arbeiten", "newsletter", "testimonials", "kontakt", "faq"];
const markerOf = id => {
  const matches = [...html.matchAll(new RegExp('\\bid="' + id + '"', "g"))];
  assert.equal(matches.length, 1, `Section ${id} should appear exactly once`);
  return matches[0].index;
};
const positions = order.map(markerOf);
for (let index = 1; index < positions.length; index++) {
  assert.ok(positions[index] > positions[index - 1], `Wrong section order: ${order[index]}`);
}
const nav = html.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
const footer = html.match(/<nav class="footer-nav"[^>]*>([\s\S]*?)<\/nav>/);
assert.ok(nav && footer, "Both navigations must be present");
const expected = ["start", "works", "newsletter", "testimonials", "contact", "faq"];
const navKeys = markup => [...markup.matchAll(/<a\b[^>]*data-i18n="navigation\.([a-z]+)"/g)].map(m => m[1]);
assert.deepEqual(navKeys(nav[1]), expected, "Header navigation order must match requested sections");
assert.deepEqual(navKeys(footer[1]), expected, "Footer navigation order must match requested sections");
assert.ok(!html.includes('id="ueber"') && !html.includes('href="#ueber"'), "About section must be removed");
assert.ok(!html.includes('notice-band'), "Notice band must be removed");
assert.ok(html.includes('data-form="7ca9f130-cfae-11f1-86da-f5e17363f70f"'), "EmailOctopus embed must be kept");
assert.ok(html.includes('id="contact-form"'), "Contact form must be kept");
assert.ok(html.includes('id="faq-list"'), "FAQ content must be kept");
assert.ok(html.includes('id="testimonials-grid"'), "Testimonials content must be kept");
assert.ok(html.includes('class="brand brand-header"'), "Header must include the branded lockup");
assert.ok(html.includes('class="brand-mark" aria-hidden="true"'), "Decorative brand mark must be hidden from screen readers");
assert.ok(html.includes('class="brand-wordmark"'), "Brand name and subtitle must remain visible");
await access("assets/brand/jule-mark.svg");
console.log("Page structure validated: " + order.join(" → "));
