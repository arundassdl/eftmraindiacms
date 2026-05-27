import { APIError, type PayloadEmailAdapter } from "payload";

import { type EmailSettings, sendWithEmailSettings } from "./send";

async function readEmailSettings(payload: Parameters<PayloadEmailAdapter>[0]["payload"]): Promise<EmailSettings> {
  const settings = await payload
    .findGlobal({
      slug: "email-settings",
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null);

  return (settings || {}) as EmailSettings;
}

export const dynamicResendAdapter: PayloadEmailAdapter = ({ payload }) => {
  const defaultFromAddress = process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
  const defaultFromName = process.env.EMAIL_FROM_NAME || "EFTMRA India";

  return {
    defaultFromAddress,
    defaultFromName,
    name: "admin-email-provider",
    async sendEmail(message) {
      try {
        const settings = await readEmailSettings(payload);
        return await sendWithEmailSettings({ message, payload, settings });
      } catch (error) {
        if (error instanceof Error) {
          throw new APIError(error.message, 500);
        }

        throw error;
      }
    },
  };
};
