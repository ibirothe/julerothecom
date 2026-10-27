import assert from "node:assert/strict";
import {readFile, access} from "node:fs/promises";
import path from "node:path";

const doc=JSON.parse(await readFile("content/testimonials.json","utf8"));
assert.ok(doc && typeof doc==="object" && !Array.isArray(doc) && Array.isArray(doc.items),
  "content/testimonials.json must contain an items array");

async function check(items) {
  const seen=new Set();
  for(const [index,item] of items.entries()) {
    assert.ok(item && typeof item==="object" && !Array.isArray(item),
      `Item ${index} must be an object`);
    assert.ok(typeof item.id==="string" && /^[a-zA-Z0-9_-]+$/.test(item.id),
      `Invalid testimonial ID at item ${index}`);
    assert.ok(!seen.has(item.id),`Duplicate testimonial ID: ${item.id}`);
    seen.add(item.id);
    assert.ok(typeof item.firstName==="string" && item.firstName.trim(), `${item.id}: firstName is required`);
    assert.ok(["draft","demo","published"].includes(item.status), `${item.id}: invalid status (use draft, demo or published)`);
    if(item.status==="published")assert.equal(item.consentConfirmed,true,`${item.id}: verify documented consent first`);
    assert.ok(item.quote && typeof item.quote==="object"&&!Array.isArray(item.quote)&&typeof item.quote.de==="string"&&item.quote.de.trim(),
      `${item.id}: quote.de is required`);
    if(item.quote.en!==undefined)assert.ok(typeof item.quote.en==="string"&&item.quote.en.trim(),
      `${item.id}: quote.en must be nonempty if provided`);
    if(item.order!==undefined)assert.ok(typeof item.order==="number"&&Number.isFinite(item.order),
      `${item.id}: order must be a number`);
    if(item.avatar!==undefined){
      assert.ok(typeof item.avatar==="string" && /^[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(item.avatar),
        `${item.id}: avatar must be an image filename in assets/testimonials`);
      await access(path.join("assets","testimonials",item.avatar));
    }
  }
}
await check(doc.items);
await check([]);
console.log(`Testimonials validated: ${doc.items.length} entries, empty array supported.`);
