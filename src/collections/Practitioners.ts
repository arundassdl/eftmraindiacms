import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function derivePractitionerFields(data: Record<string, any> | undefined) {
  if (!data) return data;

  const cityLabel = typeof data.cityLabel === "string" ? data.cityLabel.trim() : "";

  if (cityLabel) {
    data.cityKey = slugify(cityLabel);
  }

  return data;
}

const hiddenText = (name: string, required = false) => ({
  name,
  type: "text" as const,
  required,
  admin: { hidden: true },
});

export const Practitioners: CollectionConfig = {
  slug: "practitioners",
  labels: {
    singular: "Practitioner",
    plural: "Practitioners",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "showOnHomepage", "category", "cityLabel", "availabilityMode"],
    group: "Practitioners",
    description: "Maintain public practitioner profiles, directory metadata, and testimonial snippets.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => derivePractitionerFields(data),
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            { name: "name", type: "text", required: true },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              admin: {
                description: "Auto-generated from the practitioner name unless you provide a custom URL slug.",
              },
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (typeof value === "string" && value.trim()) return slugify(value);
                    if (typeof data?.name === "string" && data.name.trim()) return slugify(data.name);
                    return value;
                  },
                ],
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
                  admin: {
                    width: "33%",
                  },
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
                  admin: {
                    width: "33%",
                  },
                },
                {
                  name: "category",
                  type: "select",
                  required: true,
                  defaultValue: "eft-practitioner",
                  admin: {
                    width: "34%",
                  },
                  options: [
                    { label: "EFT Practitioner (Level 1 & 2)", value: "eft-practitioner" },
                    { label: "EFT Advanced Practitioner (Level 3)", value: "eft-advanced" },
                    { label: "Matrix Reimprinting Practitioner", value: "matrix" },
                  ],
                },
              ],
            },
            {
              name: "categoryKeys",
              type: "select",
              hasMany: true,
              admin: {
                description: "All public directory categories this practitioner belongs to. Used for category filtering.",
              },
              options: [
                { label: "EFT Practitioner (Level 1 & 2)", value: "eft-practitioner" },
                { label: "EFT Advanced Practitioner (Level 3)", value: "eft-advanced" },
                { label: "Matrix Reimprinting Practitioner", value: "matrix" },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "role",
                  type: "text",
                  required: true,
                  admin: {
                    width: "60%",
                    description: "Public-facing role label shown on cards and profile pages.",
                  },
                },
                {
                  name: "accent",
                  type: "select",
                  defaultValue: "deep-teal",
                  admin: {
                    width: "40%",
                  },
                  options: [
                    { label: "Deep Teal", value: "deep-teal" },
                    { label: "Sapphire", value: "sapphire" },
                    { label: "Amber", value: "amber" },
                    { label: "Calm Sky", value: "calm-sky" },
                    { label: "Teal Gold", value: "teal-gold" },
                    { label: "Ice Teal", value: "ice-teal" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "showOnHomepage",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    width: "40%",
                    description: "Enable this practitioner for the dynamic practitioner section on the homepage.",
                  },
                },
              ],
            },
            { name: "profileTagline", type: "textarea" },
            {
              type: "row",
              fields: [
                { name: "image", type: "upload", relationTo: "media", admin: { width: "50%" } },
                {
                  name: "imageAlt",
                  type: "text",
                  admin: {
                    width: "50%",
                    description: "Describe the profile image for accessibility and media SEO.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Directory",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "addressLine1",
                  label: "Address Line 1",
                  type: "text",
                  admin: {
                    width: "50%",
                    description: "Primary practice address line.",
                  },
                },
                {
                  name: "addressLine2",
                  label: "Address Line 2",
                  type: "text",
                  admin: {
                    width: "50%",
                    description: "Additional address details, landmark, or suite.",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "cityLabel",
                  label: "City",
                  type: "text",
                  required: true,
                  admin: {
                    width: "50%",
                    components: {
                      Field: "./src/components/admin/PractitionerCityField.tsx#default",
                    },
                    description: "Friendly city name shown in listings, for example Mumbai or Bengaluru.",
                  },
                },
                { name: "state", type: "text", admin: { width: "50%" } },
              ],
            },
            hiddenText("cityKey", true),
            {
              type: "row",
              fields: [
                { name: "country", type: "text", defaultValue: "India", admin: { width: "34%" } },
                { name: "hours", type: "text", admin: { width: "33%" } },
                {
                  name: "availabilityMode",
                  type: "select",
                  defaultValue: "both",
                  admin: {
                    width: "33%",
                  },
                  options: [
                    { label: "Online Only", value: "online" },
                    { label: "In-person Only", value: "in-person" },
                    { label: "Online & In-person", value: "both" },
                  ],
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "sessionFee", type: "text", admin: { width: "50%" } },
                { name: "membershipNumber", type: "text", admin: { width: "25%" } },
                { name: "certificationYear", type: "text", admin: { width: "25%" } },
              ],
            },
            {
              name: "languages",
              type: "array",
              labels: {
                singular: "Language",
                plural: "Languages",
              },
              fields: [{ name: "label", type: "text", required: true }],
            },
            {
              name: "specialties",
              type: "array",
              labels: {
                singular: "Specialty",
                plural: "Specialties",
              },
              fields: [{ name: "label", type: "text", required: true }],
            },
            {
              name: "credentials",
              type: "array",
              labels: {
                singular: "Credential",
                plural: "Credentials",
              },
              fields: [{ name: "label", type: "text", required: true }],
            },
            {
              name: "certificates",
              type: "array",
              labels: {
                singular: "Certificate",
                plural: "Certificates",
              },
              admin: {
                description: "Certificate images or files attached to this practitioner profile.",
              },
              fields: [
                { name: "title", type: "text", required: true },
                { name: "file", type: "upload", relationTo: "media", required: true },
                { name: "sourceUrl", type: "text" },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              type: "row",
              fields: [
                { name: "email", type: "email", admin: { width: "50%" } },
                { name: "phone", type: "text", admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "whatsapp", type: "text", admin: { width: "50%" } },
                { name: "website", type: "text", admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "linkedin", type: "text", admin: { width: "33%" } },
                { name: "instagram", type: "text", admin: { width: "33%" } },
                { name: "facebook", type: "text", admin: { width: "34%" } },
              ],
            },
          ],
        },
        {
          label: "Profile Content",
          fields: [
            {
              name: "bio",
              type: "textarea",
              admin: {
                description: "Primary introduction shown on the practitioner profile page.",
              },
            },
            {
              name: "approach",
              type: "textarea",
              admin: {
                description: "Explain the practitioner's philosophy, session style, or special approach.",
              },
            },
          ],
        },
        {
          label: "Ratings & Reviews",
          fields: [
            {
              name: "submittedReviews",
              type: "join",
              collection: "practitioner-reviews",
              on: "practitioner",
              defaultLimit: 20,
              defaultSort: "-createdAt",
              admin: {
                allowCreate: true,
                defaultColumns: ["authorName", "rating", "status", "dateLabel", "createdAt"],
                description: "Live review submissions linked to this practitioner. Publish a review to include it in the public rating average.",
              },
            },
          ],
        },
      ],
    },
  ],
};
