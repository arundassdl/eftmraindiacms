import type { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
  slug: "header",
  label: "Header",
  admin: {
    group: "Content & Site",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "logoText",
      type: "text",
      defaultValue: "EFTMRA India",
    },
    {
      name: "logoImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "logoSubtitle",
      type: "text",
      defaultValue: "EFT & MATRIX REIMPRINTING ACADEMY INDIA",
    },
    {
      name: "logoHref",
      type: "text",
      defaultValue: "/",
    },
    {
      name: "cta",
      type: "group",
      fields: [
        {
          name: "label",
          type: "text",
        },
        {
          name: "href",
          type: "text",
        },
      ],
    },
    {
      name: "menuItems",
      type: "array",
      labels: {
        singular: "Menu Item",
        plural: "Menu Items",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "href",
          type: "text",
          admin: {
            description: "Optional direct link for the top-level item.",
          },
        },
        {
          name: "description",
          type: "text",
        },
        {
          name: "subItems",
          type: "array",
          labels: {
            singular: "Submenu Item",
            plural: "Submenu Items",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "href",
              type: "text",
              required: true,
            },
            {
              name: "description",
              type: "text",
            },
          ],
        },
        {
          name: "submenuCTA",
          type: "group",
          fields: [
            {
              name: "label",
              type: "text",
            },
            {
              name: "href",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
};
