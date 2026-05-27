import React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  BookOpenText,
  CalendarDays,
  ImageIcon,
  Mail,
  MessageSquareQuote,
  Star,
  UserRoundCheck,
} from "lucide-react";
import type { AdminViewServerProps, CollectionSlug, Where } from "payload";
import { withCmsBasePath } from "./adminBasePath";

type TrainingSummary = {
  docs: {
    endDate?: string | null;
    startDate?: string | null;
  }[];
};

type LeadsSummary = {
  docs: {
    message?: string | null;
    siteSlug?: string | null;
  }[];
  totalDocs: number;
};

type PractitionerSummary = {
  totalDocs: number;
};

type CountSummary = {
  totalDocs: number;
};

type Metric = {
  label: string;
  value: number;
  tone?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
};

type ModuleCard = {
  accent: "teal" | "blue" | "amber" | "purple" | "green" | "red";
  href: string;
  icon: React.ReactNode;
  metrics: Metric[];
  subtitle: string;
  title: string;
  total: number;
};

type GraphItem = {
  label: string;
  value: number;
  tone: NonNullable<Metric["tone"]>;
};

const dashboardStyles = `
.eftmra-dashboard {
  --dash-ink: #252542;
  --dash-muted: #69677e;
  --dash-line: #e3e7f1;
  min-height: calc(100vh - 6rem);
  padding: 3rem;
  background: #f4f6fb;
  color: var(--dash-ink);
}
.eftmra-dashboard, .eftmra-dashboard * { box-sizing: border-box; }
.eftmra-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 100rem;
  margin: 0 auto 1rem;
}
.eftmra-dashboard__eyebrow,
.eftmra-dashboard-widget__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--dash-muted);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
.eftmra-dashboard__title {
  margin: 0;
  color: var(--dash-ink);
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.1;
}
.eftmra-dashboard__crumb {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  color: #7d56cc;
  box-shadow: 0 10px 28px rgba(47, 43, 61, 0.1);
}
.eftmra-dashboard-overview,
.eftmra-dashboard__widgets,
.eftmra-dashboard-graphs {
  max-width: 100rem;
  margin-right: auto;
  margin-left: auto;
}
.eftmra-dashboard-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.42fr);
  gap: 1rem;
  margin-top: 1rem;
}
.eftmra-dashboard-panel,
.eftmra-dashboard-widget {
  min-width: 0;
  border: 1px solid rgba(221, 225, 236, 0.95);
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(47, 43, 61, 0.07);
}
.eftmra-dashboard-panel {
  padding: 1.2rem;
}
.eftmra-dashboard-panel__header,
.eftmra-dashboard-widget__header,
.eftmra-dashboard-widget__heading {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}
.eftmra-dashboard-panel__header,
.eftmra-dashboard-widget__header {
  justify-content: space-between;
}
.eftmra-dashboard-panel__title,
.eftmra-dashboard-widget__title {
  margin: 0;
  color: var(--dash-ink);
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.25;
}
.eftmra-dashboard-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1.1rem;
}
.eftmra-dashboard-stat {
  min-height: 5.5rem;
  min-width: 0;
  border-radius: 0.78rem;
  padding: 0.9rem 0.95rem;
  background: var(--tone-bg);
}
.eftmra-dashboard-stat__label,
.eftmra-dashboard-bar__meta span {
  display: block;
  color: var(--dash-muted);
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.25;
}
.eftmra-dashboard-stat__value {
  display: block;
  margin-top: 0.4rem;
  color: var(--tone);
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
}
.eftmra-dashboard__widgets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.eftmra-dashboard-widget {
  position: relative;
  overflow: hidden;
  padding: 1rem;
}
.eftmra-dashboard-widget:before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 0.28rem;
  background: linear-gradient(90deg, var(--accent), var(--accent-soft));
}
.eftmra-dashboard-widget__icon {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.78rem;
  background: var(--accent-bg);
  color: var(--accent);
}
.eftmra-dashboard-widget__primary {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  margin-top: 1.05rem;
}
.eftmra-dashboard-widget__number {
  color: var(--dash-ink);
  font-size: 2.15rem;
  font-weight: 850;
  line-height: 1;
}
.eftmra-dashboard-widget__label {
  color: var(--dash-muted);
  font-size: 0.86rem;
  font-weight: 700;
}
.eftmra-dashboard-widget__metrics {
  display: grid;
  gap: 0.62rem;
  margin: 1rem 0 0;
}
.eftmra-dashboard-widget__metrics div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  border-radius: 0.68rem;
  padding: 0.68rem 0.72rem;
  background: var(--tone-bg);
}
.eftmra-dashboard-widget__metrics dt {
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 750;
}
.eftmra-dashboard-widget__metrics dd {
  margin: 0;
  color: var(--tone);
  font-size: 1.28rem;
  font-weight: 850;
}
.eftmra-dashboard-action {
  display: inline-flex;
  min-height: 1.9rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #dfe4ee;
  border-radius: 999px;
  background: #fff;
  padding: 0 0.72rem;
  color: #252542;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
}
.eftmra-dashboard-action:hover,
.eftmra-dashboard-action:focus-visible {
  border-color: rgba(47, 128, 237, 0.35);
  background: #eef5ff;
  color: #1f6fe5;
  text-decoration: none;
}
.eftmra-dashboard-graphs {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(20rem, 0.65fr);
  gap: 2rem;
  margin-top: 2rem;
}
.eftmra-dashboard-chart {
  display: grid;
  grid-template-columns: repeat(6, minmax(3.5rem, 1fr));
  align-items: end;
  gap: 0.8rem;
  min-height: 17rem;
  margin-top: 1.2rem;
  border-bottom: 1px solid var(--dash-line);
  background:
    linear-gradient(to bottom, transparent 0 24%, rgba(227, 231, 241, 0.6) 24% 25%, transparent 25% 49%, rgba(227, 231, 241, 0.6) 49% 50%, transparent 50% 74%, rgba(227, 231, 241, 0.6) 74% 75%, transparent 75%);
}
.eftmra-dashboard-chart__item {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.65rem;
  height: 100%;
  min-width: 0;
}
.eftmra-dashboard-chart__bar-wrap {
  display: flex;
  align-items: end;
  justify-content: center;
  min-height: 13rem;
}
.eftmra-dashboard-chart__bar {
  display: flex;
  width: min(3.4rem, 78%);
  min-height: 0.5rem;
  align-items: flex-start;
  justify-content: center;
  border-radius: 0.45rem 0.45rem 0 0;
  background: linear-gradient(180deg, var(--tone-soft), var(--tone));
  color: #ffffff;
  padding-top: 0.55rem;
  font-size: 0.86rem;
  font-weight: 850;
  box-shadow: 0 12px 22px var(--tone-shadow);
}
.eftmra-dashboard-chart__label {
  overflow: hidden;
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eftmra-dashboard-bars {
  display: grid;
  gap: 0.95rem;
  margin-top: 1.2rem;
}
.eftmra-dashboard-bar__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.45rem;
}
.eftmra-dashboard-bar__meta strong {
  color: var(--dash-ink);
  font-size: 1rem;
}
.eftmra-dashboard-bar__track {
  display: block;
  height: 0.72rem;
  overflow: hidden;
  border-radius: 999px;
  background: #edf0f6;
}
.eftmra-dashboard-bar__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--tone), var(--tone-soft));
}
.eftmra-dashboard-donut {
  display: grid;
  width: min(12rem, 100%);
  aspect-ratio: 1;
  place-items: center;
  margin: 1.1rem auto 0;
  border-radius: 999px;
  background:
    radial-gradient(circle, #ffffff 0 47%, transparent 48%),
    conic-gradient(#1cab68 0 var(--published), #2f80ed var(--published) calc(var(--published) + var(--draft)), #edf0f6 0);
}
.eftmra-dashboard-donut span,
.eftmra-dashboard-donut small { grid-area: 1 / 1; }
.eftmra-dashboard-donut span {
  color: var(--dash-ink);
  font-size: 2.05rem;
  font-weight: 850;
  line-height: 1;
  transform: translateY(-0.35rem);
}
.eftmra-dashboard-donut small {
  color: var(--dash-muted);
  font-size: 0.84rem;
  font-weight: 800;
  transform: translateY(0.95rem);
}
.eftmra-dashboard-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
.eftmra-dashboard-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: var(--dash-muted);
  font-size: 0.84rem;
  font-weight: 800;
}
.eftmra-dashboard-legend span:before {
  content: "";
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  background: var(--tone);
}
.eftmra-dashboard [data-accent="teal"] { --accent: #00a6a0; --accent-soft: #55d8d2; --accent-bg: #dcf8f6; }
.eftmra-dashboard [data-accent="blue"] { --accent: #2f80ed; --accent-soft: #6fb0ff; --accent-bg: #e5f0ff; }
.eftmra-dashboard [data-accent="amber"] { --accent: #f5a623; --accent-soft: #ffd16a; --accent-bg: #fff3d8; }
.eftmra-dashboard [data-accent="purple"] { --accent: #7d56cc; --accent-soft: #aa8cec; --accent-bg: #f0eaff; }
.eftmra-dashboard [data-accent="green"] { --accent: #1cab68; --accent-soft: #6dd99f; --accent-bg: #e4f8ed; }
.eftmra-dashboard [data-accent="red"] { --accent: #ff5a70; --accent-soft: #ff91a0; --accent-bg: #ffe8ec; }
.eftmra-dashboard [data-tone="teal"] { --tone: #00a6a0; --tone-soft: #55d8d2; --tone-bg: #dcf8f6; --tone-shadow: rgba(0, 166, 160, 0.18); }
.eftmra-dashboard [data-tone="blue"] { --tone: #2f80ed; --tone-soft: #6fb0ff; --tone-bg: #e5f0ff; --tone-shadow: rgba(47, 128, 237, 0.18); }
.eftmra-dashboard [data-tone="amber"] { --tone: #f5a623; --tone-soft: #ffd16a; --tone-bg: #fff3d8; --tone-shadow: rgba(245, 166, 35, 0.2); }
.eftmra-dashboard [data-tone="purple"] { --tone: #7d56cc; --tone-soft: #aa8cec; --tone-bg: #f0eaff; --tone-shadow: rgba(125, 86, 204, 0.18); }
.eftmra-dashboard [data-tone="green"] { --tone: #1cab68; --tone-soft: #6dd99f; --tone-bg: #e4f8ed; --tone-shadow: rgba(28, 171, 104, 0.18); }
.eftmra-dashboard [data-tone="red"] { --tone: #ff5a70; --tone-soft: #ff91a0; --tone-bg: #ffe8ec; --tone-shadow: rgba(255, 90, 112, 0.18); }
@media (max-width: 1440px) {
  .eftmra-dashboard__widgets { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .eftmra-dashboard-overview,
  .eftmra-dashboard-graphs { grid-template-columns: 1fr; }
  .eftmra-dashboard-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 780px) {
  .eftmra-dashboard { padding: 1rem; }
  .eftmra-dashboard__widgets,
  .eftmra-dashboard-stats { grid-template-columns: 1fr; }
  .eftmra-dashboard-chart { grid-template-columns: repeat(6, minmax(2.9rem, 1fr)); gap: 0.45rem; }
  .eftmra-dashboard-chart__bar { width: min(2.5rem, 82%); }
}
`;

function getEventStatus(training: TrainingSummary["docs"][number], now = new Date()) {
  if (!training.startDate) {
    return "upcoming";
  }

  const start = new Date(training.startDate);
  const end = training.endDate ? new Date(training.endDate) : start;

  if (Number.isNaN(start.getTime())) {
    return "upcoming";
  }

  if (now < start) {
    return "upcoming";
  }

  if (now <= end) {
    return "ongoing";
  }

  return "past";
}

function countCollection(
  req: AdminViewServerProps["initPageResult"]["req"],
  collection: CollectionSlug,
  where?: Where
) {
  return req.payload.count({
    collection,
    overrideAccess: true,
    ...(where ? { where } : {}),
  }) as Promise<CountSummary>;
}

function getPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

async function getDashboardStats(req: AdminViewServerProps["initPageResult"]["req"]) {
  const [    
    trainings,
    practitioners,
    publishedPractitioners,
    draftPractitioners,
    homepagePractitioners,    
    leads,
    publishedTrainings,
    draftTrainings,
    gallery,
    publishedGallery,
    draftGallery,
    visibleGallery,
    posts,
    publishedPosts,
    draftPosts,
    featuredPosts,
    testimonials,
    publishedTestimonials,
    draftTestimonials,
    videoTestimonials,
    writtenTestimonials,
    homepageTestimonials,
  ] = await Promise.all([
      req.payload.find({
        collection: "trainings",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          endDate: true,
          startDate: true,
        },
      }) as Promise<TrainingSummary>,
      countCollection(req, "practitioners") as Promise<PractitionerSummary>,
      countCollection(req, "practitioners", { status: { equals: "published" } }) as Promise<PractitionerSummary>,
      countCollection(req, "practitioners", { status: { equals: "draft" } }) as Promise<PractitionerSummary>,
      countCollection(req, "practitioners", { showOnHomepage: { equals: true } }) as Promise<PractitionerSummary>,
      req.payload.find({
        collection: "leads",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          message: true,
          siteSlug: true,
        },
      }) as Promise<LeadsSummary>,
      countCollection(req, "trainings", { status: { equals: "published" } }),
      countCollection(req, "trainings", { status: { equals: "draft" } }),
      countCollection(req, "gallery"),
      countCollection(req, "gallery", { status: { equals: "published" } }),
      countCollection(req, "gallery", { status: { equals: "draft" } }),
      countCollection(req, "gallery", { showInGalleryPage: { equals: true } }),
      countCollection(req, "posts"),
      countCollection(req, "posts", { status: { equals: "published" } }),
      countCollection(req, "posts", { status: { equals: "draft" } }),
      countCollection(req, "posts", { featured: { equals: true } }),
      countCollection(req, "testimonials"),
      countCollection(req, "testimonials", { status: { equals: "published" } }),
      countCollection(req, "testimonials", { status: { equals: "draft" } }),
      countCollection(req, "testimonials", { type: { equals: "video" } }),
      countCollection(req, "testimonials", { type: { equals: "written" } }),
      countCollection(req, "testimonials", { showOnHomepage: { equals: true } }),
    ]);

  const trainingCounts = trainings.docs.reduce(
    (counts, training) => {
      const status = getEventStatus(training);
      counts[status] += 1;
      return counts;
    },
    {
      ongoing: 0,
      past: 0,
      upcoming: 0,
    }
  );

  const leadCounts = leads.docs.reduce(
    (counts, lead) => {
      if (lead.message?.trim()) {
        counts.withMessage += 1;
      } else {
        counts.contactOnly += 1;
      }

      if (lead.siteSlug?.trim()) {
        counts.siteTagged += 1;
      }

      return counts;
    },
    {
      contactOnly: 0,
      siteTagged: 0,
      withMessage: 0,
    }
  );

  return {
    practitioners: {
      draft: draftPractitioners.totalDocs,
      featured: homepagePractitioners.totalDocs,
      published: publishedPractitioners.totalDocs,
      total: practitioners.totalDocs,
    },
    leads: {
      ...leadCounts,
      total: leads.totalDocs,
    },
    gallery: {
      draft: draftGallery.totalDocs,
      published: publishedGallery.totalDocs,
      total: gallery.totalDocs,
      visible: visibleGallery.totalDocs,
    },
    posts: {
      draft: draftPosts.totalDocs,
      featured: featuredPosts.totalDocs,
      published: publishedPosts.totalDocs,
      total: posts.totalDocs,
    },
    testimonials: {
      draft: draftTestimonials.totalDocs,
      homepage: homepageTestimonials.totalDocs,
      published: publishedTestimonials.totalDocs,
      total: testimonials.totalDocs,
      video: videoTestimonials.totalDocs,
      written: writtenTestimonials.totalDocs,
    },
    trainings: {
      ...trainingCounts,
      draft: draftTrainings.totalDocs,
      published: publishedTrainings.totalDocs,
      total: trainings.docs.length,
    },
  };
}

function DashboardAction({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Slot
      className={[
        "eftmra-dashboard-action",
        "inline-flex min-h-8 items-center justify-center rounded-xl border border-[#dfe4ee]",
        "bg-white px-3 text-xs font-semibold text-[#252542] no-underline",
        "transition hover:border-[#2f80ed]/30 hover:bg-[#eef5ff] hover:text-[#1f6fe5]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Slot>
  );
}

function DashboardStat({ label, value, tone = "blue" }: Metric) {
  return (
    <div className="eftmra-dashboard-stat" data-tone={tone}>
      <span className="eftmra-dashboard-stat__label">{label}</span>
      <strong className="eftmra-dashboard-stat__value">{value}</strong>
    </div>
  );
}

function ModuleWidget({ accent, href, icon, metrics, subtitle, title, total }: ModuleCard) {
  return (
    <article className="eftmra-dashboard-widget" data-accent={accent}>
      <div className="eftmra-dashboard-widget__header">
        <div className="eftmra-dashboard-widget__heading">
          <span className="eftmra-dashboard-widget__icon" aria-hidden="true">
            {icon}
          </span>
          <div>
            <p className="eftmra-dashboard-widget__eyebrow">{subtitle}</p>
            <h2 className="eftmra-dashboard-widget__title">{title}</h2>
          </div>
        </div>
        <DashboardAction>
          <a href={href}>View</a>
        </DashboardAction>
      </div>
      <div className="eftmra-dashboard-widget__primary">
        <span className="eftmra-dashboard-widget__number">{total}</span>
        <span className="eftmra-dashboard-widget__label">Total records</span>
      </div>
      <dl className="eftmra-dashboard-widget__metrics">
        {metrics.map((metric) => (
          <div key={metric.label} data-tone={metric.tone}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function ContentBar({ label, value, total, tone }: Metric & { total: number }) {
  return (
    <div className="eftmra-dashboard-bar" data-tone={tone}>
      <div className="eftmra-dashboard-bar__meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <span className="eftmra-dashboard-bar__track">
        <span
          className="eftmra-dashboard-bar__fill"
          style={{ width: `${getPercent(value, total)}%` }}
        />
      </span>
    </div>
  );
}

function VerticalBarChart({ items }: { items: GraphItem[] }) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="eftmra-dashboard-chart" role="img" aria-label="Records by module chart">
      {items.map((item) => (
        <div className="eftmra-dashboard-chart__item" data-tone={item.tone} key={item.label}>
          <div className="eftmra-dashboard-chart__bar-wrap">
            <div
              className="eftmra-dashboard-chart__bar"
              style={{ height: `${Math.max(8, getPercent(item.value, maxValue))}%` }}
            >
              {item.value}
            </div>
          </div>
          <span className="eftmra-dashboard-chart__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export async function EftmraDashboard(props: AdminViewServerProps) {
  const stats = await getDashboardStats(props.initPageResult.req);
  const contentTotal =
    stats.practitioners.total +
    stats.trainings.total +
    stats.gallery.total +
    stats.posts.total +
    stats.testimonials.total +
    stats.leads.total;
  const publishedTotal =
    stats.practitioners.published +
    stats.trainings.published +
    stats.gallery.published +
    stats.posts.published +
    stats.testimonials.published;
  const draftTotal =
    stats.practitioners.draft +
    stats.trainings.draft +
    stats.gallery.draft +
    stats.posts.draft +
    stats.testimonials.draft;
  const homepageTotal =
    stats.practitioners.featured + stats.gallery.visible + stats.posts.featured + stats.testimonials.homepage;
  const activeTrainingTotal = stats.trainings.upcoming + stats.trainings.ongoing;
  const contentItems: GraphItem[] = [
    { label: "Practitioners", value: stats.practitioners.total, tone: "teal" },
    { label: "Trainings", value: stats.trainings.total, tone: "blue" },
    { label: "Gallery", value: stats.gallery.total, tone: "amber" },
    { label: "Blogs", value: stats.posts.total, tone: "purple" },
    { label: "Testimonials", value: stats.testimonials.total, tone: "green" },
    { label: "Leads", value: stats.leads.total, tone: "red" },
  ];

  const modules: ModuleCard[] = [
    {
      accent: "red",
      href: withCmsBasePath("/admin/collections/leads"),
      icon: <Mail size={22} />,
      metrics: [
        { label: "With message", value: stats.leads.withMessage, tone: "red" },
        { label: "Contact only", value: stats.leads.contactOnly, tone: "blue" },
        { label: "Site tagged", value: stats.leads.siteTagged, tone: "amber" },
      ],
      subtitle: "CRM",
      title: "Leads",
      total: stats.leads.total,
    },
    {
      accent: "teal",
      href: withCmsBasePath("/admin/collections/practitioners"),
      icon: <UserRoundCheck size={22} />,
      metrics: [
        { label: "Published", value: stats.practitioners.published, tone: "green" },
        { label: "Drafts", value: stats.practitioners.draft, tone: "blue" },
        { label: "Homepage", value: stats.practitioners.featured, tone: "amber" },
      ],
      subtitle: "Directory",
      title: "Practitioners",
      total: stats.practitioners.total,
    },
    {
      accent: "blue",
      href: withCmsBasePath("/admin/collections/trainings"),
      icon: <CalendarDays size={22} />,
      metrics: [
        { label: "Upcoming", value: stats.trainings.upcoming, tone: "blue" },
        { label: "Ongoing", value: stats.trainings.ongoing, tone: "green" },
        { label: "Past", value: stats.trainings.past, tone: "purple" },
      ],
      subtitle: "Programs",
      title: "Trainings",
      total: stats.trainings.total,
    },
    {
      accent: "amber",
      href: withCmsBasePath("/admin/collections/gallery"),
      icon: <ImageIcon size={22} />,
      metrics: [
        { label: "Published", value: stats.gallery.published, tone: "green" },
        { label: "Drafts", value: stats.gallery.draft, tone: "blue" },
        { label: "Visible", value: stats.gallery.visible, tone: "amber" },
      ],
      subtitle: "Albums",
      title: "Gallery",
      total: stats.gallery.total,
    },
    {
      accent: "purple",
      href: withCmsBasePath("/admin/collections/posts"),
      icon: <BookOpenText size={22} />,
      metrics: [
        { label: "Published", value: stats.posts.published, tone: "green" },
        { label: "Drafts", value: stats.posts.draft, tone: "blue" },
        { label: "Featured", value: stats.posts.featured, tone: "purple" },
      ],
      subtitle: "Resources",
      title: "Blogs",
      total: stats.posts.total,
    },
    {
      accent: "green",
      href: withCmsBasePath("/admin/collections/testimonials"),
      icon: <MessageSquareQuote size={22} />,
      metrics: [
        { label: "Written", value: stats.testimonials.written, tone: "green" },
        { label: "Video", value: stats.testimonials.video, tone: "purple" },
        { label: "Homepage", value: stats.testimonials.homepage, tone: "amber" },
      ],
      subtitle: "Social proof",
      title: "Testimonials",
      total: stats.testimonials.total,
    },    
  ];

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
    <main className="eftmra-dashboard">
  
      {/* <section className="eftmra-dashboard-overview" aria-label="Content statistics">
        <div className="eftmra-dashboard-panel eftmra-dashboard-panel--wide">
          <div className="eftmra-dashboard-panel__header">
            <div>
              <p className="eftmra-dashboard-widget__eyebrow">Content Statistics</p>
              <h2 className="eftmra-dashboard-panel__title">EFTMRA CMS at a glance</h2>
            </div>
          </div>
          <div className="eftmra-dashboard-stats">
            <DashboardStat label="All Records" value={contentTotal} tone="teal" />
            <DashboardStat label="Published" value={publishedTotal} tone="green" />
            <DashboardStat label="Drafts" value={draftTotal} tone="blue" />
            <DashboardStat label="Homepage Picks" value={homepageTotal} tone="amber" />
            <DashboardStat label="Active Trainings" value={activeTrainingTotal} tone="purple" />
          </div>
        </div>

        <div className="eftmra-dashboard-panel">
          <div className="eftmra-dashboard-panel__header">
            <div>
              <p className="eftmra-dashboard-widget__eyebrow">Status Mix</p>
              <h2 className="eftmra-dashboard-panel__title">Published vs drafts</h2>
            </div>
          </div>
          <div
            className="eftmra-dashboard-donut"
            style={{
              "--published": `${getPercent(publishedTotal, contentTotal)}%`,
              "--draft": `${getPercent(draftTotal, contentTotal)}%`,
            } as React.CSSProperties}
          >
            <span>{publishedTotal}</span>
            <small>published</small>
          </div>
          <div className="eftmra-dashboard-legend">
            <span data-tone="green">Published {publishedTotal}</span>
            <span data-tone="blue">Drafts {draftTotal}</span>
          </div>
        </div>
      </section> */}

      <section className="eftmra-dashboard__widgets" aria-label="Dashboard widgets">
        {modules.map((module) => (
          <ModuleWidget key={module.title} {...module} />
        ))}
      </section>

      <section className="eftmra-dashboard-graphs" aria-label="Dashboard graphs">
        <div className="eftmra-dashboard-panel">
          <div className="eftmra-dashboard-panel__header">
            <div>
              <p className="eftmra-dashboard-widget__eyebrow">Content Mix</p>
              <h2 className="eftmra-dashboard-panel__title">Records by module</h2>
            </div>
          </div>
          <VerticalBarChart items={contentItems} />
        </div>

        <div className="eftmra-dashboard-panel">
          <div className="eftmra-dashboard-panel__header">
            <div>
              <p className="eftmra-dashboard-widget__eyebrow">Distribution</p>
              <h2 className="eftmra-dashboard-panel__title">Module share</h2>
            </div>
          </div>
          <div className="eftmra-dashboard-bars">
            {contentItems.map((item) => (
              <ContentBar key={item.label} {...item} total={contentTotal} />
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

export default EftmraDashboard;
