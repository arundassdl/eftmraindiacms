import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PractitionerRegistrationCountries: CollectionConfig = {
  slug: "practitioner-registration-countries",
  labels: {
    singular: "Registration Country",
    plural: "Registration Countries",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "timezoneLabel", "currencyCode", "enabled", "sortOrder"],
    group: "Practitioners",
    description: "Countries, states, timezones, and currencies used by the practitioner registration form.",
  },
  defaultSort: "sortOrder",
  fields: [
    {
      type: "row",
      fields: [
        { name: "label", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "value",
          type: "text",
          required: true,
          unique: true,
          admin: {
            width: "50%",
            description: "Auto-generated from the country label unless you provide a custom value.",
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (typeof value === "string" && value.trim()) return value.trim();
                if (typeof data?.label === "string" && data.label.trim()) return data.label.trim();
                return value;
              },
            ],
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: true, admin: { width: "50%" } },
        { name: "sortOrder", type: "number", defaultValue: 100, admin: { width: "50%" } },
      ],
    },
    {
      name: "states",
      type: "array",
      labels: {
        singular: "State / Province",
        plural: "States / Provinces",
      },
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "value",
          type: "text",
          admin: {
            description: "Optional. Auto-generated from the label when left blank.",
          },
          hooks: {
            beforeValidate: [
              ({ value, siblingData }) => {
                if (typeof value === "string" && value.trim()) return value.trim();
                if (typeof siblingData?.label === "string" && siblingData.label.trim()) return siblingData.label.trim();
                return value;
              },
            ],
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "timezoneLabel", type: "text", required: true, admin: { width: "50%" } },
        { name: "timezoneValue", type: "text", required: true, admin: { width: "50%", placeholder: "Asia/Kolkata" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "currencySymbol", type: "text", required: true, admin: { width: "50%" } },
        { name: "currencyCode", type: "text", required: true, admin: { width: "50%", placeholder: "INR" } },
      ],
    },
  ],
};

