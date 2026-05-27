import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

type TrainingReviewLike = {
  training?: number | string | { id?: number | string | null } | null;
  status?: string | null;
  rating?: number | null;
};

type EmailSettings = {
  enabled?: boolean | null;
  fromName?: string | null;
  fromEmail?: string | null;
  eftmraIndiaEmail?: string | null;
  resendApiKey?: string | null;
};

function getTrainingId(review?: TrainingReviewLike | null) {
  const training = review?.training;

  if (typeof training === "object" && training) {
    return training.id;
  }

  return training;
}

function isSeedImport(req: any) {
  return req.context?.seedImport === true || req.context?.trainingDelete === true;
}

function shouldSyncRating(doc?: TrainingReviewLike | null, previousDoc?: TrainingReviewLike | null) {
  return doc?.status === "published" || previousDoc?.status === "published";
}

async function syncTrainingRating(req: any, trainingId?: number | string | null) {
  if (!trainingId || isSeedImport(req)) return;

  const reviews = await req.payload.find({
    collection: "training-reviews",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: {
      and: [
        { training: { equals: trainingId } },
        { status: { equals: "published" } },
      ],
    },
  });

  const ratings = (reviews.docs as TrainingReviewLike[])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating));
  const count = ratings.length;
  const average = count > 0 ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / count).toFixed(1)) : null;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const starsCount = ratings.filter((rating) => rating === stars).length;
    return {
      stars,
      count: starsCount,
    };
  });

  await req.payload.update({
    collection: "trainings",
    id: trainingId,
    overrideAccess: true,
    data: {
      rating: average,
      reviews: count,
      reviewsSummaryAverage: average,
      reviewsSummaryCount: count,
      reviewsBreakdown: breakdown,
    },
  });
}

export const TrainingReviews: CollectionConfig = {
  slug: "training-reviews",
  admin: {
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "training", "rating", "status", "dateLabel"],
    group: "Trainings",
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

        if (shouldSyncRating(doc, previousDoc)) {
          await syncTrainingRating(req, getTrainingId(doc));

          const previousTrainingId = getTrainingId(previousDoc);
          const currentTrainingId = getTrainingId(doc);

          if (previousTrainingId && previousTrainingId !== currentTrainingId) {
            await syncTrainingRating(req, previousTrainingId);
          }
        }

        const currentTrainingId = getTrainingId(doc);

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
          req.payload.logger.info("Training review emails are disabled in Email Settings.");
          return;
        }

        const adminEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const variables = {
          adminEmail,
          formName: "Training review",
          submitterName: doc.authorName || "",
          submitterEmail: doc.authorEmail || "",
          submitterPhone: "",
          source: doc.trainingAttended || String(currentTrainingId || ""),
          message: [
            doc.rating ? `Rating: ${doc.rating}` : "",
            doc.authorRole ? `Role: ${doc.authorRole}` : "",
            doc.quote || "",
          ].filter(Boolean).join("\n"),
        };
        const notificationTemplate = await renderEmailTemplate({
          req,
          slug: "simple-form-notification",
          variables,
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
        const confirmationTemplate = await renderEmailTemplate({
          req,
          slug: "simple-form-confirmation",
          variables,
          fallback: {
            subject: "We received your {{formName}} submission",
            text: [
              "Hi {{submitterName}},",
              "",
              "Thank you for your {{formName}} submission. Our team will review it and contact you with the next steps.",
            ].join("\n"),
            html: `
          <p>Hi {{submitterName}},</p>
          <p>Thank you for your {{formName}} submission. Our team will review it and contact you with the next steps.</p>
        `,
          },
        });

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(notificationTemplate, {
              to: adminEmail,
              from,
              replyTo: doc.authorEmail || undefined,
              subject: notificationTemplate.subject,
              text: notificationTemplate.text,
              html: notificationTemplate.html,
            }),
          });

          if (doc.authorEmail) {
            await sendCmsEmail({
              req,
              settings,
              message: buildTemplateEmailMessage(confirmationTemplate, {
                to: doc.authorEmail,
                from,
                replyTo: adminEmail,
                subject: confirmationTemplate.subject,
                text: confirmationTemplate.text,
                html: confirmationTemplate.html,
              }),
            });
          }
        } catch (error) {
          req.payload.logger.error("Failed to send training review emails.");
          req.payload.logger.error(error);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (isSeedImport(req)) return;

        await syncTrainingRating(req, getTrainingId(doc));
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
      name: "training",
      type: "relationship",
      relationTo: "trainings",
      required: true,
    },
    {
      name: "trainer",
      type: "relationship",
      relationTo: "trainers" as any,
      admin: {
        description: "Optional direct trainer profile for displaying this review on trainer detail pages.",
      },
    },
    { name: "authorName", type: "text", required: true },
    {
      name: "authorEmail",
      type: "email",
      admin: {
        description: "Private contact email captured from public review submissions.",
      },
    },
    { name: "authorRole", type: "text" },
    {
      name: "trainingAttended",
      type: "text",
      admin: {
        description: "Training label entered by the reviewer on the public form.",
      },
    },
    { name: "dateLabel", type: "text" },
    { name: "quote", type: "textarea", required: true },
    { name: "rating", type: "number", required: true, defaultValue: 5, min: 1, max: 5 },
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
