import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { shuffleTestimonials, circularIndex, carouselLabel } from "../testimonial-carousel.js";

const original = ["a", "b", "c", "d"];
assert.deepEqual(shuffleTestimonials(original, () => 0), ["b", "c", "d", "a"]);
assert.deepEqual(original, ["a", "b", "c", "d"], "Shuffling may not modify the source array");
assert.deepEqual(shuffleTestimonials([], () => 0), []);
assert.deepEqual(shuffleTestimonials(["a"], () => 0), ["a"]);
for (let i = -50; i <= 50; i++) {
  assert.equal(circularIndex(i, 9), ((i % 9) + 9) % 9);
}
assert.equal(carouselLabel(0, 2, 9), "01–02 / 09");
assert.equal(carouselLabel(8, 2, 9), "09–01 / 09");
assert.equal(carouselLabel(9, 1, 9), "01 / 09");
assert.equal(carouselLabel(-1, 1, 9), "09 / 09");
assert.equal(carouselLabel(0, 1, 0), "");

const browser = await readFile("testimonial-carousel.js", "utf8");
assert.ok(browser.includes("copy < (looping ? 3 : 1)"), "Use clone runway only when scrolling is needed");
assert.ok(browser.includes('card.setAttribute("aria-hidden", "true")'), "Hide duplicate cards from screen readers");
assert.ok(browser.includes('addEventListener("scrollend", settle)'), "Recentre after touch/trackpad scrolling");
assert.ok(browser.includes('addEventListener("keydown"'), "Keep keyboard navigation");
assert.ok(browser.includes("setTimeout(settle"), "Support browsers without scrollend");
console.log("Testimonial carousel: shuffle, circular indices and wraparound checks passed.");
