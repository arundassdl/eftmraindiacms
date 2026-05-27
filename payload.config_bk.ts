import path from "path";
import sharp from "sharp";
import { buildConfig, type CollectionConfig, type GlobalConfig } from "payload";
// import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { Users } from "./src/collections/Users";
import { Media } from "./src/collections/Media";
import { Sites } from "./src/collections/Sites";
import { Pages } from "./src/collections/Pages";
import { Posts } from "./src/collections/Posts";
import { Categories } from "./src/collections/Categories";
import { Leads } from "./src/collections/Leads";
import { Trainings } from "./src/collections/Trainings";
import { TrainingRegistrations } from "./src/collections/TrainingRegistrations";
import { Practitioners } from "./src/collections/Practitioners";
import { PractitionerRegistrations } from "./src/collections/PractitionerRegistrations";
import { Testimonials } from "./src/collections/Testimonials";
import { PractitionerReviews } from "./src/collections/PractitionerReviews";
import { TrainingReviews } from "./src/collections/TrainingReviews";
import { Gallery } from "./src/collections/Gallery";
import { HeroBlock } from "./src/blocks/HeroBlock";
import { CTAFormBlock } from "./src/blocks/CTAFormBlock";
import { HomeHeroBlock } from "./src/blocks/HomeHeroBlock";
import { EftmraHeroBlock } from "./src/blocks/EftmraHeroBlock";
import { EftmraTrustStripBlock } from "./src/blocks/EftmraTrustStripBlock";
import { EftmraExplainerBlock } from "./src/blocks/EftmraExplainerBlock";
import { EftmraCertificationBlock } from "./src/blocks/EftmraCertificationBlock";
import { EftmraPathwayBlock } from "./src/blocks/EftmraPathwayBlock";
import { EftmraCoursesBlock } from "./src/blocks/EftmraCoursesBlock";
import { EftmraPractitionersBlock } from "./src/blocks/EftmraPractitionersBlock";
import { EftmraTestimonialsBlock } from "./src/blocks/EftmraTestimonialsBlock";
import { EftmraFinalCtaBlock } from "./src/blocks/EftmraFinalCtaBlock";
import { EftmraPageHeaderBlock } from "./src/blocks/EftmraPageHeaderBlock";
import { EftmraCardGridBlock } from "./src/blocks/EftmraCardGridBlock";
import { EftmraContentSectionBlock } from "./src/blocks/EftmraContentSectionBlock";
import { EftmraMediaRowBlock } from "./src/blocks/EftmraMediaRowBlock";
import { EftmraContactSectionBlock } from "./src/blocks/EftmraContactSectionBlock";
import { EftmraProfileHeroBlock } from "./src/blocks/EftmraProfileHeroBlock";
import { EftmraReviewsBlock } from "./src/blocks/EftmraReviewsBlock";
import { EftmraTrainingDetailBlock } from "./src/blocks/EftmraTrainingDetailBlock";
import { EftmraLineageBlock } from "./src/blocks/EftmraLineageBlock";
import { EftmraPractitionerRegistrationBlock } from "./src/blocks/EftmraPractitionerRegistrationBlock";
import { EftmraTestimonialListingBlock } from "./src/blocks/EftmraTestimonialListingBlock";
import { Footer } from "./src/globals/Footer";
import { Header } from "./src/globals/Header";
import { RoleModuleVisibility } from "./src/globals/RoleModuleVisibility";
import {
  canCreate,
  canDelete,
  canRead,
  canUpdate,
  hasRole,
  type ModuleKey,
  publicCreate,
  publicRead,
  publishedOnly,
} from "./src/access/rbac";

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_WEB_URL ||
  "https://dev.socialdnalabs.com/devtest/eftmraindia_dev/cms";

function normalizePublicUrl(pathname: string) {
  const baseUrl = publicSiteUrl.replace(/\/+$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${baseUrl}${normalizedPath === "/home" ? "/" : normalizedPath}`;
}

function generateSeoUrl({ collectionSlug, doc }: { collectionSlug?: string; doc?: Record<string, unknown> | null }) {
  const slug = typeof doc?.slug === "string" ? doc.slug : "";

  if (collectionSlug === "posts") {
    const canonicalPath = typeof doc?.canonicalPath === "string" ? doc.canonicalPath : "";
    return normalizePublicUrl(canonicalPath || `/blog/${slug}`);
  }

  if (collectionSlug === "trainings") {
    return normalizePublicUrl(`/eft-training/${slug}`);
  }

  if (collectionSlug === "practitioners") {
    return normalizePublicUrl(`/practitioners/${slug}`);
  }

  if (collectionSlug === "pages") {
    if (!slug || slug === "home" || slug === "/") {
      return normalizePublicUrl("/");
    }

    return normalizePublicUrl(slug);
  }

  return normalizePublicUrl("/");
}

function parseOrigins(value?: string) {
  if (!value) {
    return defaultOrigins;
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultOrigins;
}

function withAccess(
  collection: CollectionConfig,
  access: NonNullable<CollectionConfig["access"]>,
  _moduleKey?: ModuleKey,
): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      ...access,
    },
  };
}

function globalWithAccess(
  global: GlobalConfig,
  access: NonNullable<GlobalConfig["access"]>,
  _moduleKey?: ModuleKey,
): GlobalConfig {
  return {
    ...global,
    access: {
      ...global.access,
      ...access,
    },
  };
}

const collections: CollectionConfig[] = [
  withAccess(
    Users,
    {
      read: canRead("users"),
      create: canCreate("users"),
      update: canUpdate("users"),
      delete: canDelete("users"),
    },
    "users",
  ),
  withAccess(Media, {
    read: publicRead("media"),
    create: canCreate("media"),
    update: canUpdate("media"),
    delete: canDelete("media"),
  }, "media"),
  withAccess(Sites, {
    read: publicRead("sites"),
    create: canCreate("sites"),
    update: canUpdate("sites"),
    delete: canDelete("sites"),
  }, "sites"),
  withAccess(Pages, {
    read: publishedOnly("pages"),
    create: canCreate("pages"),
    update: canUpdate("pages"),
    delete: canDelete("pages"),
  }, "pages"),
  withAccess(Posts, {
    read: publishedOnly("posts"),
    create: canCreate("posts"),
    update: canUpdate("posts"),
    delete: canDelete("posts"),
  }, "posts"),
  withAccess(Categories, {
    read: publicRead("categories"),
    create: canCreate("categories"),
    update: canUpdate("categories"),
    delete: canDelete("categories"),
  }, "categories"),
  withAccess(Leads, {
    read: canRead("leads"),
    create: publicCreate("leads"),
    update: canUpdate("leads"),
    delete: canDelete("leads"),
  }, "leads"),
  withAccess(Trainings, {
    read: publicRead("trainings"),
    create: canCreate("trainings"),
    update: canUpdate("trainings"),
    delete: canDelete("trainings"),
  }, "trainings"),
  withAccess(TrainingRegistrations, {
    read: canRead("training-registrations"),
    create: publicCreate("training-registrations"),
    update: canUpdate("training-registrations"),
    delete: canDelete("training-registrations"),
  }, "training-registrations"),
  withAccess(Practitioners, {
    read: publicRead("practitioners"),
    create: canCreate("practitioners"),
    update: canUpdate("practitioners"),
    delete: canDelete("practitioners"),
  }, "practitioners"),
  withAccess(PractitionerRegistrations, {
    read: canRead("practitioner-registrations"),
    create: publicCreate("practitioner-registrations"),
    update: canUpdate("practitioner-registrations"),
    delete: canDelete("practitioner-registrations"),
  }, "practitioner-registrations"),
  withAccess(Testimonials, {
    read: publishedOnly("testimonials"),
    create: canCreate("testimonials"),
    update: canUpdate("testimonials"),
    delete: canDelete("testimonials"),
  }, "testimonials"),
  withAccess(PractitionerReviews, {
    read: publicRead("practitioner-reviews"),
    create: publicCreate("practitioner-reviews"),
    update: canUpdate("practitioner-reviews"),
    delete: canDelete("practitioner-reviews"),
  }, "practitioner-reviews"),
  withAccess(TrainingReviews, {
    read: publicRead("training-reviews"),
    create: publicCreate("training-reviews"),
    update: canUpdate("training-reviews"),
    delete: canDelete("training-reviews"),
  }, "training-reviews"),
  withAccess(Gallery, {
    read: publicRead("gallery"),
    create: canCreate("gallery"),
    update: canUpdate("gallery"),
    delete: canDelete("gallery"),
  }, "gallery"),
];

const globals: GlobalConfig[] = [
  globalWithAccess(Header, {
    read: publicRead("header"),
    update: canUpdate("header"),
  }, "header"),
  globalWithAccess(Footer, {
    read: publicRead("footer"),
    update: canUpdate("footer"),
  }, "footer"),
  globalWithAccess(RoleModuleVisibility, {
    read: hasRole("admin"),
    update: hasRole("admin"),
  }),
];

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  editor: lexicalEditor(),
  collections,
  blocks: [
    HomeHeroBlock,
    HeroBlock,
    CTAFormBlock,
    EftmraHeroBlock,
    EftmraTrustStripBlock,
    EftmraExplainerBlock,
    EftmraCertificationBlock,
    EftmraPathwayBlock,
    EftmraCoursesBlock,
    EftmraPractitionersBlock,
    EftmraTestimonialsBlock,
    EftmraFinalCtaBlock,
    EftmraPageHeaderBlock,
    EftmraCardGridBlock,
    EftmraContentSectionBlock,
    EftmraMediaRowBlock,
    EftmraContactSectionBlock,
    EftmraProfileHeroBlock,
    EftmraReviewsBlock,
    EftmraTrainingDetailBlock,
    EftmraLineageBlock,
    EftmraPractitionerRegistrationBlock,
    EftmraTestimonialListingBlock,
  ],
  globals,
  plugins: [
    seoPlugin({
      collections: ["pages", "posts", "trainings", "practitioners"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) => {
        const seoTitle = typeof doc?.seoTitle === "string" ? doc.seoTitle : "";
        const title = typeof doc?.title === "string" ? doc.title : "";
        const name = typeof doc?.name === "string" ? doc.name : "";

        return seoTitle || title || name || "EFTMRA India";
      },
      generateDescription: ({ doc }) => {
        const seoDescription = typeof doc?.seoDescription === "string" ? doc.seoDescription : "";
        const excerpt = typeof doc?.excerpt === "string" ? doc.excerpt : "";
        const description = typeof doc?.description === "string" ? doc.description : "";
        const profileTagline = typeof doc?.profileTagline === "string" ? doc.profileTagline : "";

        return seoDescription || excerpt || description || profileTagline || "";
      },
      generateImage: ({ doc }) => {
        const image = doc?.featuredImage || doc?.image || doc?.posterImage;
        return typeof image === "number" || typeof image === "string" ? image : "";
      },
      generateURL: generateSeoUrl,
    }),
  ],
  // db: sqliteAdapter({
  //   client: {
  //     url: process.env.DATABASE_URL || "file:./evoq-payload.db",
  //   },
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",

  routes: {
    admin: '/admin',
    api: '/api',
  },

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " - EFTMRA India",
    },
    theme: "light",
    components: {
      beforeNav: [
        {
          path: "./src/components/admin/EftmraAdminNav.tsx",
          exportName: "default",
        },
      ],
      views: {
        dashboard: {
          Component: {
            path: "./src/components/admin/EftmraDashboard.tsx",
            exportName: "default",
          },
        },
      },
      graphics: {
        Icon: {
          path: "./src/components/admin/EftmraAdminIcon.tsx",
          exportName: "default",
        },
        Logo: {
          path: "./src/components/admin/EftmraAdminLogo.tsx",
          exportName: "default",
        },
      },
    },
  },
  cors: parseOrigins(process.env.PAYLOAD_CORS_ORIGINS),
  csrf: parseOrigins(process.env.PAYLOAD_CSRF_ORIGINS),
  typescript: {
    outputFile: path.resolve(process.cwd(), "src/payload-types.ts"),
  },
});
