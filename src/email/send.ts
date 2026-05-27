import nodemailer from "nodemailer";
import type { Payload, PayloadRequest, SendEmailOptions } from "payload";

export type EmailProvider =
  | "gmail"
  | "outlook"
  | "postmark"
  | "resend"
  | "sendgrid"
  | "sparkpost"
  | "yahoo"
  | "yandex"
  | "nodemailer";

export type EmailAuthMode = "api-key" | "smtp";

export type EmailAccount = {
  apiKey?: string | null;
  enabled?: boolean | null;
  authMode?: EmailAuthMode | null;
  fromEmail?: string | null;
  fromName?: string | null;
  label?: string | null;
  password?: string | null;
  port?: number | null;
  provider?: EmailProvider | null;
  secure?: boolean | null;
  smtpHost?: string | null;
  useAsDefault?: boolean | null;
  username?: string | null;
};

export type EmailSettings = {
  fromEmail?: string | null;
  fromName?: string | null;
  resendApiKey?: string | null;
};

type AddressValue =
  | string
  | {
      address?: string;
      name?: string;
    };

type NormalizedMessage = {
  bcc?: string | string[];
  cc?: string | string[];
  from: string;
  html: string;
  replyTo?: string | string[];
  subject: string;
  text: string;
  to: string | string[];
};

const smtpPresets: Partial<Record<EmailProvider, { host: string; port: number; secure: boolean }>> = {
  gmail: { host: "smtp.gmail.com", port: 465, secure: true },
  outlook: { host: "smtp.office365.com", port: 587, secure: false },
  yahoo: { host: "smtp.mail.yahoo.com", port: 465, secure: true },
  yandex: { host: "smtp.yandex.com", port: 465, secure: true },
};

function isAddressObject(value: unknown): value is Exclude<AddressValue, string> {
  return typeof value === "object" && value !== null;
}

function mapAddress(value: SendEmailOptions["to"]): string | string[] | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value
      .map((item) => mapAddress(item as SendEmailOptions["to"]))
      .flat()
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") return value;

  if (isAddressObject(value) && value.address) {
    return value.name ? `${value.name} <${value.address}>` : value.address;
  }

  return undefined;
}

function normalizeFrom(messageFrom: SendEmailOptions["from"], settings?: EmailSettings | null, account?: EmailAccount | null) {
  if (messageFrom) {
    if (typeof messageFrom === "string") return messageFrom;
    if (Array.isArray(messageFrom)) {
      const firstFrom = messageFrom[0];
      return typeof firstFrom === "string" ? firstFrom : `${firstFrom.name} <${firstFrom.address}>`;
    }
    return `${messageFrom.name} <${messageFrom.address}>`;
  }

  const fromName = account?.fromName || settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
  const fromEmail = account?.fromEmail || settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";

  return `${fromName} <${fromEmail}>`;
}

function normalizeMessage(message: SendEmailOptions, settings?: EmailSettings | null, account?: EmailAccount | null): NormalizedMessage {
  const to = mapAddress(message.to);

  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error("Email recipient is required.");
  }

  return {
    bcc: mapAddress(message.bcc),
    cc: mapAddress(message.cc),
    from: normalizeFrom(message.from, settings, account),
    html: message.html?.toString() || "",
    replyTo: mapAddress(message.replyTo),
    subject: message.subject || "",
    text: message.text?.toString() || "",
    to,
  };
}

function arrayify(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function findDefaultEmailAccount(payload?: Payload): Promise<EmailAccount | null> {
  if (!payload) return null;

  const defaultAccounts = await payload
    .find({
      collection: "email-accounts" as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { enabled: { not_equals: false } },
          { useAsDefault: { equals: true } },
        ],
      },
    })
    .catch(() => null);
  const defaultAccount = defaultAccounts?.docs?.[0] as EmailAccount | undefined;

  if (defaultAccount?.provider) return defaultAccount;

  const firstEnabledAccounts = await payload
    .find({
      collection: "email-accounts" as never,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        enabled: {
          not_equals: false,
        },
      },
    })
    .catch(() => null);
  const firstEnabledAccount = firstEnabledAccounts?.docs?.[0] as EmailAccount | undefined;

  return firstEnabledAccount?.provider ? firstEnabledAccount : null;
}

async function resolveAccount(settings?: EmailSettings | null, payload?: Payload): Promise<EmailAccount | null> {
  const configuredAccount = await findDefaultEmailAccount(payload);

  if (configuredAccount) return configuredAccount;

  if (settings?.resendApiKey || process.env.RESEND_API_KEY) {
    return {
      apiKey: settings?.resendApiKey || process.env.RESEND_API_KEY,
      enabled: true,
      fromEmail: settings?.fromEmail,
      fromName: settings?.fromName,
      provider: "resend",
      useAsDefault: true,
    };
  }

  return null;
}

function shouldUseSmtp(account: EmailAccount) {
  return account.authMode === "smtp" || account.provider === "nodemailer" || Boolean(account.smtpHost || account.username || account.password);
}

async function sendSmtpEmail(message: NormalizedMessage, account: EmailAccount) {
  const preset = account.provider ? smtpPresets[account.provider] : undefined;
  const host = account.smtpHost || preset?.host;
  const port = account.port || preset?.port || 587;

  if (!host) {
    throw new Error("SMTP host is required for this email account.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: account.secure ?? preset?.secure ?? port === 465,
    auth: account.username || account.password
      ? {
          user: account.username || account.fromEmail || "",
          pass: account.password || "",
        }
      : undefined,
  });

  return transporter.sendMail({
    bcc: message.bcc,
    cc: message.cc,
    from: message.from,
    html: message.html,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    to: message.to,
  });
}

async function sendResendEmail(message: NormalizedMessage, apiKey: string) {
  return fetchJsonEmail("https://api.resend.com/emails", {
    body: {
      bcc: message.bcc,
      cc: message.cc,
      from: message.from,
      html: message.html,
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
      to: message.to,
    },
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    success: (data) => Boolean(data?.id),
  });
}

async function sendSendGridEmail(message: NormalizedMessage, apiKey: string) {
  return fetchJsonEmail("https://api.sendgrid.com/v3/mail/send", {
    body: {
      content: [
        { type: "text/plain", value: message.text },
        { type: "text/html", value: message.html },
      ],
      from: parseEmailAddress(message.from),
      personalizations: [
        {
          bcc: arrayify(message.bcc).map(parseEmailAddress),
          cc: arrayify(message.cc).map(parseEmailAddress),
          subject: message.subject,
          to: arrayify(message.to).map(parseEmailAddress),
        },
      ],
      reply_to: arrayify(message.replyTo)[0] ? parseEmailAddress(arrayify(message.replyTo)[0]) : undefined,
      subject: message.subject,
    },
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    successStatus: 202,
  });
}

async function sendPostmarkEmail(message: NormalizedMessage, apiKey: string) {
  return fetchJsonEmail("https://api.postmarkapp.com/email", {
    body: {
      Bcc: arrayify(message.bcc).join(","),
      Cc: arrayify(message.cc).join(","),
      From: message.from,
      HtmlBody: message.html,
      ReplyTo: arrayify(message.replyTo).join(",") || undefined,
      Subject: message.subject,
      TextBody: message.text,
      To: arrayify(message.to).join(","),
    },
    headers: {
      "X-Postmark-Server-Token": apiKey,
    },
    success: (data) => Boolean(data?.MessageID),
  });
}

async function sendSparkPostEmail(message: NormalizedMessage, apiKey: string) {
  return fetchJsonEmail("https://api.sparkpost.com/api/v1/transmissions", {
    body: {
      content: {
        from: parseEmailAddress(message.from),
        html: message.html,
        reply_to: arrayify(message.replyTo).join(",") || undefined,
        subject: message.subject,
        text: message.text,
      },
      recipients: [
        ...arrayify(message.to).map((address) => ({ address: parseEmailAddress(address) })),
        ...arrayify(message.cc).map((address) => ({ address: parseEmailAddress(address), header_to: arrayify(message.to)[0] })),
        ...arrayify(message.bcc).map((address) => ({ address: parseEmailAddress(address), header_to: arrayify(message.to)[0] })),
      ],
    },
    headers: {
      Authorization: apiKey,
    },
    success: (data) => Boolean(data?.results?.id || data?.results?.total_accepted_recipients),
  });
}

async function fetchJsonEmail(
  url: string,
  options: {
    body: Record<string, unknown>;
    headers: Record<string, string>;
    success?: (data: any) => boolean;
    successStatus?: number;
  },
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => null);
  const ok = options.successStatus ? response.status === options.successStatus : response.ok && (options.success?.(data) ?? true);

  if (!ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.errors?.[0]?.message === "string"
          ? data.errors[0].message
          : `Email provider failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function parseEmailAddress(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);

  if (!match) return { email: value };

  return {
    email: match[2].trim(),
    name: match[1].replace(/^"|"$/g, "").trim() || undefined,
  };
}

export async function sendWithEmailSettings({
  message,
  payload,
  settings,
}: {
  message: SendEmailOptions;
  payload?: Payload;
  settings?: EmailSettings | null;
}) {
  const account = await resolveAccount(settings, payload);

  if (!account) {
    throw new Error("No enabled email provider account is configured.");
  }

  const normalizedMessage = normalizeMessage(message, settings, account);

  if (shouldUseSmtp(account)) {
    return sendSmtpEmail(normalizedMessage, account);
  }

  const apiKey = account.apiKey;

  if (!apiKey) {
    throw new Error("API key is required for this email provider.");
  }

  switch (account.provider) {
    case "postmark":
      return sendPostmarkEmail(normalizedMessage, apiKey);
    case "sendgrid":
      return sendSendGridEmail(normalizedMessage, apiKey);
    case "sparkpost":
      return sendSparkPostEmail(normalizedMessage, apiKey);
    case "resend":
    default:
      return sendResendEmail(normalizedMessage, apiKey);
  }
}

export async function sendCmsEmail({
  message,
  req,
  settings,
}: {
  message: SendEmailOptions;
  req: PayloadRequest;
  settings?: EmailSettings | null;
}) {
  try {
    return await sendWithEmailSettings({ message, payload: req.payload, settings });
  } catch (error) {
    if (error instanceof Error && error.message === "No enabled email provider account is configured.") {
      req.payload.logger.warn("No enabled email provider account is configured. Email was not sent.");
      return null;
    }

    throw error;
  }
}
