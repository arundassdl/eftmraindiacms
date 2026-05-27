import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const trainingTypeLabels: Record<string, string> = {
  intro: "Introductory",
  l12: "Level 1 & 2",
  l3: "Level 3",
  matrix: "Matrix Reimprinting",
  other: "Other",
};

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate) return "";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (Number.isNaN(start.getTime())) return "";

  const monthDay = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
  const fullDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (!end || Number.isNaN(end.getTime())) {
    return fullDate.format(start);
  }

  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${monthDay.format(start)}-${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${monthDay.format(start)} - ${fullDate.format(end)}`;
}

function getMonthParts(startDate?: string | null) {
  if (!startDate) return { monthKey: "", monthLabel: "" };

  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return { monthKey: "", monthLabel: "" };

  const month = new Intl.DateTimeFormat("en", { month: "long" }).format(date);
  return {
    monthKey: month.toLowerCase(),
    monthLabel: month.toUpperCase(),
  };
}

function deriveTrainingFields(data: Record<string, any> | undefined) {
  if (!data) return data;

  const levelKey = typeof data.levelKey === "string" ? data.levelKey : "other";
  const levelLabel = trainingTypeLabels[levelKey] || data.levelLabel || "Other";
  const cityLabel = typeof data.cityLabel === "string" ? data.cityLabel.trim() : "";
  const { monthKey, monthLabel } = getMonthParts(data.startDate);

  data.slug = typeof data.slug === "string" && data.slug.trim() ? slugify(data.slug) : slugify(data.title || "");
  data.levelLabel = levelLabel;
  data.badge = data.badge || levelLabel;
  data.cityKey = cityLabel ? slugify(cityLabel) : data.cityKey;
  data.cityText = cityLabel || data.cityText;
  data.monthKey = monthKey || data.monthKey;
  data.monthLabel = monthLabel || data.monthLabel;
  data.dateText = formatDateRange(data.startDate, data.endDate) || data.dateText;
  data.posterImage = data.posterImage || data.image;
  data.posterImageAlt = data.posterImageAlt || data.imageAlt;

  return data;
}

async function deleteRelatedDocs(req: any, collection: string, trainingId: string | number) {
  const related = await req.payload.find({
    collection,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: {
      training: {
        equals: trainingId,
      },
    },
  });

  for (const doc of related.docs) {
    await req.payload.delete({
      collection,
      id: doc.id,
      overrideAccess: true,
      context: {
        trainingDelete: true,
      },
    });
  }
}

async function detachRelatedGallery(req: any, trainingId: string | number) {
  const related = await req.payload.find({
    collection: "gallery",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: {
      training: {
        equals: trainingId,
      },
    },
  });

  for (const doc of related.docs) {
    await req.payload.update({
      collection: "gallery",
      id: doc.id,
      data: {
        training: null,
      },
      overrideAccess: true,
      context: {
        trainingDelete: true,
      },
    });
  }
}

async function cleanupTrainingRelationships(req: any, trainingId?: string | number | null) {
  if (!trainingId) return;

  await deleteRelatedDocs(req, "training-reviews", trainingId);
  await deleteRelatedDocs(req, "training-registrations", trainingId);
  await detachRelatedGallery(req, trainingId);
}

const hiddenText = (name: string, required = false) => ({
  name,
  type: "text" as const,
  required,
  admin: { hidden: true },
});

const hiddenNumber = (name: string) => ({
  name,
  type: "number" as const,
  admin: { hidden: true },
});

const reviewSnapshotFields = [
  hiddenNumber("rating"),
  hiddenNumber("reviews"),
  hiddenNumber("reviewsSummaryAverage"),
  hiddenNumber("reviewsSummaryCount"),
  {
    name: "reviewsBreakdown",
    type: "array" as const,
    admin: { hidden: true },
    fields: [
      { name: "stars", type: "number" as const, required: true },
      { name: "count", type: "number" as const, required: true },
    ],
  },
  {
    name: "reviewsList",
    type: "array" as const,
    admin: { hidden: true },
    fields: [
      { name: "authorName", type: "text" as const, required: true },
      { name: "authorRole", type: "text" as const },
      { name: "dateLabel", type: "text" as const },
      { name: "quote", type: "textarea" as const, required: true },
      { name: "rating", type: "number" as const },
    ],
  },
];

const registrationSnapshotFields = [
  hiddenText("availabilityText"),
  hiddenText("formTitle"),
  hiddenText("submitLabel"),
  { name: "successTitle", type: "text" as const, admin: { hidden: true } },
  { name: "successMessage", type: "textarea" as const, admin: { hidden: true } },
  hiddenText("termsLabel"),
  hiddenText("termsHref"),
  hiddenText("cancellationLabel"),
  hiddenText("cancellationHref"),
];

export const Trainings: CollectionConfig = {
  slug: "trainings",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "cityLabel", "startDate", "format"],
    enableListViewSelectAPI: true,
    group: "Trainings",
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => deriveTrainingFields(data),
    ],
    beforeDelete: [
      async ({ id, req }) => {
        await cleanupTrainingRelationships(req, id);
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Essentials",
          fields: [
            { name: "title", type: "text", required: true, admin: { description: "Public training title." } },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              admin: {
                description: "Auto-generated from the title. Edit only if the URL needs to be different.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "status",
                  type: "select",
                  defaultValue: "published",
                  required: true,
                  admin: { width: "33%" },
                  options: [
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                  ],
                },
                {
                  name: "site",
                  type: "relationship",
                  relationTo: "sites",
                  required: true,
                  admin: { width: "33%" },
                },
                {
                  name: "levelKey",
                  label: "Training Type",
                  type: "select",
                  required: true,
                  defaultValue: "l12",
                  admin: { width: "34%" },
                  options: [
                    { label: "Level 1 & 2", value: "l12" },
                    { label: "Level 3", value: "l3" },
                    { label: "Matrix Reimprinting", value: "matrix" },
                    { label: "Introductory", value: "intro" },
                    { label: "Other", value: "other" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "badge", label: "Badge Text", type: "text", admin: { width: "50%" } },
                {
                  name: "badgeTone",
                  label: "Badge Colour",
                  type: "select",
                  defaultValue: "default",
                  admin: { width: "50%" },
                  options: [
                    { label: "Default", value: "default" },
                    { label: "Blue", value: "blue" },
                    { label: "Amber", value: "amber" },
                  ],
                },
              ],
            },
            { name: "description", type: "textarea", required: true },
            {
              type: "row",
              fields: [
                { name: "image", label: "Card / Hero Image", type: "upload", relationTo: "media", admin: { width: "50%" } },
                { name: "imageAlt", label: "Image Alt Text", type: "text", admin: { width: "50%" } },
              ],
            },
            hiddenText("levelLabel", true),
            { name: "posterImage", type: "upload", relationTo: "media", admin: { hidden: true } },
            hiddenText("posterImageAlt"),
          ],
        },
        {
          label: "Date & Location",
          fields: [
            {
              type: "row",
              fields: [
                { name: "startDate", type: "date", required: true, admin: { width: "33%" } },
                { name: "endDate", type: "date", admin: { width: "33%" } },
                { name: "format", type: "text", admin: { width: "34%", placeholder: "In-person, online, hybrid..." } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "cityLabel", label: "City", type: "text", required: true, admin: { width: "33%" } },
                { name: "venue", type: "text", required: true, admin: { width: "34%" } },
                { name: "schedule", type: "text", required: true, admin: { width: "33%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "requirement", type: "text", admin: { width: "34%" } },
                { name: "availability", type: "text", admin: { width: "33%" } },
                {
                  name: "availabilityTone",
                  type: "select",
                  defaultValue: "open",
                  admin: { width: "33%" },
                  options: [
                    { label: "Open", value: "open" },
                    { label: "Low", value: "low" },
                    { label: "Full", value: "full" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "price", type: "text", admin: { width: "50%" } },
                { name: "priceNote", label: "Price Label", type: "text", admin: { width: "50%" } },
              ],
            },
            hiddenText("cityKey", true),
            hiddenText("cityText", true),
            hiddenText("monthKey", true),
            hiddenText("monthLabel", true),
            hiddenText("dateText", true),
          ],
        },
        {
          label: "Frontend Content",
          fields: [
            {
              type: "collapsible",
              label: "About & Outcomes",
              admin: { initCollapsed: false },
              fields: [
                {
                  name: "aboutParagraphs",
                  type: "array",
                  fields: [{ name: "content", type: "textarea", required: true }],
                },
                {
                  name: "outcomes",
                  type: "array",
                  fields: [{ name: "label", type: "text", required: true }],
                },
                {
                  name: "audiences",
                  type: "array",
                  fields: [
                    { name: "title", type: "text", required: true },
                    { name: "description", type: "textarea", required: true },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Trainer",
              admin: {
                initCollapsed: false,
                description: "Trainer details shown on the training listing cards and individual training pages.",
              },
              fields: [
                { name: "trainerName", type: "text", admin: { description: "Shown on listing cards, posters, and the detail page trainer card." } },
                { name: "trainerRole", type: "text", admin: { description: "Short credential or role shown below the trainer name." } },
                {
                  type: "row",
                  fields: [
                    { name: "trainerImage", type: "upload", relationTo: "media", admin: { width: "50%", description: "Trainer photo used on listing cards and detail pages." } },
                    { name: "trainerImageAlt", type: "text", admin: { width: "50%", description: "Optional alt text. Defaults to trainer name when blank." } },
                  ],
                },
                { name: "trainerBio", type: "textarea", admin: { description: "Short biography shown on the individual training page." } },
                {
                  name: "trainerCredentials",
                  type: "array",
                  admin: { description: "Credential chips shown in the trainer section on the detail page." },
                  fields: [{ name: "label", type: "text", required: true }],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Daily Schedule & Certification",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "scheduleDays",
                  type: "array",
                  fields: [
                    { name: "dayLabel", type: "text", required: true },
                    { name: "dayTitle", type: "text", required: true },
                    { name: "dayDate", type: "text", required: true },
                    { name: "theme", type: "text", required: true },
                    {
                      name: "topics",
                      type: "array",
                      fields: [{ name: "label", type: "text", required: true }],
                    },
                  ],
                },
                {
                  name: "certificationSteps",
                  type: "array",
                  fields: [
                    { name: "stepLabel", type: "text", required: true },
                    { name: "title", type: "text", required: true },
                    { name: "description", type: "textarea", required: true },
                    { name: "highlight", type: "checkbox" },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Stats",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "stats",
                  type: "array",
                  fields: [
                    { name: "value", type: "text", required: true },
                    { name: "label", type: "text", required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Venue & Gallery",
          fields: [
            {
              type: "collapsible",
              label: "Venue Details",
              admin: { initCollapsed: false },
              fields: [
                { name: "venueName", type: "text" },
                { name: "venueAddress", type: "textarea" },
                {
                  name: "venueGoogleMapLocation",
                  label: "Google Location Selector",
                  type: "text",
                  admin: {
                    components: {
                      Field: "./src/components/admin/GoogleLocationSelector.tsx#default",
                    },
                    description:
                      "Paste a Google Maps place URL, embed URL, or selected location/address. This map location is shown on the training detail page.",
                  },
                },
                {
                  type: "row",
                  fields: [
                    { name: "venueImage", type: "upload", relationTo: "media", admin: { width: "50%" } },
                    { name: "venueImageAlt", type: "text", admin: { width: "50%" } },
                  ],
                },
                {
                  name: "venueNotes",
                  type: "array",
                  fields: [
                    {
                      name: "icon",
                      type: "select",
                      required: true,
                      options: [
                        { label: "Room", value: "room" },
                        { label: "Location", value: "location" },
                        { label: "Info", value: "info" },
                      ],
                    },
                    { name: "label", type: "text", required: true },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Gallery",
              admin: { initCollapsed: true },
              fields: [
                { name: "galleryIntro", type: "textarea" },
                {
                  name: "associatedGallery",
                  type: "join",
                  collection: "gallery",
                  on: "training",
                  admin: {
                    description: "Manage images for this training in the dedicated Gallery collection.",
                  },
                },
                { name: "galleryVideoLabel", type: "text" },
                { name: "galleryVideoUrl", type: "text" },
                { name: "galleryShareTitle", type: "text" },
                { name: "galleryShareDescription", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Reviews",
          fields: [
            {
              name: "submittedReviews",
              type: "join",
              collection: "training-reviews",
              on: "training",
              defaultLimit: 20,
              defaultSort: "-createdAt",
              admin: {
                allowCreate: true,
                defaultColumns: ["authorName", "rating", "status", "dateLabel", "createdAt"],
                description: "Live training review submissions linked to this training. Publish a review to include it in the public rating average.",
              },
            },
            ...reviewSnapshotFields,
            ...registrationSnapshotFields,
          ],
        },
      ],
    },
  ],
};
