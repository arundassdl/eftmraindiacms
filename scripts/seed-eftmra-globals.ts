import "dotenv/config";
import path from "path";
import { getPayload } from "payload";
import configPromise from "../payload.config";

type MediaDoc = {
  id: number;
  filename?: string | null;
};

async function ensureMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt?: string,
) {
  const existing = await payload.find({
    collection: "media",
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
  });

  if (existing.docs[0]) {
    return existing.docs[0] as MediaDoc;
  }

  const imageRoot = path.resolve(process.cwd(), "..", "..", "EFTMRAHTML", "images");

  return (await payload.create({
    collection: "media",
    data: {
      alt: alt ?? null,
    },
    filePath: path.join(imageRoot, filename),
  })) as MediaDoc;
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const logo = await ensureMedia(payload, "LogoMakr-0kSFrf-300dpi-1-300x300.webp", "EFTMRA India Logo");

  await payload.updateGlobal({
    slug: "header",
    data: {
      logoText: "EFTMRA India",
      logoSubtitle: "EFT & MATRIX REIMPRINTING ACADEMY INDIA",
      logoImage: logo.id,
      logoHref: "/",
      cta: {
        label: "",
        href: "",
      },
      menuItems: [
        { label: "Home", href: "/" },
        { label: "EFT Trainings", href: "/eft-training" },
        { label: "Practitioners", href: "/practitioners" },
        {
          label: "About EFTMRA",
          href: "#",
          subItems: [
            { label: "About Us", href: "/about" },
            { label: "Testimonials", href: "/testimonials" },
          ],
        },
        {
          label: "Resources",
          href: "#",
          subItems: [{ label: "Blog", href: "#" }],
        },
        { label: "Contact Us", href: "/contact" },
      ],
    } as any,
  });

  await payload.updateGlobal({
    slug: "footer",
    data: {
      backgroundColor: "#1A3B4C",
      textColor: "#FFFFFF",
      logoText: "EFTMRA India",
      logoImage: logo.id,
      logoHref: "/",
      tagline: "India's leading EFT academy, training and certifying practitioners to global standards.",
      columns: [
        {
          title: "Quick Links",
          links: [
            { label: "Home", href: "/" },
            { label: "EFT Trainings", href: "/eft-training" },
            { label: "Practitioners", href: "/practitioners" },
            { label: "About EFTMRA", href: "/about" },
            { label: "Testimonials", href: "/testimonials" },
            { label: "Contact Us", href: "/contact" },
          ],
        },
        {
          title: "Contact Us",
          content: "#2995, 12A Main, 5th Cross,\nIndiranagar 2nd Stage,\nBangalore – 560038",
          links: [
            { label: "hello@eftmraindia.com", href: "mailto:hello@eftmraindia.com" },
            { label: "+91 96633 33144", href: "tel:+919663333144" },
          ],
        },
      ],
      copyrightText: "© {Y} EFTMRA India. All rights reserved.",
      socialLinks: [
        {
          platform: "facebook",
          href: "https://www.facebook.com/EFT-MRA-India-EFT-Matrix-Reimprinting-Train-Mentor-110368871415358",
        },
        {
          platform: "instagram",
          href: "https://www.instagram.com/eftmraindia/",
        },
        {
          platform: "youtube",
          href: "https://www.youtube.com/@eftmraindia-eftmatrixreimp2451",
        },
        {
          platform: "whatsapp",
          href: "https://api.whatsapp.com/send?phone=+918073726665",
        },
      ],
    } as any,
  });

  console.log("EFTMRA header and footer globals updated.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
