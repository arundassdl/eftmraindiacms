import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: {
    singular: "Gallery Album",
    plural: "Gallery Albums",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "coverImage", "status", "site"],
    group: "Resources",
    description: "Create gallery albums with a cover image and multiple related photos.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      admin: {
        description: "Auto-generated from the album title unless you provide a custom slug.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.trim()) return slugify(value);
            if (typeof data?.title === "string" && data.title.trim()) return slugify(data.title);
            return value;
          },
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Optional short intro shown on the album detail page.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Cover image shown on the gallery listing. If empty, the first album image is used.",
      },
    },
    {
      name: "coverImageAlt",
      type: "text",
      admin: {
        description: "Describe the cover image for accessibility.",
      },
    },
    {
      name: "images",
      type: "array",
      labels: {
        singular: "Image",
        plural: "Images",
      },
      admin: {
        description: "Add all photos that belong to this album.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "alt",
          type: "text",
          admin: {
            description: "Describe the image for accessibility.",
          },
        },
        {
          name: "caption",
          type: "text",
        },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "published",
      required: true,
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
    },
    {
      name: "practitioners",
      type: "relationship",
      relationTo: "practitioners",
      hasMany: true,
      admin: {
        description: "Practitioners shown or related to this gallery item.",
      },
    },
    {
      name: "training",
      type: "relationship",
      relationTo: "trainings",
      admin: {
        description: "Associated training event.",
      },
    },
    {
      type: "collapsible",
      label: "Legacy Single Image",
      admin: {
        initCollapsed: true,
        description: "Kept only so older gallery image records can still render until they are moved into albums.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "imageAlt",
          type: "text",
          admin: {
            description: "Legacy single image alt text.",
          },
        },
      ],
    },
    {
      name: "showInGalleryPage",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "If checked, this album will appear on the main gallery listing page.",
      },
    },
    {
      name: "displayOrder",
      type: "number",
      admin: {
        description: "Used to manually order items. Lower numbers appear first.",
      },
    },
  ],
};
