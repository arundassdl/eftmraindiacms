import type { CollectionConfig } from "payload";

function normalizeRoleKey(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export const RoleManagement: CollectionConfig = {
  slug: "role-management",
  labels: {
    plural: "Role Management",
    singular: "Role",
  },
  admin: {
    defaultColumns: ["label", "value", "active", "sortOrder", "updatedAt"],
    group: "Settings",
    useAsTitle: "label",
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data;

        const roleKeySource = operation === "create" ? data.label : data.value || data.label;

        return {
          ...data,
          value: normalizeRoleKey(roleKeySource),
        };
      },
    ],
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "value",
      label: "Role Key",
      type: "text",
      required: true,
      unique: true,
      admin: {
        components: {
          Field: "./src/components/admin/RoleKeyField.tsx#default",
        },
        description: "Auto-generated from the role name, for example Site Admin becomes siteadmin.",
        readOnly: true,
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      admin: {
        description: "Lower numbers appear first in permission screens.",
      },
    },
    {
      name: "description",
      type: "textarea",
    },
  ],
};
