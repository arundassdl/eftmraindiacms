import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import configPromise from "../payload.config";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

type WordPressRenderedField = {
  rendered?: string;
};

type WordPressEmbeddedTerm = {
  name?: string;
};

type WordPressFeaturedMedia = {
  source_url?: string;
  alt_text?: string;
};

type WordPressAuthor = {
  name?: string;
};

type WordPressPost = {
  slug: string;
  status: string;
  date?: string;
  link?: string;
  title?: WordPressRenderedField;
  excerpt?: WordPressRenderedField;
  content?: WordPressRenderedField;
  _embedded?: {
    author?: WordPressAuthor[];
    "wp:featuredmedia"?: WordPressFeaturedMedia[];
    "wp:term"?: WordPressEmbeddedTerm[][];
  };
};

const WORDPRESS_POSTS_ENDPOINT = "https://www.eftmraindia.com/wp-json/wp/v2/posts?_embed&per_page=100&page=";
const BLOG_MEDIA_TEMP_DIR = path.resolve(process.cwd(), ".tmp-wordpress-blog-media");

function decodeHtml(value?: string) {
  if (!value) return "";

  return value
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8230;/g, "...")
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value?: string) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReadTime(html?: string) {
  const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeBase || "image"}${ext.toLowerCase()}`;
}

function getFilenameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const filename = pathname.split("/").filter(Boolean).pop() || "image.jpg";
    return sanitizeFilename(filename);
  } catch {
    return "image.jpg";
  }
}

function collectImageUrlsFromHtml(html?: string) {
  if (!html) return [];

  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  const urls = new Set<string>();

  for (const match of matches) {
    const url = match[1]?.trim();
    if (url && /^https?:\/\//i.test(url)) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}

function extractAltForImageUrl(html: string, imageUrl: string) {
  const escapedUrl = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<img[^>]+src=["']${escapedUrl}["'][^>]*alt=["']([^"']*)["'][^>]*>|<img[^>]+alt=["']([^"']*)["'][^>]*src=["']${escapedUrl}["'][^>]*>`, "i");
  const match = html.match(regex);
  return match?.[1]?.trim() || match?.[2]?.trim() || "";
}

async function ensureTempDir() {
  await fs.mkdir(BLOG_MEDIA_TEMP_DIR, { recursive: true });
}

async function downloadFile(url: string, targetPath: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://www.eftmraindia.com/blog/",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
}

async function ensureMediaFromUrl(payload: PayloadClient, sourceUrl: string, alt?: string) {
  const normalizedUrl = sourceUrl.trim();
  const filename = getFilenameFromUrl(normalizedUrl);

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

  await ensureTempDir();

  const tempPath = path.join(BLOG_MEDIA_TEMP_DIR, filename);
  await downloadFile(normalizedUrl, tempPath);

  try {
    return await payload.create({
      collection: "media",
      data: {
        alt: alt ?? null,
      },
      filePath: tempPath,
    });
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

async function localizeHtmlImages(payload: PayloadClient, html?: string) {
  if (!html?.trim()) {
    return html ?? "";
  }

  let nextHtml = html;
  const imageUrls = collectImageUrlsFromHtml(html);

  for (const imageUrl of imageUrls) {
    const media = await ensureMediaFromUrl(payload, imageUrl, extractAltForImageUrl(html, imageUrl));
    const localUrl = typeof media.url === "string" ? media.url : imageUrl;

    nextHtml = nextHtml.split(imageUrl).join(localUrl);
  }

  return nextHtml;
}

async function fetchWordPressPosts() {
  const allPosts: WordPressPost[] = [];

  for (let page = 1; page < 20; page += 1) {
    const response = await fetch(`${WORDPRESS_POSTS_ENDPOINT}${page}`);

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) break;
      throw new Error(`Failed to fetch WordPress posts page ${page}: ${response.status}`);
    }

    const posts = (await response.json()) as WordPressPost[];
    if (!posts.length) break;

    allPosts.push(...posts);

    const totalPagesHeader = response.headers.get("x-wp-totalpages");
    if (totalPagesHeader && page >= Number(totalPagesHeader)) break;
  }

  return allPosts;
}

async function ensureSite(payload: PayloadClient) {
  const siteResult = await payload.find({
    collection: "sites",
    where: {
      slug: {
        equals: "/",
      },
    },
    limit: 1,
  });

  const site = siteResult.docs[0];
  if (!site) {
    throw new Error('Main site with slug "/" was not found. Seed or create the site first.');
  }

  return site;
}

async function ensureCategory(payload: PayloadClient, name: string) {
  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  const existing = await payload.find({
    collection: "categories",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (existing.docs[0]) {
    return existing.docs[0].id;
  }

  const category = await payload.create({
    collection: "categories",
    data: {
      name: trimmedName,
      slug,
    },
  });

  return category.id;
}

async function upsertPost(payload: PayloadClient, siteId: number, post: WordPressPost) {
  const existing = await payload.find({
    collection: "posts",
    where: {
      and: [
        {
          slug: {
            equals: post.slug,
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

  const title = stripHtml(post.title?.rendered);
  const excerpt = stripHtml(post.excerpt?.rendered) || stripHtml(post.content?.rendered).slice(0, 220);
  const authorName = post._embedded?.author?.[0]?.name?.trim() || "EFTMRA India";
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const categoryTerms = post._embedded?.["wp:term"]?.[0] ?? [];
  const categoryNames = categoryTerms.map((term) => term?.name?.trim()).filter(Boolean) as string[];
  const categoryIds = await Promise.all(categoryNames.map((name) => ensureCategory(payload, name)));
  const localizedHtml = await localizeHtmlImages(payload, post.content?.rendered ?? "");
  const featuredImageDoc = featuredMedia?.source_url
    ? await ensureMediaFromUrl(payload, featuredMedia.source_url, featuredMedia.alt_text?.trim() || title)
    : null;

  const statusValue = (post.status === "publish" ? "published" : "draft") as "published" | "draft";
  const data = {
    title,
    slug: post.slug,
    status: statusValue,
    _status: statusValue,
    site: siteId,
    publishedAt: post.date ?? null,
    authorName,
    readTime: estimateReadTime(post.content?.rendered),
    canonicalPath: `/blog/${post.slug}`,
    excerpt,
    categories: categoryIds,
    featuredImage: featuredImageDoc?.id ?? null,
    featuredImageExternalUrl: null,
    featuredImageAlt: featuredMedia?.alt_text?.trim() || title,
    contentHTML: localizedHtml,
    seoTitle: title,
    seoDescription: excerpt,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "posts",
      id: existing.docs[0].id,
      data,
    });
    console.log(`Updated post: ${post.slug}`);
    return;
  }

  await payload.create({
    collection: "posts",
    data,
  });
  console.log(`Created post: ${post.slug}`);
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const site = await ensureSite(payload);
  const posts = await fetchWordPressPosts();

  console.log(`Fetched ${posts.length} WordPress posts from eftmraindia.com`);

  for (const post of posts) {
    await upsertPost(payload, site.id, post);
  }

  console.log("WordPress blog migration completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
