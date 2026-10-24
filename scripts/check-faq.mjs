import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const faq = JSON.parse(await readFile("content/faq.json","utf8"));
assert.ok(faq && typeof faq==="object" && !Array.isArray(faq) && Array.isArray(faq.items),
  "content/faq.json must contain an items array");

function validate(items) {
  const ids=new Set();
  for(const [index, item] of items.entries()) {
    assert.ok(item && typeof item==="object" && !Array.isArray(item), `FAQ item ${index} must be an object`);
    assert.ok(typeof item.id==="string" && /^[a-zA-Z0-9_-]+$/.test(item.id),
      `FAQ item ${index}: id must contain only letters, numbers, - or _`);
    assert.ok(!ids.has(item.id), `Duplicate FAQ id: ${item.id}`);
    ids.add(item.id);
    if(item.order!==undefined) assert.ok(typeof item.order==="number" && Number.isFinite(item.order),
      `FAQ ${item.id}: order must be a finite number`);
    for(const field of ["question","answer"]){
      const value=item[field];
      assert.ok(value && typeof value==="object" && !Array.isArray(value),
        `FAQ ${item.id}: ${field} must be a localized object`);
      assert.ok(typeof value.de==="string" && value.de.trim(),
        `FAQ ${item.id}: ${field}.de is mandatory`);
      if(value.en!==undefined) assert.ok(typeof value.en==="string" && value.en.trim(),
        `FAQ ${item.id}: ${field}.en must be nonempty if provided`);
    }
    if(item.category!==undefined) {
      const c=item.category;
      const stringOk=typeof c==="string"&&Boolean(c.trim());
      const localizedOk=c && typeof c==="object" && !Array.isArray(c) &&
        typeof c.de==="string"&&Boolean(c.de.trim()) &&
        (c.en===undefined||(typeof c.en==="string"&&Boolean(c.en.trim())));
      assert.ok(stringOk||localizedOk,`FAQ ${item.id}: invalid category`);
    }
  }
}
validate(faq.items);
validate([]); // Empty FAQ is a supported state.
console.log(`FAQ validated: ${faq.items.length} entries (empty array supported).`);
