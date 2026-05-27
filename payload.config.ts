import path from "path";
import sharp from "sharp";
import { buildConfig, type CollectionConfig, type GlobalConfig } from "payload";
// import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { Users } from "./src/collections/Users";
import { RoleManagement } from "./src/collections/RoleManagement";
import { Media } from "./src/collections/Media";
import { Sites } from "./src/collections/Sites";
import { Pages } from "./src/collections/Pages";
import { Posts } from "./src/collections/Posts";
import { Categories } from "./src/collections/Categories";
import { Leads } from "./src/collections/Leads";
import { EmailAccounts } from "./src/collections/EmailAccounts";
import { EmailTemplates } from "./src/collections/EmailTemplates";
import { Trainings } from "./src/collections/Trainings";
import { Trainers } from "./src/collections/Trainers";
import { TrainerContacts } from "./src/collections/TrainerContacts";
import { TrainingRegistrations } from "./src/collections/TrainingRegistrations";
import { Practitioners } from "./src/collections/Practitioners";
import { PractitionerContacts } from "./src/collections/PractitionerContacts";
import { PractitionerRegistrations } from "./src/collections/PractitionerRegistrations";
import { PractitionerRegistrationCountries } from "./src/collections/PractitionerRegistrationCountries";
import { PractitionerRegistrationSpecialties } from "./src/collections/PractitionerRegistrationSpecialties";
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
import { EftmraTrainerListingBlock } from "./src/blocks/EftmraTrainerListingBlock";
import { Footer } from "./src/globals/Footer";
import { Header } from "./src/globals/Header";
import { EmailSettings } from "./src/globals/EmailSettings";
import { RoleModuleVisibility } from "./src/globals/RoleModuleVisibility";
import { dynamicResendAdapter } from "./src/email/resendAdapter";
import {
  canCreate,
  canDelete,
  canRead,
  canReadUsersOrSelf,
  canUpdate,
  canUpdateUsersOrSelf,
  hasRole,
  type ModuleKey,
  publicCreate,
  publicRead,
  publishedOnly,
} from "./src/access/rbac";
import { withMaterioAdminFormLayout, withSeoCollapsibleBlock } from "./src/admin/formLayout";

const defaultOrigins = [
  //"http://localhost:3000",
  //"http://localhost:3001",
  "http://localhost:3010",
  "http://localhost:3011",
];

const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_WEB_URL ||
  "https://devtest.socialdnalabs.com/eftmraindia/cms";

const cmsBasePath = (process.env.NEXT_PUBLIC_CMS_BASE_PATH || "").replace(/\/$/, "");

function cmsAssetPath(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${cmsBasePath}${normalizedPath}`;
}

const eftmraListViewComponent = {
  path: "./src/components/admin/EftmraListView.tsx",
  exportName: "default",
} as const;

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
    return normalizePublicUrl(`/trainings-and-events/${slug}`);
  }

  if (collectionSlug === "trainers") {
    return normalizePublicUrl(`/trainers/${slug}`);
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
  const collectionWithLayout = withMaterioAdminFormLayout(collection);

  return {
    ...collectionWithLayout,
    access: {
      ...collectionWithLayout.access,
      ...access,
    },
    admin: {
      ...collectionWithLayout.admin,
      components: {
        ...collectionWithLayout.admin?.components,
        views: {
          ...collectionWithLayout.admin?.components?.views,
          list: {
            ...collectionWithLayout.admin?.components?.views?.list,
            Component: eftmraListViewComponent,
          },
        },
      },
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
  withAccess(Trainers, {
    read: publicRead("trainers"),
    create: canCreate("trainers"),
    update: canUpdate("trainers"),
    delete: canDelete("trainers"),
  }, "trainers"),
  withAccess(TrainerContacts, {
    read: canRead("trainer-contacts"),
    create: publicCreate("trainer-contacts"),
    update: canUpdate("trainer-contacts"),
    delete: canDelete("trainer-contacts"),
  }, "trainer-contacts"),
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
  withAccess(PractitionerContacts, {
    read: canRead("practitioner-contacts"),
    create: publicCreate("practitioner-contacts"),
    update: canUpdate("practitioner-contacts"),
    delete: canDelete("practitioner-contacts"),
  }, "practitioner-contacts"),
  withAccess(PractitionerRegistrations, {
    read: canRead("practitioner-registrations"),
    create: publicCreate("practitioner-registrations"),
    update: canUpdate("practitioner-registrations"),
    delete: canDelete("practitioner-registrations"),
  }, "practitioner-registrations"),
  withAccess(PractitionerRegistrationCountries, {
    read: publicRead("practitioner-registration-countries"),
    create: canCreate("practitioner-registration-countries"),
    update: canUpdate("practitioner-registration-countries"),
    delete: canDelete("practitioner-registration-countries"),
  }, "practitioner-registration-countries"),
  withAccess(PractitionerRegistrationSpecialties, {
    read: publicRead("practitioner-registration-specialties"),
    create: canCreate("practitioner-registration-specialties"),
    update: canUpdate("practitioner-registration-specialties"),
    delete: canDelete("practitioner-registration-specialties"),
  }, "practitioner-registration-specialties"),
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
   withAccess(EmailAccounts, {
    read: canRead("email-accounts"),
    create: canCreate("email-accounts"),
    update: canUpdate("email-accounts"),
    delete: canDelete("email-accounts"),
  }, "email-accounts"),
  withAccess(EmailTemplates, {
    read: canRead("email-templates"),
    create: canCreate("email-templates"),
    update: canUpdate("email-templates"),
    delete: canDelete("email-templates"),
  }, "email-templates"),
   withAccess(
    Users,
    {
      read: canReadUsersOrSelf(),
      create: canCreate("users"),
      update: canUpdateUsersOrSelf(),
      delete: canDelete("users"),
    },
    "users",
  ),
  withAccess(
    RoleManagement,
    {
      read: canRead("role-management"),
      create: canCreate("role-management"),
      update: canUpdate("role-management"),
      delete: canDelete("role-management"),
    },
    "role-management",
  ), 
  withAccess(Media, {
    read: publicRead("media"),
    create: publicCreate("media"),
    update: canUpdate("media"),
    delete: canDelete("media"),
  }, "media"),
  withAccess(Sites, {
    read: publicRead("sites"),
    create: canCreate("sites"),
    update: canUpdate("sites"),
    delete: canDelete("sites"),
  }, "sites"),
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
  globalWithAccess(EmailSettings, {
    read: hasRole("admin"),
    update: hasRole("admin"),
  }),
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
    EftmraTrainerListingBlock,
  ],
  globals,
  plugins: [
    seoPlugin({
      collections: ["pages", "posts", "trainings", "trainers", "practitioners"],
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
    (config) => ({
      ...config,
      collections: config.collections?.map((collection) => withSeoCollapsibleBlock(collection)) || [],
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
  email: dynamicResendAdapter,
  sharp,
  // serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
  serverURL:
    process.env.NEXT_PUBLIC_SERVER_URL || "https://devtest.socialdnalabs.com/eftmraindia/cms",

  routes: {
    admin: '/admin',
    api: '/api',
  },

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " - EFTMRA India",
      icons: [
        {
          rel: "icon",
          type: "image/png",
          url: cmsAssetPath("/favicon.png"),
        },
        {
          rel: "shortcut icon",
          type: "image/png",
          url: cmsAssetPath("/favicon.png"),
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          url: cmsAssetPath("/favicon.png"),
        },
      ],
    },
    theme: "light",
    components: {
      beforeNav: [
        {
          path: "./src/components/admin/EftmraAdminNav.tsx",
          exportName: "default",
        },
      ],
      beforeNavLinks: [
        {
          path: "./src/components/admin/EftmraAdminDashboardLink.tsx",
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
