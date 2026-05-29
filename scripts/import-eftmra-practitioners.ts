import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import configPromise from "../payload.config";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

type CertificateAttachment = {
  title: string;
  sourceUrl: string;
};

type PractitionerCertificate = {
  title: string;
  file: number;
  sourceUrl: string;
};

type ImportedPractitioner = {
  sourceId: string;
  name: string;
  slug: string;
  sourceUrl: string;
  category: "eft-practitioner" | "eft-advanced" | "matrix";
  categoryKeys: ("eft-practitioner" | "eft-advanced" | "matrix")[];
  categoryLabels: string[];
  imageUrl?: string;
  imageAlt?: string;
  hours?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  sourceReviewCount?: number;
  certificates: CertificateAttachment[];
};

const DIRECTORY_PAGE_URL = "https://www.eftmraindia.com/practitioners-directory/?wpbdp_view=all_listings";
const CATEGORY_PAGE_URLS = [
  {
    url: "https://www.eftmraindia.com/practitioners-directory/wpbdp_category/eft-practitioners/",
    categoryKey: "eft-practitioner" as const,
  },
  {
    url: "https://www.eftmraindia.com/practitioners-directory/wpbdp_category/eft-advanced-practitioner/",
    categoryKey: "eft-advanced" as const,
  },
  {
    url: "https://www.eftmraindia.com/practitioners-directory/wpbdp_category/matrix-reimprinting-practitioners/",
    categoryKey: "matrix" as const,
  },
];
const TEMP_DIR = path.resolve(process.cwd(), ".tmp-practitioner-media");
const MAX_PAGES = 30;

const cityPatterns: { label: string; state?: string; pattern: RegExp }[] = [
  { label: "Mumbai", state: "Maharashtra", pattern: /\bmumbai\b/i },
  { label: "Delhi", state: "Delhi", pattern: /\b(delhi|new delhi)\b/i },
  { label: "Bengaluru", state: "Karnataka", pattern: /\b(bengaluru|bangalore)\b/i },
  { label: "Gurugram", state: "Haryana", pattern: /\b(gurugram|gurgaon)\b/i },
  { label: "Noida", state: "Uttar Pradesh", pattern: /\bnoida\b/i },
  { label: "Pune", state: "Maharashtra", pattern: /\bpune\b/i },
  { label: "Hyderabad", state: "Telangana", pattern: /\bhyderabad\b/i },
  { label: "Chennai", state: "Tamil Nadu", pattern: /\bchennai\b/i },
  { label: "Kolkata", state: "West Bengal", pattern: /\bkolkata\b/i },
  { label: "Ahmedabad", state: "Gujarat", pattern: /\bahmedabad\b/i },
  { label: "Guwahati", state: "Assam", pattern: /\bguwahati\b/i },
  { label: "Jaipur", state: "Rajasthan", pattern: /\bjaipur\b/i },
  { label: "Lucknow", state: "Uttar Pradesh", pattern: /\blucknow\b/i },
  { label: "Chandigarh", pattern: /\bchandigarh\b/i },
  { label: "Kochi", state: "Kerala", pattern: /\b(kochi|cochin)\b/i },
  { label: "Thiruvananthapuram", state: "Kerala", pattern: /\b(thiruvananthapuram|trivandrum)\b/i },
  { label: "Indore", state: "Madhya Pradesh", pattern: /\bindore\b/i },
  { label: "Bhopal", state: "Madhya Pradesh", pattern: /\bbhopal\b/i },
  { label: "Nagpur", state: "Maharashtra", pattern: /\bnagpur\b/i },
  { label: "Surat", state: "Gujarat", pattern: /\bsurat\b/i },
  { label: "Vadodara", state: "Gujarat", pattern: /\b(vadodara|baroda)\b/i },
  { label: "Goa", state: "Goa", pattern: /\bgoa\b/i },
  { label: "Dehradun", state: "Uttarakhand", pattern: /\bdehradun\b/i },
  { label: "Online", pattern: /\bonline\b/i },
];

function decodeHtml(value?: string) {
  if (!value) return "";

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value?: string) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeBase || "practitioner"}${ext.toLowerCase() || ".jpg"}`;
}

function getFilenameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return sanitizeFilename(parsed.pathname.split("/").filter(Boolean).pop() || "practitioner.jpg");
  } catch {
    return "practitioner.jpg";
  }
}

function resolveUrl(value: string, baseUrl: string) {
  return new URL(decodeHtml(value), baseUrl).toString();
}

function getPageUrl(page: number) {
  if (page === 1) return DIRECTORY_PAGE_URL;
  return `https://www.eftmraindia.com/practitioners-directory/page/${page}/?wpbdp_view=all_listings`;
}

function getCategoryPageUrl(baseUrl: string, page: number) {
  if (page === 1) return baseUrl;
  return `${baseUrl.replace(/\/$/, "")}/page/${page}/`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function extractFirst(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.trim();
}

function extractField(block: string, fieldClass: string) {
  const start = block.search(new RegExp(`wpbdp-field-${fieldClass}\\b`));
  if (start < 0) return "";

  const valueStart = block.indexOf('<div class="value">', start);
  if (valueStart < 0) return "";

  const contentStart = valueStart + '<div class="value">'.length;
  const nextField = block.indexOf('<div class="wpbdp-field-display', contentStart);
  const addressInfo = block.indexOf('<div class="address-info', contentStart);
  const candidates = [nextField, addressInfo].filter((index) => index > -1);
  const contentEnd = candidates.length ? Math.min(...candidates) : block.length;

  return stripHtml(block.slice(contentStart, contentEnd).replace(/<\/div>\s*$/i, ""));
}

function extractFieldHref(block: string, fieldClass: string) {
  const start = block.search(new RegExp(`wpbdp-field-${fieldClass}\\b`));
  if (start < 0) return "";

  const nextField = block.indexOf('<div class="wpbdp-field-display', start + 1);
  const slice = block.slice(start, nextField > -1 ? nextField : undefined);
  const href = extractFirst(slice, /<a[^>]+href=["']([^"']+)["']/i);

  return decodeHtml(href?.replace(/^mailto:/i, "") ?? extractField(block, fieldClass));
}

function extractAttribute(tag: string, name: string) {
  return decodeHtml(
    extractFirst(tag, new RegExp(`${name}=["']([^"']*)["']`, "i")) ?? ""
  );
}

function titleFromCertificateUrl(sourceUrl: string, practitionerName: string) {
  try {
    const parsed = new URL(sourceUrl);
    const filename = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
    const title = path.basename(filename, path.extname(filename)).replace(/[-_]+/g, " ").trim();

    return title ? `${title} certificate` : `${practitionerName} certificate`;
  } catch {
    return `${practitionerName} certificate`;
  }
}

function titleCaseFilename(value: string) {
  return value
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function getFallbackCertificatePdfUrls(practitioner: Pick<ImportedPractitioner, "name" | "slug" | "sourceUrl">) {
  const origin = new URL(practitioner.sourceUrl).origin;
  const uploadsBase = `${origin}/wp-content/uploads/2022/09`;
  const compactName = titleCaseFilename(practitioner.name);
  const slugTitle = titleCaseFilename(practitioner.slug);
  const filenames = Array.from(new Set([
    compactName,
    slugTitle,
    practitioner.slug,
  ].filter(Boolean)));

  return filenames.map((filename) => `${uploadsBase}/${filename}.pdf`);
}

async function pdfExists(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        Accept: "application/pdf,*/*;q=0.8",
        Referer: "https://www.eftmraindia.com/practitioners-directory/",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function resolveCertificateAttachments(html: string, practitioner: ImportedPractitioner): Promise<CertificateAttachment[]> {
  const attachments = extractCertificateAttachments(html, practitioner.sourceUrl, practitioner.name);

  if (attachments.length > 0) {
    return attachments;
  }

  for (const sourceUrl of getFallbackCertificatePdfUrls(practitioner)) {
    if (await pdfExists(sourceUrl)) {
      return [
        {
          title: titleFromCertificateUrl(sourceUrl, practitioner.name),
          sourceUrl,
        },
      ];
    }
  }

  return [];
}

function extractCertificateAttachments(html: string, pageUrl: string, practitionerName: string): CertificateAttachment[] {
  const attachments = new Map<string, CertificateAttachment>();
  const anchorPattern = /<a\b[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi;
  const rawPdfPattern = /https?:\/\/[^"'\s<>]+\.pdf(?:[?#][^"'\s<>]*)?/gi;
  const pdfPattern = /\.pdf$/i;

  function addAttachment(sourceUrl: string, title: string) {
    attachments.set(sourceUrl, {
      title: title.replace(/\s+/g, " ").trim(),
      sourceUrl,
    });
  }

  for (const match of html.matchAll(rawPdfPattern)) {
    let sourceUrl: string;
    try {
      sourceUrl = resolveUrl(match[0], pageUrl);
    } catch {
      continue;
    }

    const pathname = decodeURIComponent(new URL(sourceUrl).pathname);

    if (!pathname.includes("/wp-content/uploads/")) {
      continue;
    }

    addAttachment(sourceUrl, titleFromCertificateUrl(sourceUrl, practitionerName));
  }

  const candidates = [
    ...Array.from(html.matchAll(anchorPattern), (match) => ({ tag: match[0], attribute: "href" })),
  ];

  for (const candidate of candidates) {
    const rawUrl = extractAttribute(candidate.tag, candidate.attribute);

    if (!rawUrl || rawUrl.startsWith("#") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:")) {
      continue;
    }

    let sourceUrl: string;
    try {
      sourceUrl = resolveUrl(rawUrl, pageUrl);
    } catch {
      continue;
    }

    const parsedUrl = new URL(sourceUrl);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const isUploadMedia = pathname.includes("/wp-content/uploads/");

    if (!pdfPattern.test(pathname) || !isUploadMedia) {
      continue;
    }

    const tagText = stripHtml(candidate.tag);
    const altText = extractAttribute(candidate.tag, "alt") || extractAttribute(candidate.tag, "title");
    const title = altText || tagText || titleFromCertificateUrl(sourceUrl, practitionerName);
    addAttachment(sourceUrl, title);
  }

  return Array.from(attachments.values());
}

function extractAddress(block: string) {
  const start = block.indexOf('<div class="address-info');
  if (start < 0) return "";

  const end = block.indexOf("</div>\n\t\t\t\t\t\t\n\t\t</div>", start);
  const slice = block.slice(start, end > -1 ? end : undefined);
  const address = extractFirst(slice, /<span class="field-label address-label">Practice Address<\/span>\s*<div>([\s\S]*?)<\/div>/i);

  return stripHtml(address);
}

function splitListingBlocks(html: string) {
  return html
    .split(/(?=<div id="wpbdp-listing-\d+")/g)
    .filter((block) => /^<div id="wpbdp-listing-\d+"/.test(block));
}

function parseListing(block: string): ImportedPractitioner | null {
  const sourceId = extractFirst(block, /^<div id="wpbdp-listing-(\d+)"/);
  const sourceUrl = decodeHtml(extractFirst(block, /<div class="listing-title">[\s\S]*?<a href=["']([^"']+)["']/i) ?? "");
  const name = stripHtml(extractFirst(block, /<div class="listing-title">[\s\S]*?<h3><a[^>]*>([\s\S]*?)<\/a><\/h3>/i));

  if (!sourceId || !sourceUrl || !name) return null;

  const imageUrl = decodeHtml(extractFirst(block, /<div class="listing-thumbnail">[\s\S]*?<img[^>]+src=["']([^"']+)["']/i) ?? "");
  const imageAlt = stripHtml(extractFirst(block, /<div class="listing-thumbnail">[\s\S]*?<img[^>]+alt=["']([^"']*)["']/i)) || name;
  const categoryText = extractField(block, "listing_category");
  const categoryLabels = categoryText
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const hasMatrix = /matrix/i.test(categoryText);
  const hasAdvanced = /advanced/i.test(categoryText);
  const hasEft = /eft practitioners?/i.test(categoryText);
  const categoryKeys = [
    hasEft ? "eft-practitioner" : null,
    hasAdvanced ? "eft-advanced" : null,
    hasMatrix ? "matrix" : null,
  ].filter(Boolean) as ImportedPractitioner["categoryKeys"];

  return {
    sourceId,
    name,
    slug: slugify(sourceUrl.replace(/\/$/, "").split("/").pop() || name),
    sourceUrl,
    category: hasMatrix ? "matrix" : hasAdvanced ? "eft-advanced" : "eft-practitioner",
    categoryKeys: categoryKeys.length ? categoryKeys : [hasMatrix ? "matrix" : hasAdvanced ? "eft-advanced" : "eft-practitioner"],
    categoryLabels,
    imageUrl: imageUrl || undefined,
    imageAlt,
    hours: extractField(block, "contactable_hours") || undefined,
    website: extractFieldHref(block, "website") || undefined,
    phone: extractField(block, "phone") || undefined,
    email: extractFieldHref(block, "email") || undefined,
    address: extractAddress(block) || undefined,
    sourceReviewCount: Number(extractFirst(block, /<span class="count">\(<span class="val">(\d+)<\/span>\)<\/span>/i) ?? 0),
    certificates: [],
  };
}

async function fetchPractitioners() {
  const practitioners = new Map<string, ImportedPractitioner>();
  const authoritativeCategoryKeys = new Map<string, Set<ImportedPractitioner["categoryKeys"][number]>>();

  async function collectPageSet(getUrl: (page: number) => string, categoryKey?: ImportedPractitioner["categoryKeys"][number]) {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const html = await fetchText(getUrl(page));
      const listings = splitListingBlocks(html).map(parseListing).filter(Boolean) as ImportedPractitioner[];

      if (!listings.length) break;

      for (const practitioner of listings) {
        if (categoryKey) {
          const keys = authoritativeCategoryKeys.get(practitioner.slug) ?? new Set<ImportedPractitioner["categoryKeys"][number]>();
          keys.add(categoryKey);
          authoritativeCategoryKeys.set(practitioner.slug, keys);
        }

        const existing = practitioners.get(practitioner.slug);
        if (!existing) {
          practitioners.set(practitioner.slug, practitioner);
          continue;
        }

        practitioners.set(practitioner.slug, {
          ...existing,
          categoryKeys: Array.from(new Set([...existing.categoryKeys, ...practitioner.categoryKeys])),
          categoryLabels: Array.from(new Set([...existing.categoryLabels, ...practitioner.categoryLabels])),
        });
      }

      if (!/class="next"[^>]*>\s*<a/i.test(html)) break;
    }
  }

  await collectPageSet(getPageUrl);

  for (const category of CATEGORY_PAGE_URLS) {
    await collectPageSet((page) => getCategoryPageUrl(category.url, page), category.categoryKey);
  }

  const importedPractitioners = Array.from(practitioners.values())
    .map((practitioner) => {
      const categoryKeys = Array.from(authoritativeCategoryKeys.get(practitioner.slug) ?? []);
      const category: ImportedPractitioner["category"] = categoryKeys.includes("matrix")
        ? "matrix"
        : categoryKeys.includes("eft-advanced")
          ? "eft-advanced"
          : categoryKeys.includes("eft-practitioner")
            ? "eft-practitioner"
            : practitioner.category;

      return {
        ...practitioner,
        category,
        categoryKeys,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const practitioner of importedPractitioners) {
    try {
      const detailHtml = await fetchText(practitioner.sourceUrl);
      practitioner.certificates = await resolveCertificateAttachments(detailHtml, practitioner);
    } catch (error) {
      console.warn(`Skipped certificate lookup for ${practitioner.name}: ${practitioner.sourceUrl}`);
      console.warn(error);
    }
  }

  return importedPractitioners;
}

async function downloadFile(url: string, targetPath: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,application/pdf,*/*;q=0.8",
          Referer: "https://www.eftmraindia.com/practitioners-directory/",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status}`);
      }

      await fs.writeFile(targetPath, Buffer.from(await response.arrayBuffer()));
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to download ${url}`);
}

async function ensureMediaFromUrl(payload: PayloadClient, sourceUrl?: string, alt?: string) {
  if (!sourceUrl) return null;

  const filename = getFilenameFromUrl(sourceUrl);
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
    return existing.docs[0];
  }

  if (path.extname(filename).toLowerCase() !== ".pdf") {
    const existingByBase = await payload.find({
      collection: "media",
      where: {
        filename: {
          contains: path.basename(filename, path.extname(filename)),
        },
      },
      limit: 1,
    });

    if (existingByBase.docs[0]) {
      return existingByBase.docs[0];
    }
  }

  await fs.mkdir(TEMP_DIR, { recursive: true });
  const tempPath = path.join(TEMP_DIR, filename);
  try {
    await downloadFile(sourceUrl, tempPath);
  } catch (error) {
    console.warn(`Skipped media after repeated download failures: ${sourceUrl}`);
    console.warn(error);
    return null;
  }

  try {
    return await payload.create({
      collection: "media",
      data: {
        alt: alt || null,
      },
      filePath: tempPath,
    });
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

async function ensureSite(payload: PayloadClient) {
  const result = await payload.find({
    collection: "sites",
    where: {
      slug: {
        equals: "/",
      },
    },
    limit: 1,
  });

  const site = result.docs[0];
  if (!site) throw new Error('Main site with slug "/" was not found. Seed or create the site first.');

  return site;
}

function resolveLocation(address?: string) {
  if (!address) {
    return { cityLabel: "Online", cityKey: "online", availabilityMode: "online" as const };
  }

  const match = cityPatterns.find((item) => item.pattern.test(address));
  const isOnline = /\bonline\b/i.test(address);
  const cityLabel = match?.label ?? (isOnline ? "Online" : "India");

  return {
    cityLabel,
    cityKey: slugify(cityLabel),
    state: match?.state,
    availabilityMode: isOnline && cityLabel === "Online" ? ("online" as const) : isOnline ? ("both" as const) : ("in-person" as const),
  };
}

function resolveRole(practitioner: ImportedPractitioner) {
  if (practitioner.category === "matrix") return "Matrix Reimprinting Practitioner";
  if (practitioner.category === "eft-advanced") return "EFT Advanced Practitioner";
  return "EFT Practitioner";
}

function resolveSocialLinks(website?: string) {
  if (!website) return {};

  if (/linkedin\.com/i.test(website)) return { linkedin: website };
  if (/instagram\.com/i.test(website)) return { instagram: website };
  if (/facebook\.com/i.test(website)) return { facebook: website };

  return { website };
}

function cleanEmail(email?: string) {
  if (!email) return null;

  const normalized = email
    .replace(/\s+/g, "")
    .replace(/^mailto:/i, "")
    .trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

async function upsertPractitioner(payload: PayloadClient, siteId: number, practitioner: ImportedPractitioner) {
  const existing = await payload.find({
    collection: "practitioners",
    where: {
      and: [
        {
          slug: {
            equals: practitioner.slug,
          },
        },
        {
          site: {
            equals: siteId,
          },
        },
      ],
    },
    limit: 1,
  });
  const existingDoc = existing.docs[0];
  const media = await ensureMediaFromUrl(payload, practitioner.imageUrl, practitioner.imageAlt || practitioner.name);
  const certificates: PractitionerCertificate[] = (
    await Promise.all(
      practitioner.certificates.map(async (certificate) => {
        const certificateMedia = await ensureMediaFromUrl(payload, certificate.sourceUrl, certificate.title);

        if (!certificateMedia?.id) {
          return null;
        }

        return {
          title: certificate.title,
          file: Number(certificateMedia.id),
          sourceUrl: certificate.sourceUrl,
        };
      })
    )
  ).filter((certificate): certificate is PractitionerCertificate => certificate !== null);
  const location = resolveLocation(practitioner.address);
  const role = resolveRole(practitioner);
  const credentials = Array.from(new Set([role, ...practitioner.categoryLabels])).map((label) => ({ label }));
  const sourceReviewCount = practitioner.sourceReviewCount ?? 0;
  const socialLinks = resolveSocialLinks(practitioner.website);

  const data = {
    name: practitioner.name,
    slug: practitioner.slug,
    status: "published" as const,
    site: siteId,
    category: practitioner.category,
    categoryKeys: practitioner.categoryKeys,
    role,
    accent: "deep-teal" as const,
    showOnHomepage: false,
    profileTagline: `Registered ${role} with EFTMRA India.`,
    image: media?.id ?? (typeof existingDoc?.image === "number" ? existingDoc.image : null),
    imageAlt: practitioner.imageAlt || practitioner.name,
    cityLabel: location.cityLabel,
    cityKey: location.cityKey,
    state: location.state ?? null,
    country: "India",
    hours: practitioner.hours ?? null,
    addressLine1: practitioner.address ?? null,
    addressLine2: null,
    availabilityMode: location.availabilityMode,
    sessionFee: null,
    membershipNumber: practitioner.sourceId,
    certificationYear: null,
    languages: [{ label: "English" }],
    specialties: practitioner.categoryLabels.map((label) => ({ label })),
    credentials,
    certificates,
    email: cleanEmail(practitioner.email),
    phone: practitioner.phone ?? null,
    whatsapp: practitioner.phone ?? null,
    ...socialLinks,
    bio: null,
    approach: null,
    rating: sourceReviewCount > 0 ? 5 : null,
    reviews: sourceReviewCount,
    reviewsList: [],
  };

  if (existingDoc) {
    await payload.update({
      collection: "practitioners",
      id: existingDoc.id,
      data,
    });
    console.log(`Updated practitioner: ${practitioner.name} (${certificates.length} certificate attachment${certificates.length === 1 ? "" : "s"})`);
    return;
  }

  await payload.create({
    collection: "practitioners",
    data,
  });
  console.log(`Created practitioner: ${practitioner.name} (${certificates.length} certificate attachment${certificates.length === 1 ? "" : "s"})`);
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const site = await ensureSite(payload);
  const practitioners = await fetchPractitioners();

  console.log(`Fetched ${practitioners.length} practitioners from eftmraindia.com`);

  for (const practitioner of practitioners) {
    await upsertPractitioner(payload, site.id, practitioner);
  }

  await fs.rm(TEMP_DIR, { force: true, recursive: true });
  console.log("Practitioner migration completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
