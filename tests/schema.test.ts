import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { moduleOptions } from "../src/access/rbac";
import { Pages } from "../src/collections/Pages";
import { RoleModuleVisibility } from "../src/globals/RoleModuleVisibility";

const expectedPageBlocks = [
  "home-hero",
  "hero",
  "ctaForm",
  "eftmra-hero",
  "eftmra-trust-strip",
  "eftmra-explainer",
  "eftmra-certification",
  "eftmra-pathway",
  "eftmra-courses",
  "eftmra-practitioners",
  "eftmra-testimonials",
  "eftmra-final-cta",
  "eftmra-page-header",
  "eftmra-card-grid",
  "eftmra-content-section",
  "eftmra-media-row",
  "eftmra-contact-section",
  "eftmra-profile-hero",
  "eftmra-reviews",
  "eftmra-training-detail",
  "eftmra-lineage",
  "eftmra-practitioner-registration",
  "eftmra-testimonial-listing",
  "eftmra-trainer-listing",
];

function pageLayoutField() {
  const field = Pages.fields?.find((item) => "name" in item && item.name === "layout");
  assert.ok(field && "blocks" in field, "Pages.layout block field was not found");
  return field;
}

describe("Payload page builder schema", () => {
  it("keeps every expected page-builder block registered", () => {
    const field = pageLayoutField();
    const slugs = field.blocks.map((block) => block.slug).sort();

    assert.deepEqual(slugs, [...expectedPageBlocks].sort());
  });

  it("uses unique block slugs so render mapping stays deterministic", () => {
    const field = pageLayoutField();
    const slugs = field.blocks.map((block) => block.slug);

    assert.equal(new Set(slugs).size, slugs.length);
  });
});

describe("Role module visibility global", () => {
  it("exposes one permission module option per RBAC module", () => {
    const fieldText = JSON.stringify(RoleModuleVisibility.fields);

    for (const { value } of moduleOptions) {
      assert.match(fieldText, new RegExp(`"value":"${value}"`), `${value} is missing from role module visibility`);
    }
  });
});
