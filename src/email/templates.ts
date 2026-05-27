import type { PayloadRequest } from "payload";
import type { SendEmailOptions } from "payload";

type TemplateVariables = Record<string, string | number | boolean | null | undefined>;

type EmailTemplateDoc = {
  bccEmail?: string | null;
  ccEmail?: string | null;
  enabled?: boolean | null;
  subject?: string | null;
  replyToEmail?: string | null;
  senderEmail?: string | null;
  senderName?: string | null;
  preheader?: string | null;
  html?: string | null;
  text?: string | null;
  toEmail?: string | null;
};

export type EmailTemplateFallback = {
  subject: string;
  html: string;
  text?: string;
};

export type RenderedEmailTemplate = {
  bcc?: string;
  cc?: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  to?: string;
};

export function buildTemplateEmailMessage(
  template: RenderedEmailTemplate,
  defaults: SendEmailOptions,
): SendEmailOptions {
  return {
    ...defaults,
    bcc: template.bcc || defaults.bcc,
    cc: template.cc || defaults.cc,
    from: template.from || defaults.from,
    html: template.html,
    replyTo: template.replyTo || defaults.replyTo,
    subject: template.subject,
    text: template.text,
    to: template.to || defaults.to,
  };
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function render(value: string, variables: TemplateVariables, escapeValues: boolean) {
  return value.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    const replacement = variables[key];
    const normalized = replacement == null ? "" : String(replacement);

    return escapeValues ? escapeHtml(normalized) : normalized;
  });
}

export async function renderEmailTemplate({
  req,
  slug,
  variables,
  fallback,
}: {
  req: PayloadRequest;
  slug: string;
  variables: TemplateVariables;
  fallback: EmailTemplateFallback;
}): Promise<RenderedEmailTemplate> {
  const result = await req.payload
    .find({
      collection: "email-templates",
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            enabled: {
              equals: true,
            },
          },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    })
    .catch((error) => {
      req.payload.logger.warn(`Could not load email template "${slug}". Using fallback.`);
      req.payload.logger.warn(error);
      return null;
    });

  const template = result?.docs?.[0] as EmailTemplateDoc | undefined;
  const subject = template?.subject || fallback.subject;
  const html = template?.html || fallback.html;
  const preheader = template?.preheader ? `<span style="display:none!important;">${escapeHtml(template.preheader)}</span>` : "";
  const renderedHtml = `${preheader}${render(html, variables, true)}`;
  const renderedText = render(template?.text || fallback.text || stripHtml(html), variables, false);
  const senderName = template?.senderName ? render(template.senderName, variables, false) : "";
  const senderEmail = template?.senderEmail ? render(template.senderEmail, variables, false) : "";

  return {
    bcc: template?.bccEmail ? render(template.bccEmail, variables, false) : undefined,
    cc: template?.ccEmail ? render(template.ccEmail, variables, false) : undefined,
    from: senderEmail ? (senderName ? `${senderName} <${senderEmail}>` : senderEmail) : undefined,
    replyTo: template?.replyToEmail ? render(template.replyToEmail, variables, false) : undefined,
    subject: render(subject, variables, false),
    html: renderedHtml,
    text: renderedText,
    to: template?.toEmail ? render(template.toEmail, variables, false) : undefined,
  };
}
