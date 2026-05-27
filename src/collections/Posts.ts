import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: "Post",
    plural: "Posts",
  },
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt", "featured"],
    group: "Resources",
    description: "Publish blog articles, news updates, and editorial content for the website.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && typeof (data as any).status === "string") {
          return {
            ...(data as any),
            _status: (data as any).status,
          };
        }

        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              admin: {
                description: "Auto-generated from the post title unless you provide a custom slug.",
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
              type: "row",
              fields: [
                {
                  name: "status",
                  type: "select",
                  defaultValue: "draft",
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
                  name: "featured",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    width: "34%",
                    description: "Highlight this post more prominently in blog listings.",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "publishedAt",
                  type: "date",
                  admin: {
                    width: "50%",
                    date: {
                      pickerAppearance: "dayAndTime",
                    },
                    description: "Publish date shown on the blog. Leave blank for drafts.",
                  },
                },
                {
                  name: "authorName",
                  type: "text",
                  required: true,
                  admin: {
                    width: "50%",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "readTime",
                  type: "text",
                  admin: {
                    width: "50%",
                    description: "Optional label such as 5 min read.",
                  },
                },
                {
                  name: "canonicalPath",
                  type: "text",
                  admin: {
                    width: "50%",
                    description: "Optional override if this post should live at a custom public path.",
                  },
                },
              ],
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
            },
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              hasMany: true,
              admin: {
                description: "Select one or more categories for this post.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "featuredImage",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    width: "50%",
                  },
                },
                {
                  name: "featuredImageAlt",
                  type: "text",
                  admin: {
                    width: "50%",
                  },
                },
              ],
            },
            {
              name: "featuredImageExternalUrl",
              type: "text",
              admin: {
                description: "Optional external image URL used when the post image has not been uploaded into the media library.",
              },
            },
            {
              name: "content",
              type: "richText",
            },
            {
              name: "contentHTML",
              type: "code",
              admin: {
                language: "html",
                description: "Optional HTML body, useful for migrated legacy blog posts.",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              type: "text",
            },
            {
              name: "seoDescription",
              type: "textarea",
            },
          ],
        },
      ],
    },
  ],
};
