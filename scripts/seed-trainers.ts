import "dotenv/config";
import path from "path";
import { getPayload } from "payload";
import configPromise from "../payload.config";
import trainersSeed from "../src/seeds/trainers.json";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

type MediaDoc = {
  id: number;
  filename?: string | null;
};

type SiteDoc = {
  id: number;
  slug: string;
};

type TrainerSeed = {
  name: string;
  role: string;
  status?: "draft" | "published";
  image?: {
    filename?: string | null;
    alt?: string | null;
  } | null;
  imageFilename?: string;
  imageAlt?: string | null;
  displayOrder: number;
  showOnHomepage?: boolean | null;
  slug?: string;
  tagline?: string;
  aboutTitle?: string;
  aboutLabel?: string | null;
  aboutParagraphs?: ({ content?: string | null } | string)[];
  credentials?: ({ label?: string | null } | string)[];
  specializations?: ({ label?: string | null } | string)[];
  philosophy?: string;
  email?: string;
  socialLinks?: { platform: "linkedin" | "facebook" | "instagram" | "youtube"; href: string }[];
};

const imageRoot = path.resolve(process.cwd(), "media");

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstName(name: string) {
  return name.replace(/^Dr\.?\s*/i, "").split(/\s+/)[0] || name;
}

function getImageFilename(seed: TrainerSeed) {
  return seed.imageFilename || seed.image?.filename || null;
}

function getImageAlt(seed: TrainerSeed) {
  return seed.imageAlt || seed.image?.alt || seed.name;
}

function normalizeTextArray(values: (Record<string, string | null | undefined> | string)[] | undefined, key: "content" | "label") {
  return (values || [])
    .map((item) => (typeof item === "string" ? item : item[key]))
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

async function ensureMedia(payload: PayloadClient, filename: string, alt: string) {
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

  return (await payload.create({
    collection: "media",
    data: {
      alt,
    },
    filePath: path.join(imageRoot, filename),
  })) as MediaDoc;
}

async function ensureSite(payload: PayloadClient) {
  const existing = await payload.find({
    collection: "sites",
    where: {
      slug: {
        equals: "/",
      },
    },
    limit: 1,
  });

  if (existing.docs[0]) {
    return existing.docs[0] as SiteDoc;
  }

  return (await payload.create({
    collection: "sites",
    data: {
      name: "EFTMRA India",
      slug: "/",
      layoutType: "platform-home",
    },
  })) as SiteDoc;
}

function trainerDefaults(seed: TrainerSeed) {
  const shortName = firstName(seed.name);
  const aboutParagraphs = normalizeTextArray(seed.aboutParagraphs, "content");
  const credentials = normalizeTextArray(seed.credentials, "label");
  const specializations = normalizeTextArray(seed.specializations, "label");

  return {
    tagline:
      seed.tagline ||
      `${seed.name} is part of the EFTMRA India trainer faculty, supporting students with practical, ethical, and compassionate EFT learning.`,
    aboutTitle: seed.aboutTitle || "Certified EFTMRA Training with Heart",
    aboutParagraphs: aboutParagraphs.length > 0 ? aboutParagraphs : [
      `${seed.name} has walked the EFT path as a practitioner, learner, and educator committed to passing on high standards of EFT training.`,
      "Their work supports EFTMRA India's mission to build a generation of skilled, ethical, and compassionate EFT practitioners across the country.",
    ],
    credentials: credentials.length > 0 ? credentials : ["EFTMRA Trainer", "EFTMRA Certified Practitioner", "EFTMRA India faculty"],
    specializations: specializations.length > 0 ? specializations : ["EFT foundations", "Student practice", "Emotional wellbeing", "Professional learning"],
    philosophy:
      seed.philosophy ||
      "Training should be clear, safe, and practical, giving students the confidence to use EFT responsibly in real life.",
    aboutLabel: seed.aboutLabel || `About ${shortName}`,
    email: seed.email || "hello@eftmraindia.com",
    socialLinks: seed.socialLinks || [],
  };
}

const trainers = trainersSeed as TrainerSeed[];

async function upsertTrainer(payload: PayloadClient, site: SiteDoc, seed: TrainerSeed) {
  const imageFilename = getImageFilename(seed);
  const image = imageFilename ? await ensureMedia(payload, imageFilename, getImageAlt(seed)) : null;
  const slug = slugify(seed.slug || seed.name);
  const defaults = trainerDefaults(seed);
  const existing = await payload.find({
    collection: "trainers" as any,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });
  const data = {
    status: seed.status || "published",
    site: site.id,
    displayOrder: seed.displayOrder,
    showOnHomepage: seed.showOnHomepage !== false,
    name: seed.name,
    slug,
    role: seed.role,
    tagline: defaults.tagline,
    image: image?.id,
    imageAlt: getImageAlt(seed),
    aboutLabel: defaults.aboutLabel,
    aboutTitle: defaults.aboutTitle,
    aboutParagraphs: defaults.aboutParagraphs.map((content) => ({ content })),
    credentials: defaults.credentials.map((label) => ({ label })),
    specializations: defaults.specializations.map((label) => ({ label })),
    philosophy: defaults.philosophy,
    email: defaults.email,
    socialLinks: defaults.socialLinks,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "trainers" as any,
      id: existing.docs[0].id,
      data,
    });
    console.log(`Updated trainer: ${seed.name}`);
    return;
  }

  await payload.create({
    collection: "trainers" as any,
    data,
  });
  console.log(`Created trainer: ${seed.name}`);
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const site = await ensureSite(payload);

  for (const trainer of trainers) {
    await upsertTrainer(payload, site, trainer);
  }

  console.log(`Seeded ${trainers.length} trainers from src/seeds/trainers.json.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
