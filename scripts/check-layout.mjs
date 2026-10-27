import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
const newsletterEmbed = html.match(/<script async src="https:\/\/eocampaign1\.com\/form\/([0-9a-f-]+)\.js" data-form="([0-9a-f-]+)"><\/script>/);
assert.ok(newsletterEmbed && newsletterEmbed[1] === newsletterEmbed[2], "EmailOctopus embed must use a matching script URL and form ID");
assert.ok(html.includes('id="contact-form"'), "Contact form must be kept");
assert.ok(html.includes('id="faq-list"'), "FAQ content must be kept");
assert.ok(html.includes('id="testimonials-grid"'), "Testimonials content must be kept");
for (const id of ["testimonials-controls", "testimonials-progress", "testimonials-previous", "testimonials-next"]) {
  assert.ok(html.includes('id="' + id + '"'), "Missing carousel control: " + id);
}
assert.ok(html.includes('data-i18n-aria-label="testimonials.carousel"'), "Carousel region must have a localized accessible label");
const stylesheet = await readFile("styles.css", "utf8");
assert.match(stylesheet, /\.testimonials-grid\{[^}]*scroll-snap-type:x mandatory/, "Testimonials need CSS scroll snapping");
const javascript = await readFile("main.js", "utf8");
assert.ok(javascript.includes("function updateTestimonialCarousel()"), "Testimonials must update navigation on scroll and resize");
console.log("Page structure validated: " + order.join(" → "));
