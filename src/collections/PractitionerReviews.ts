import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

type PractitionerReviewLike = {
  practitioner?: number | string | { id?: number | string | null } | null;
  rating?: number | null;
};

type EmailSettings = {
  enabled?: boolean | null;
  fromName?: string | null;
  fromEmail?: string | null;
  eftmraIndiaEmail?: string | null;
  resendApiKey?: string | null;
};

function getPractitionerId(review?: PractitionerReviewLike | null) {
  const practitioner = review?.practitioner;

  if (typeof practitioner === "object" && practitioner) {
    return practitioner.id;
  }

  return practitioner;
}

function isSeedImport(req: any) {
  return req.context?.seedImport === true;
}

async function syncPractitionerRating(req: any, practitionerId?: number | string | null) {
  if (!practitionerId || isSeedImport(req)) return;

  const reviews = await req.payload.find({
    collection: "practitioner-reviews",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: {
      and: [
        { practitioner: { equals: practitionerId } },
        { status: { equals: "published" } },
      ],
    },
  });
  const ratings = (reviews.docs as PractitionerReviewLike[])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating));
  const count = ratings.length;
  const average = count > 0 ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / count).toFixed(1)) : null;

  await req.payload.update({
    collection: "practitioners",
    id: practitionerId,
    overrideAccess: true,
    data: {
      rating: average,
      reviews: count,
    },
  });
}

export const PractitionerReviews: CollectionConfig = {
  slug: "practitioner-reviews",
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "practitioner", "rating", "status", "dateLabel"],
    group: "Practitioners",
  },

  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation !== "create" || req.user || isSeedImport(req)) return data;

        return {
          ...data,
          status: "draft",
          dateLabel:
            data?.dateLabel ||
            new Intl.DateTimeFormat("en-IN", {
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            }).format(new Date()),
          displayOrder: data?.displayOrder ?? 0,
        };
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (isSeedImport(req)) return;

        await syncPractitionerRating(req, getPractitionerId(doc));

        const previousPractitionerId = getPractitionerId(previousDoc);
        const currentPractitionerId = getPractitionerId(doc);

        if (previousPractitionerId && previousPractitionerId !== currentPractitionerId) {
          await syncPractitionerRating(req, previousPractitionerId);
        }

        if (previousDoc || doc.status !== "draft") return;

        const settings = (await req.payload
          .findGlobal({
            slug: "email-settings",
            depth: 0,
            overrideAccess: true,
            req,
          })
          .catch(() => null)) as EmailSettings | null;
        const emailEnabled = settings?.enabled !== false;

        if (!emailEnabled) {
          req.payload.logger.info("Practitioner review emails are disabled in Email Settings.");
          return;
        }

        const adminEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const template = await renderEmailTemplate({
          req,
          slug: "simple-form-notification",
          variables: {
            adminEmail,
            formName: "Practitioner review",
            submitterName: doc.authorName || "",
            submitterEmail: "",
            submitterPhone: "",
            source: doc.practitionerName || String(currentPractitionerId || ""),
            message: [
              doc.rating ? `Rating: ${doc.rating}` : "",
              doc.authorRole ? `Role: ${doc.authorRole}` : "",
              doc.quote || "",
            ].filter(Boolean).join("\n"),
          },
          fallback: {
            subject: "New {{formName}} submission",
            text: [
              "A new {{formName}} form was submitted.",
              "",
              "Name: {{submitterName}}",
              "Email: {{submitterEmail}}",
              "Phone: {{submitterPhone}}",
              "Source: {{source}}",
              "",
              "{{message}}",
            ].join("\n"),
            html: `
          <p>A new {{formName}} form was submitted.</p>
          <p><strong>Name:</strong> {{submitterName}}<br /><strong>Email:</strong> {{submitterEmail}}<br /><strong>Phone:</strong> {{submitterPhone}}<br /><strong>Source:</strong> {{source}}</p>
          <p style="white-space: pre-line;">{{message}}</p>
        `,
          },
        });

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(template, {
              to: adminEmail,
              from: `${fromName} <${fromEmail}>`,
              subject: template.subject,
              text: template.text,
              html: template.html,
            }),
          });
        } catch (error) {
          req.payload.logger.error("Failed to send practitioner review email.");
          req.payload.logger.error(error);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (isSeedImport(req)) return;

        await syncPractitionerRating(req, getPractitionerId(doc));
      },
    ],
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    { name: "site", type: "relationship", relationTo: "sites", required: true },
    {
      name: "practitioner",
      type: "relationship",
      relationTo: "practitioners",
      required: true,
    },
    { name: "authorName", type: "text", required: true },
    { name: "authorRole", type: "text" },
    { name: "dateLabel", type: "text" },
    { name: "quote", type: "textarea", required: true },
    { name: "rating", type: "number", required: true, defaultValue: 5, min: 1, max: 5 },
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
