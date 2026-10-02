import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Company service copy uses "we". Owner biographies and customer quotations
// are separate and must not be changed by a name-replacement sweep.
const files = [
  "components/ConsultationExpect.tsx", "components/CdaBuyingGuide.tsx", "app/book/layout.tsx",
  "app/hunter-douglas-coeur-d-alene/page.tsx", "lib/area-data.ts",
  "lib/product-data.ts", "lib/article-pathways.ts", "components/ExteriorShadeOptions.tsx",
];
const thirdPersonService = /\bMark (?:comes|brings|visits|handles|measures|looks|programs|can look)\b|\b(?:with|by) Mark\b|\bHe (?:brings|explains|looks)\b/;
for (const path of files) {
  assert.ok(!thirdPersonService.test(readFileSync(path, "utf8")), `${path}: third-person service copy returned`);
}
const consultation = readFileSync("components/ConsultationExpect.tsx", "utf8");
assert.ok(consultation.includes("We come to your home{where}."));
assert.ok(consultation.includes("We look at the windows, {samples},"));
assert.ok(consultation.includes("We bring exterior shade samples and assess the patio, covered deck, or window opening."));
assert.ok(consultation.includes("and explain what will actually work"));
assert.ok(!consultation.includes("brings samples"));
const reviews = readFileSync("components/CdaClientReviews.tsx", "utf8");
const originalReviewParagraphs = [
  "Mark made the whole experience seamless. He was very knowledgeable and professional. We could not be happier with the look and quality of product!",
  "Mark did an above and beyond job from beginning to end. Great customer service and installation, and we are very happy we decided to go with him. Highly recommended.",
  "We wanted Norman shutters installed and had a multitude of questions. He very patiently spent around two hours with us answering all our questions and making recommendations. He did all the legwork of making arrangements with the builders to get inside the house early to take measurements so that the shutters would be ready in time for before we moved in. He made excellent recommendations in reference to aesthetics, practical daily use of the shutters and from an installer's perspective as he does his own installs.",
  "In short, you can't go wrong with Mark."
];
for (const paragraph of originalReviewParagraphs) {
  assert.ok(reviews.includes(JSON.stringify(paragraph)), "A verbatim customer review changed");
}
console.log("PASS: company service copy uses we; consultation grammar and original customer review wording are preserved.");
