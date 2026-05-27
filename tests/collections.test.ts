import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CollectionConfig, GlobalConfig } from "payload";

import { Categories } from "../src/collections/Categories";
import { EmailAccounts } from "../src/collections/EmailAccounts";
import { EmailTemplates } from "../src/collections/EmailTemplates";
import { Gallery } from "../src/collections/Gallery";
import { Leads } from "../src/collections/Leads";
import { Media } from "../src/collections/Media";
import { Pages } from "../src/collections/Pages";
import { Posts } from "../src/collections/Posts";
import { PractitionerContacts } from "../src/collections/PractitionerContacts";
import { PractitionerRegistrations } from "../src/collections/PractitionerRegistrations";
import { PractitionerReviews } from "../src/collections/PractitionerReviews";
import { Practitioners } from "../src/collections/Practitioners";
import { RoleManagement } from "../src/collections/RoleManagement";
import { Sites } from "../src/collections/Sites";
import { Testimonials } from "../src/collections/Testimonials";
import { TrainerContacts } from "../src/collections/TrainerContacts";
import { TrainingRegistrations } from "../src/collections/TrainingRegistrations";
import { TrainingReviews } from "../src/collections/TrainingReviews";
import { Trainings } from "../src/collections/Trainings";
import { Users } from "../src/collections/Users";
import { EmailSettings } from "../src/globals/EmailSettings";
import { Footer } from "../src/globals/Footer";
import { Header } from "../src/globals/Header";
import { RoleModuleVisibility } from "../src/globals/RoleModuleVisibility";

const collections: CollectionConfig[] = [
  Categories,
  EmailAccounts,
  EmailTemplates,
  Gallery,
  Leads,
  Media,
  Pages,
  Posts,
  PractitionerContacts,
  PractitionerRegistrations,
  PractitionerReviews,
  Practitioners,
  RoleManagement,
  Sites,
  Testimonials,
  TrainerContacts,
  TrainingRegistrations,
  TrainingReviews,
  Trainings,
  Users,
];

const globals: GlobalConfig[] = [EmailSettings, Footer, Header, RoleModuleVisibility];

function fieldNames(config: CollectionConfig | GlobalConfig) {
  const names = new Set<string>();
  const visit = (fields: NonNullable<(CollectionConfig | GlobalConfig)["fields"]>) => {
    for (const field of fields) {
      if ("name" in field && typeof field.name === "string") {
        names.add(field.name);
      }

      if ("fields" in field && Array.isArray(field.fields)) {
        visit(field.fields as NonNullable<(CollectionConfig | GlobalConfig)["fields"]>);
      }

      if ("tabs" in field && Array.isArray(field.tabs)) {
        for (const tab of field.tabs) {
          if (Array.isArray(tab.fields)) {
            visit(tab.fields as NonNullable<(CollectionConfig | GlobalConfig)["fields"]>);
          }
        }
      }
    }
  };

  visit(config.fields ?? []);
  return names;
}

describe("Payload collection configuration", () => {
  it("uses unique collection slugs", () => {
    const slugs = collections.map((collection) => collection.slug);

    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("defines at least one field for every collection", () => {
    for (const collection of collections) {
      assert.ok(collection.fields?.length, `${collection.slug} does not define fields`);
    }
  });

  it("keeps primary content collections tied to sites", () => {
    for (const collection of [Pages, Practitioners, Trainings, Testimonials, Gallery]) {
      assert.ok(fieldNames(collection).has("site"), `${collection.slug} must include a site relationship`);
    }
  });

  it("keeps form-backed collections with expected submission fields", () => {
    assert.ok(fieldNames(Leads).has("email"));
    assert.ok(fieldNames(EmailAccounts).has("provider"));
    assert.ok(fieldNames(EmailTemplates).has("subject"));
    assert.ok(fieldNames(EmailTemplates).has("toEmail"));
    assert.ok(fieldNames(PractitionerContacts).has("email"));
    assert.ok(fieldNames(PractitionerRegistrations).has("email"));
    assert.ok(fieldNames(TrainingRegistrations).has("email"));
    assert.ok(fieldNames(PractitionerReviews).has("rating"));
    assert.ok(fieldNames(TrainingReviews).has("rating"));
  });
});

describe("Payload global configuration", () => {
  it("uses unique global slugs", () => {
    const slugs = globals.map((global) => global.slug);

    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("defines fields for every global", () => {
    for (const global of globals) {
      assert.ok(global.fields?.length, `${global.slug} does not define fields`);
    }
  });
});
