import type { Block } from "payload";

export const EftmraContactSectionBlock: Block = {
  slug: "eftmra-contact-section",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "infoItems",
      type: "array",
      minRows: 1,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "textarea", required: true },
      ],
    },
    { name: "formTitle", type: "text" },
    {
      name: "formFields",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "name", type: "text", required: true },
        {
          name: "type",
          type: "select",
          defaultValue: "text",
          options: [
            { label: "Text", value: "text" },
            { label: "Email", value: "email" },
            { label: "Tel", value: "tel" },
            { label: "Textarea", value: "textarea" },
          ],
        },
        { name: "placeholder", type: "text" },
        { name: "required", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "submitLabel", type: "text" },
  ],
};
