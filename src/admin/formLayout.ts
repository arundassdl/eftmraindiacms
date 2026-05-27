import type { CollectionConfig, Field } from "payload";

type FieldBucket = "publishing" | "organize" | "pricing" | "seo" | "main";

const sidebarFieldNames = new Set([
  "_status",
  "acceptedTerms",
  "availabilityMode",
  "category",
  "categoryKeys",
  "categories",
  "declarationAccepted",
  "displayOrder",
  "domain",
  "featured",
  "layoutType",
  "practitioner",
  "practitioners",
  "publishedAt",
  "role",
  "showInGalleryPage",
  "showOnHomepage",
  "site",
  "siteSlug",
  "slug",
  "status",
  "submittedAt",
  "training",
  "type",
]);

const pricingFieldNames = new Set(["price", "priceNote", "sessionFee"]);

const mediaFieldNames = new Set([
  "authorImage",
  "certificateFileName",
  "certificates",
  "featuredImage",
  "featuredImageAlt",
  "featuredImageExternalUrl",
  "file",
  "galleryVideoUrl",
  "image",
  "imageAlt",
  "logoImage",
  "posterImage",
  "posterImageAlt",
  "profilePhotoFileName",
  "thumbnailAlt",
  "thumbnailImage",
  "trainerImage",
  "trainerImageAlt",
  "venueImage",
  "venueImageAlt",
]);

const contactFieldNames = new Set(["email", "facebook", "instagram", "linkedin", "phone", "website", "whatsapp"]);

const logisticsFieldNames = new Set([
  "availability",
  "availabilityEnd",
  "availabilityStart",
  "availabilityText",
  "city",
  "cityKey",
  "cityLabel",
  "cityText",
  "country",
  "dateText",
  "endDate",
  "format",
  "hours",
  "monthKey",
  "monthLabel",
  "modeOfPractice",
  "schedule",
  "scheduleDays",
  "source",
  "startDate",
  "state",
  "venue",
  "venueAddress",
  "venueName",
  "venueNotes",
]);

const seoFieldNames = new Set(["canonicalPath", "readTime", "seoDescription", "seoTitle"]);

function getFieldName(field: Field): string | undefined {
  return "name" in field && typeof field.name === "string" ? field.name : undefined;
}

function getFieldBucket(field: Field): FieldBucket {
  const name = getFieldName(field);

  if (!name) return "main";
  if (seoFieldNames.has(name)) return "seo";
  if (pricingFieldNames.has(name)) return "pricing";
  if (sidebarFieldNames.has(name)) {
    return ["category", "categoryKeys", "categories", "practitioner", "practitioners", "site", "siteSlug", "training", "type"].includes(name)
      ? "organize"
      : "publishing";
  }

  return "main";
}

function withSidebarPosition(field: Field): Field {
  const admin = "admin" in field ? (field.admin as Record<string, unknown> | undefined) : undefined;

  return {
    ...field,
    admin: {
      ...admin,
      className: [admin?.className, "eftmra-materio-sidebar-field"].filter(Boolean).join(" "),
      position: "sidebar",
    },
  } as Field;
}

function makeCard(label: string, fields: Field[], sidebar = false): Field | null {
  if (!fields.length) return null;

  return {
    type: "collapsible",
    label,
    fields,
    admin: {
      className: sidebar ? "eftmra-materio-card eftmra-materio-card--sidebar" : "eftmra-materio-card",
      initCollapsed: false,
      ...(sidebar ? { position: "sidebar" as const } : {}),
    },
  };
}

function splitSidebarFields(fields: Field[]) {
  const main: Field[] = [];
  const publishing: Field[] = [];
  const organize: Field[] = [];
  const pricing: Field[] = [];
  const seo: Field[] = [];

  for (const field of fields) {
    if (field.type === "row") {
      const split = splitSidebarFields(field.fields);

      if (split.main.length > 0) {
        main.push({
          ...field,
          fields: split.main,
        });
      }

      publishing.push(...split.publishing);
      organize.push(...split.organize);
      pricing.push(...split.pricing);
      seo.push(...split.seo);
      continue;
    }

    if (field.type === "tabs") {
      const tabs = [];

      for (const tab of field.tabs) {
        const split = splitSidebarFields(tab.fields);
        publishing.push(...split.publishing);
        organize.push(...split.organize);
        pricing.push(...split.pricing);
        seo.push(...split.seo);

        if (split.main.length > 0) {
          tabs.push({
            ...tab,
            fields: organizeMainFields(split.main, typeof tab.label === "string" ? tab.label : "Content"),
          });
        }
      }

      if (tabs.length > 0) {
        main.push({
          ...field,
          tabs,
        });
      }

      continue;
    }

    const bucket = getFieldBucket(field);

    if (bucket === "publishing") {
      publishing.push(withSidebarPosition(field));
    } else if (bucket === "organize") {
      organize.push(withSidebarPosition(field));
    } else if (bucket === "pricing") {
      pricing.push(withSidebarPosition(field));
    } else if (bucket === "seo") {
      seo.push(field);
    } else {
      main.push(field);
    }
  }

  return { main, organize, pricing, publishing, seo };
}

function getMainSection(field: Field): string {
  const name = getFieldName(field);

  if (field.type === "row") {
    const childSections: string[] = field.fields
      .map((child) => getMainSection(child))
      .filter((section) => section !== "Primary information" && section !== "Details");

    return childSections[0] || "Details";
  }

  if (!name) return "Details";
  if (mediaFieldNames.has(name) || field.type === "upload") return "Media";
  if (contactFieldNames.has(name)) return "Contact details";
  if (logisticsFieldNames.has(name)) return "Schedule & logistics";
  if (field.type === "array" || field.type === "blocks" || field.type === "join") return "Structured content";
  if (field.type === "richText" || field.type === "code") return "Body content";

  return "Primary information";
}

function organizeMainFields(fields: Field[], fallbackLabel = "Primary information") {
  const sections = new Map<string, Field[]>();

  for (const field of fields) {
    const section = getMainSection(field) || fallbackLabel;
    sections.set(section, [...(sections.get(section) || []), field]);
  }

  return Array.from(sections.entries())
    .map(([label, sectionFields]) => makeCard(label, sectionFields))
    .filter(Boolean) as Field[];
}

export function withMaterioAdminFormLayout(collection: CollectionConfig): CollectionConfig {
  const split = splitSidebarFields(collection.fields);
  const sidebarCards = [
    makeCard("Publishing", split.publishing, true),
    makeCard("Pricing", split.pricing, true),
    makeCard("Organize", split.organize, true),
  ].filter(Boolean) as Field[];

  return {
    ...collection,
    fields: [...organizeMainFields(split.main), makeCard("SEO", split.seo), ...sidebarCards].filter(Boolean) as Field[],
  };
}

function isSeoField(field: Field) {
  const name = getFieldName(field);

  if (name === "meta") return true;
  if (field.type === "collapsible" && field.label === "SEO") return true;

  return false;
}

function isSidebarCard(field: Field) {
  const className = "admin" in field ? (field.admin as Record<string, unknown> | undefined)?.className : undefined;

  return typeof className === "string" && className.includes("eftmra-materio-card--sidebar");
}

export function withSeoCollapsibleBlock(collection: CollectionConfig): CollectionConfig {
  const seoFields: Field[] = [];
  const regularFields: Field[] = [];
  const sidebarFields: Field[] = [];

  for (const field of collection.fields) {
    if (isSeoField(field)) {
      if (field.type === "collapsible" && field.label === "SEO") {
        seoFields.push(...field.fields);
      } else {
        seoFields.push(field);
      }
    } else if (isSidebarCard(field)) {
      sidebarFields.push(field);
    } else {
      regularFields.push(field);
    }
  }

  return {
    ...collection,
    fields: [...regularFields, makeCard("SEO", seoFields), ...sidebarFields].filter(Boolean) as Field[],
  };
}
