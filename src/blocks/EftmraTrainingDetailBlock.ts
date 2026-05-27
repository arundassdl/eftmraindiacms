import type { Block } from "payload";

export const EftmraTrainingDetailBlock: Block = {
  slug: "eftmra-training-detail",
  fields: [
    {
      name: "breadcrumbs",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
    { name: "badge", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "startDate", type: "date" },
    { name: "endDate", type: "date" },
    {
      name: "levelKey",
      type: "select",
      options: [
        { label: "Level 1 & 2", value: "l12" },
        { label: "Level 3", value: "l3" },
        { label: "Matrix Reimprinting", value: "matrix" },
        { label: "Introductory", value: "intro" },
      ],
    },
    {
      name: "badgeTone",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Blue", value: "blue" },
        { label: "Amber", value: "amber" },
      ],
    },
    { name: "format", type: "text" },
    {
      name: "availabilityTone",
      type: "select",
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Low", value: "low" },
        { label: "Full", value: "full" },
      ],
    },
    {
      name: "metaItems",
      type: "array",
      fields: [
        { name: "icon", type: "select", required: true, options: ["calendar", "clock", "location"] },
        { name: "primary", type: "text", required: true },
        { name: "secondary", type: "text" },
      ],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    { name: "posterImage", type: "upload", relationTo: "media" },
    { name: "posterImageAlt", type: "text" },
    { name: "aboutEyebrow", type: "text" },
    { name: "aboutTitle", type: "text" },
    {
      name: "aboutParagraphs",
      type: "array",
      fields: [{ name: "content", type: "textarea", required: true }],
    },
    { name: "outcomesEyebrow", type: "text" },
    { name: "outcomesTitle", type: "text" },
    {
      name: "outcomes",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    { name: "audienceEyebrow", type: "text" },
    { name: "audienceTitle", type: "text" },
    {
      name: "audiences",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
      ],
    },
    { name: "trainerEyebrow", type: "text" },
    { name: "trainerTitle", type: "text" },
    { name: "trainerName", type: "text" },
    { name: "trainerRole", type: "text" },
    { name: "trainerBio", type: "textarea" },
    { name: "trainerImage", type: "upload", relationTo: "media" },
    { name: "trainerImageAlt", type: "text" },
    {
      name: "trainerCredentials",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    { name: "scheduleEyebrow", type: "text" },
    { name: "scheduleTitle", type: "text" },
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
    { name: "certificationEyebrow", type: "text" },
    { name: "certificationTitle", type: "text" },
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
    { name: "venueEyebrow", type: "text" },
    { name: "venueTitle", type: "text" },
    { name: "venueName", type: "text" },
    { name: "venueAddress", type: "textarea" },
    { name: "venueImage", type: "upload", relationTo: "media" },
    { name: "venueImageAlt", type: "text" },
    {
      name: "venueNotes",
      type: "array",
      fields: [
        { name: "icon", type: "select", required: true, options: ["room", "location", "info"] },
        { name: "label", type: "text", required: true },
      ],
    },
    // Dynamic gallery for past training records
    {
      name: "pastGallery",
      type: "array",
      label: "Past Training Gallery",
      fields: [
        { name: "year", type: "text", label: "Year/Batch", required: true },
        {
          name: "items",
          type: "array",
          label: "Gallery Media",
          fields: [
            { name: "image", type: "upload", relationTo: "media", required: true },
            { name: "caption", type: "text", label: "Caption" }
          ]
        }
      ]
    },
    { name: "price", type: "text" },
    { name: "priceLabel", type: "text" },
    { name: "availabilityText", type: "text" },
    { name: "formTitle", type: "text" },
    { name: "submitLabel", type: "text" },
    { name: "successTitle", type: "text" },
    { name: "successMessage", type: "textarea" },
    { name: "termsLabel", type: "text" },
    { name: "termsHref", type: "text" },
    { name: "cancellationLabel", type: "text" },
    { name: "cancellationHref", type: "text" },
  ],
};
