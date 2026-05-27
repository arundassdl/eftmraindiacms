import React from "react";
import {
  BookOpenText,
  CalendarDays,
  ImageIcon,
  Mail,
  MessageSquareQuote,
  UserRoundCheck,
} from "lucide-react";
import type { AdminViewServerProps, CollectionSlug, Where } from "payload";
import { withCmsBasePath } from "./adminBasePath";
import {
  TrainingOverTimeWidget,
  TrainingTypeDistributionWidget,
} from "./TrainingEventsChart";
import type {
  TrainingChartDoc,
  TrainingRegistrationChartDoc,
} from "./TrainingEventsChart";
import {
  PractitionerGrowthWidget,
  PractitionerStatusOverviewWidget,
} from "./PractitionerCharts";
import type {
  PractitionerChartDoc,
  PractitionerRegistrationChartDoc,
} from "./PractitionerCharts";

type TrainingSummary = {
  docs: TrainingChartDoc[];
};

type LeadsSummary = {
  docs: {
    message?: string | null;
    siteSlug?: string | null;
  }[];
  totalDocs: number;
};

type PractitionerSummary = {
  docs: PractitionerChartDoc[];
  totalDocs: number;
};

type PractitionerRegistrationSummary = {
  docs: PractitionerRegistrationChartDoc[];
  totalDocs: number;
};

type TrainingRegistrationSummary = {
  docs: TrainingRegistrationChartDoc[];
  totalDocs: number;
};

type CountSummary = {
  totalDocs: number;
};

type Metric = {
  href?: string;
  icon?: React.ReactNode;
  label: string;
  value: number;
  tone?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
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
  --dash-blue: #214b7d;
  --dash-highlight: #bfe95c;
  min-height: calc(100vh - 6rem);
  padding: 3rem;
  background: #f7f9fc;
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
.eftmra-dashboard__widgets,
.eftmra-dashboard-graphs {
  max-width: 100rem;
  margin-right: auto;
  margin-left: auto;
}
.eftmra-dashboard-panel,
.eftmra-dashboard-counts {
  min-width: 0;
  border: 1px solid #dce6f3;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(31, 57, 88, 0.02);
}
.eftmra-dashboard-panel {
  overflow: visible;
  padding: 1.1rem 1rem 0.7rem;
}
.eftmra-dashboard-panel__header,
.eftmra-dashboard-panel__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.eftmra-dashboard-panel__title {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.25;
}
.eftmra-dashboard-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}
.eftmra-dashboard-filter {
  position: relative;
  display: inline-grid;
}
.eftmra-dashboard-filter span {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.eftmra-dashboard-filter select {
  min-height: 1.75rem;
  max-width: 11rem;
  border: 1px solid #d7e1ee;
  border-radius: 0.25rem;
  background-color: #ffffff;
  color: #315172;
  font-family: inherit;
  font-size: 0.90rem;
  font-weight: 500;
  line-height: 1;
  padding: 0 1.7rem 0 0.55rem;
}
.eftmra-dashboard-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  margin-top: 0.8rem;
}
.eftmra-dashboard-chart-legend span,
.eftmra-dashboard-donut-legend div {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: #315172;
  font-size: 0.78rem;
  font-weight: 500;
}
.eftmra-dashboard-chart-legend span:before,
.eftmra-dashboard-donut-legend div:before {
  content: "";
  width: 0.58rem;
  height: 0.58rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--legend-color);
}
.eftmra-dashboard__widgets {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  overflow: hidden;
  margin-top: 0;
  gap: 0;
}
.eftmra-dashboard-count {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: 0.95rem;
  min-height: 6.2rem;
  align-items: center;
  border-right: 1px solid #dce6f3;
  border-bottom: 1px solid #dce6f3;
  padding: 1rem 1.35rem;
  color: inherit;
  text-decoration: none;
}
.eftmra-dashboard-count:nth-child(6n) {
  border-right: 0;
}
.eftmra-dashboard-count:nth-last-child(-n + 6) {
  border-bottom: 0;
}
.eftmra-dashboard-count:hover,
.eftmra-dashboard-count:focus-visible {
  background: #f8fbff;
  text-decoration: none;
}
.eftmra-dashboard-count__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #dce6f3;
  border-radius: 0.78rem;
  background: #ffffff;
  color: var(--dash-blue);
}
.eftmra-dashboard-count__label {
  display: block;
  color: #24456e;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.25;
}
.eftmra-dashboard-count__value {
  display: block;
  margin-top: 0.22rem;
  color: #0b1020;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.1;
}
.eftmra-dashboard-graphs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.eftmra-dashboard-summary-chart {
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
.eftmra-dashboard-summary-chart__item {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.65rem;
  height: 100%;
  min-width: 0;
}
.eftmra-dashboard-summary-chart__bar-wrap {
  display: flex;
  align-items: end;
  justify-content: center;
  min-height: 13rem;
}
.eftmra-dashboard-summary-chart__bar {
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
.eftmra-dashboard-summary-chart__label {
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
.eftmra-dashboard-bar__meta span {
  display: block;
  color: var(--dash-muted);
  font-size: 0.86rem;
  font-weight: 750;
  line-height: 1.25;
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
.eftmra-dashboard-chart {
  display: grid;
  grid-template-columns: 2.15rem minmax(0, 1fr);
  gap: 0.55rem;
  min-height: 16.5rem;
  margin-top: 1rem;
}
.eftmra-dashboard-chart__axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.35rem 0 1.85rem;
  color: #24456e;
  font-size: 0.72rem;
  font-weight: 500;
  text-align: right;
}
.eftmra-dashboard-chart__plot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, minmax(1.8rem, 1fr));
  align-items: end;
  gap: 0.55rem;
  min-height: 15rem;
  padding-top: 0.35rem;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(25% - 1px),
    #dfe7f2 calc(25% - 1px),
    #dfe7f2 25%
  );
}
.eftmra-dashboard-chart__item {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.45rem;
  height: 100%;
  min-width: 0;
}
.eftmra-dashboard-chart__bar-wrap {
  display: flex;
  align-items: end;
  justify-content: center;
  min-height: 12.2rem;
}
.eftmra-dashboard-chart__bar {
  position: relative;
  display: block;
  width: min(2.35rem, 86%);
  min-height: 0.5rem;
  border-radius: 0.35rem;
  background: #dde6f2;
}
.eftmra-dashboard-chart__item.is-active .eftmra-dashboard-chart__bar {
  background-color: #2a6397;
  background-image: radial-gradient(#ffffff 0.055rem, transparent 0.06rem);
  background-size: 0.2rem 0.2rem;
}
.eftmra-dashboard-chart__item.is-active .eftmra-dashboard-chart__bar:before {
  content: attr(data-tooltip);
  position: absolute;
  right: 50%;
  bottom: calc(100% + 0.5rem);
  width: max-content;
  max-width: 9rem;
  transform: translateX(50%);
  border: 1px solid #dce6f3;
  border-radius: 0.42rem;
  background: #ffffff;
  color: #204261;
  padding: 0.48rem 0.62rem;
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1.35;
  white-space: pre;
  box-shadow: 0 0.35rem 1.1rem rgba(31, 57, 88, 0.12);
}
.eftmra-dashboard-chart__item.is-active .eftmra-dashboard-chart__bar:after {
  content: "";
  position: absolute;
  right: 50%;
  bottom: calc(100% + 0.2rem);
  width: 0.45rem;
  height: 0.45rem;
  transform: translateX(50%);
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #007f65;
}
.eftmra-dashboard-chart__label {
  overflow: hidden;
  color: #24456e;
  font-size: 0.76rem;
  font-weight: 500;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eftmra-dashboard-line-chart {
  display: grid;
  grid-template-columns: 2.15rem minmax(0, 1fr);
  gap: 0.55rem;
  min-height: 16.5rem;
  margin-top: 1rem;
}
.eftmra-dashboard-line-chart__axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.25rem 0 2rem;
  color: #24456e;
  font-size: 0.72rem;
  font-weight: 500;
  text-align: right;
}
.eftmra-dashboard-line-chart__plot {
  min-width: 0;
}
.eftmra-dashboard-line-chart__plot svg {
  display: block;
  width: 100%;
  min-height: 14rem;
  overflow: visible;
}
.eftmra-dashboard-line-chart__grid {
  stroke: #dfe7f2;
  stroke-dasharray: 4 4;
  stroke-width: 1;
}
.eftmra-dashboard-line-chart__months {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.35rem;
  color: #24456e;
  font-size: 0.72rem;
  font-weight: 500;
  text-align: center;
}
.eftmra-dashboard-donut-layout {
  display: grid;
  grid-template-columns: minmax(11rem, 0.7fr) minmax(0, 1fr);
  align-items: center;
  gap: 1.2rem;
  min-height: 17.4rem;
  margin-top: 0.9rem;
}
.eftmra-dashboard-donut {
  display: grid;
  width: min(15rem, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  border-radius: 999px;
  background:
    radial-gradient(circle, #ffffff 0 48%, transparent 49%),
    conic-gradient(var(--donut-gradient));
}
.eftmra-dashboard-donut strong,
.eftmra-dashboard-donut span {
  grid-area: 1 / 1;
}
.eftmra-dashboard-donut strong {
  color: #0b1020;
  font-size: 2rem;
  font-weight: 650;
  line-height: 1;
  transform: translateY(-0.35rem);
}
.eftmra-dashboard-donut span {
  color: #315172;
  font-size: 0.78rem;
  font-weight: 500;
  transform: translateY(1rem);
}
.eftmra-dashboard-donut-legend {
  display: grid;
  gap: 0.72rem;
}
.eftmra-dashboard-donut-legend div {
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 0.55rem;
}
.eftmra-dashboard-donut-legend span {
  min-width: 0;
}
.eftmra-dashboard-donut-legend strong {
  color: #0b1020;
  font-size: 0.9rem;
  font-weight: 600;
}
.eftmra-dashboard [data-tone="teal"] { --tone: #00a6a0; --tone-soft: #55d8d2; --tone-bg: #dcf8f6; --tone-shadow: rgba(0, 166, 160, 0.18); }
.eftmra-dashboard [data-tone="blue"] { --tone: #2f80ed; --tone-soft: #6fb0ff; --tone-bg: #e5f0ff; --tone-shadow: rgba(47, 128, 237, 0.18); }
.eftmra-dashboard [data-tone="amber"] { --tone: #f5a623; --tone-soft: #ffd16a; --tone-bg: #fff3d8; --tone-shadow: rgba(245, 166, 35, 0.2); }
.eftmra-dashboard [data-tone="purple"] { --tone: #7d56cc; --tone-soft: #aa8cec; --tone-bg: #f0eaff; --tone-shadow: rgba(125, 86, 204, 0.18); }
.eftmra-dashboard [data-tone="green"] { --tone: #1cab68; --tone-soft: #6dd99f; --tone-bg: #e4f8ed; --tone-shadow: rgba(28, 171, 104, 0.18); }
.eftmra-dashboard [data-tone="red"] { --tone: #ff5a70; --tone-soft: #ff91a0; --tone-bg: #ffe8ec; --tone-shadow: rgba(255, 90, 112, 0.18); }
@media (max-width: 1440px) {
  .eftmra-dashboard__widgets { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .eftmra-dashboard-count:nth-child(6n) { border-right: 1px solid #dce6f3; }
  .eftmra-dashboard-count:nth-child(3n) { border-right: 0; }
  .eftmra-dashboard-count:nth-last-child(-n + 6) { border-bottom: 1px solid #dce6f3; }
  .eftmra-dashboard-count:nth-last-child(-n + 3) { border-bottom: 0; }
}
@media (max-width: 1100px) {
  .eftmra-dashboard-graphs { grid-template-columns: 1fr; }
}
@media (max-width: 780px) {
  .eftmra-dashboard { padding: 1rem; }
  .eftmra-dashboard-panel__header { align-items: flex-start; flex-direction: column; }
  .eftmra-dashboard-filters { justify-content: flex-start; width: 100%; }
  .eftmra-dashboard-filter select { max-width: none; width: 100%; }
  .eftmra-dashboard__widgets { grid-template-columns: 1fr; }
  .eftmra-dashboard-count,
  .eftmra-dashboard-count:nth-child(3n),
  .eftmra-dashboard-count:nth-last-child(-n + 3) {
    border-right: 0;
    border-bottom: 1px solid #dce6f3;
  }
  .eftmra-dashboard-count:last-child { border-bottom: 0; }
  .eftmra-dashboard-summary-chart { grid-template-columns: repeat(6, minmax(2.9rem, 1fr)); gap: 0.45rem; }
  .eftmra-dashboard-summary-chart__bar { width: min(2.5rem, 82%); }
  .eftmra-dashboard-chart { grid-template-columns: 1.8rem minmax(0, 1fr); }
  .eftmra-dashboard-chart__plot { gap: 0.25rem; grid-template-columns: repeat(12, minmax(1.2rem, 1fr)); }
  .eftmra-dashboard-chart__bar { width: min(1.7rem, 86%); }
  .eftmra-dashboard-line-chart { grid-template-columns: 1.8rem minmax(0, 1fr); }
  .eftmra-dashboard-line-chart__months { font-size: 0.64rem; }
  .eftmra-dashboard-donut-layout { grid-template-columns: 1fr; }
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
    trainingRegistrations,
    practitioners,
    practitionerRegistrations,
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
          createdAt: true,
          endDate: true,
          id: true,
          levelKey: true,
          price: true,
          startDate: true,
        },
      }) as Promise<TrainingSummary>,
      req.payload.find({
        collection: "training-registrations",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          status: true,
          submittedAt: true,
          training: true,
        },
      }) as Promise<TrainingRegistrationSummary>,
      req.payload.find({
        collection: "practitioners",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          createdAt: true,
          showOnHomepage: true,
          status: true,
        },
      }) as Promise<PractitionerSummary>,
      req.payload.find({
        collection: "practitioner-registrations",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          status: true,
          submittedAt: true,
        },
      }) as Promise<PractitionerRegistrationSummary>,
      countCollection(req, "practitioners", { status: { equals: "published" } }),
      countCollection(req, "practitioners", { status: { equals: "draft" } }),
      countCollection(req, "practitioners", { showOnHomepage: { equals: true } }),
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
      docs: practitioners.docs,
      published: publishedPractitioners.totalDocs,
      registrations: practitionerRegistrations.docs,
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
      docs: trainings.docs,
      published: publishedTrainings.totalDocs,
      registrations: trainingRegistrations.docs,
      total: trainings.docs.length,
    },
  };
}

function CountWidget({ href, icon, label, value }: Metric) {
  return (
    <a className="eftmra-dashboard-count" href={href}>
      <span className="eftmra-dashboard-count__icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="eftmra-dashboard-count__label">{label}</span>
        <strong className="eftmra-dashboard-count__value">{value}</strong>
      </span>
    </a>
  );
}

function ContentBar({ label, value, total, tone }: GraphItem & { total: number }) {
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
    <div className="eftmra-dashboard-summary-chart" role="img" aria-label="Records by module chart">
      {items.map((item) => (
        <div className="eftmra-dashboard-summary-chart__item" data-tone={item.tone} key={item.label}>
          <div className="eftmra-dashboard-summary-chart__bar-wrap">
            <div
              className="eftmra-dashboard-summary-chart__bar"
              style={{ height: `${Math.max(8, getPercent(item.value, maxValue))}%` }}
            >
              {item.value}
            </div>
          </div>
          <span className="eftmra-dashboard-summary-chart__label">{item.label}</span>
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
  const contentItems: GraphItem[] = [
    { label: "Practitioners", value: stats.practitioners.total, tone: "teal" },
    { label: "Trainings", value: stats.trainings.total, tone: "blue" },
    { label: "Gallery", value: stats.gallery.total, tone: "amber" },
    { label: "Blogs", value: stats.posts.total, tone: "purple" },
    { label: "Testimonials", value: stats.testimonials.total, tone: "green" },
    { label: "Leads", value: stats.leads.total, tone: "red" },
  ];
  const modules: Metric[] = [
    {
      href: withCmsBasePath("/admin/collections/leads"),
      icon: <Mail size={22} />,
      label: "Leads",
      value: stats.leads.total,
    },
    {
      href: withCmsBasePath("/admin/collections/practitioners"),
      icon: <UserRoundCheck size={22} />,
      label: "Practitioners",
      value: stats.practitioners.total,
    },
    {
      href: withCmsBasePath("/admin/collections/trainings"),
      icon: <CalendarDays size={22} />,
      label: "Trainings & Events",
      value: stats.trainings.total,
    },
    {
      href: withCmsBasePath("/admin/collections/gallery"),
      icon: <ImageIcon size={22} />,
      label: "Gallery",
      value: stats.gallery.total,
    },
    {
      href: withCmsBasePath("/admin/collections/posts"),
      icon: <BookOpenText size={22} />,
      label: "Blogs",
      value: stats.posts.total,
    },
    {
      href: withCmsBasePath("/admin/collections/testimonials"),
      icon: <MessageSquareQuote size={22} />,
      label: "Testimonials",
      value: stats.testimonials.total,
    },
  ];

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
    <main className="eftmra-dashboard">

      <section className="eftmra-dashboard-counts" aria-label="Dashboard widgets">
        <div className="eftmra-dashboard__widgets">
          {modules.map((module) => (
            <CountWidget key={module.label} {...module} />
          ))}
        </div>
      </section>

      <section className="eftmra-dashboard-graphs" aria-label="Dashboard graphs">
        <div className="eftmra-dashboard-panel">
          <TrainingOverTimeWidget
            registrations={stats.trainings.registrations}
            trainings={stats.trainings.docs}
          />
        </div>

        <div className="eftmra-dashboard-panel">
          <TrainingTypeDistributionWidget trainings={stats.trainings.docs} />
        </div>

        <div className="eftmra-dashboard-panel">
          <PractitionerStatusOverviewWidget
            practitioners={stats.practitioners.docs}
            registrations={stats.practitioners.registrations}
          />
        </div>

        <div className="eftmra-dashboard-panel">
          <PractitionerGrowthWidget practitioners={stats.practitioners.docs} />
        </div>

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
