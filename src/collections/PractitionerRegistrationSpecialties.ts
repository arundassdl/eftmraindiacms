import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PractitionerRegistrationSpecialties: CollectionConfig = {
  slug: "practitioner-registration-specialties",
  labels: {
    singular: "Registration Specialty",
    plural: "Registration Specialties",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "enabled", "sortOrder"],
    group: "Practitioners",
    description: "Specialty options shown on the practitioner registration form.",
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
            description: "Auto-generated from the label unless you provide a custom value.",
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (typeof value === "string" && value.trim()) return slugify(value);
                if (typeof data?.label === "string" && data.label.trim()) return slugify(data.label);
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
  ],
};

