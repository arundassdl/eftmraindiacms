"use client";

import React, { useMemo, useState } from "react";

export type PractitionerChartDoc = {
  createdAt?: string | null;
  showOnHomepage?: boolean | null;
  status?: string | null;
};

export type PractitionerRegistrationChartDoc = {
  status?: string | null;
  submittedAt?: string | null;
};

type DistributionItem = {
  color: string;
  key: string;
  label: string;
  value: number;
};

type MonthlySeries = {
  color: string;
  label: string;
  values: number[];
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getYear(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return String(date.getFullYear());
}

function getMonthIndex(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.getMonth();
}

function countByMonth<T>(docs: T[], selectedYear: string, getDate: (doc: T) => string | null | undefined) {
  const counts = Array.from({ length: 12 }, () => 0);

  docs.forEach((doc) => {
    const dateValue = getDate(doc);
    const year = getYear(dateValue);
    const month = getMonthIndex(dateValue);

    if (month === null) return;
    if (selectedYear !== "all" && year !== selectedYear) return;

    counts[month] += 1;
  });

  return counts;
}

function getChartPoints(values: number[], maxValue: number, width = 620, height = 220, padding = 18) {
  return values.map((value, index) => {
    const x = padding + (index / Math.max(1, values.length - 1)) * (width - padding * 2);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return { x, y };
  });
}

function LineAreaChart({ series }: { series: MonthlySeries[] }) {
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));
  const axis = [maxValue, Math.ceil(maxValue * 0.75), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.25)];

  return (
    <div className="eftmra-dashboard-line-chart" role="img" aria-label="Practitioner growth by month">
      <div className="eftmra-dashboard-line-chart__axis" aria-hidden="true">
        {axis.map((value, index) => (
          <span key={`${value}-${index}`}>{value}</span>
        ))}
      </div>
      <div className="eftmra-dashboard-line-chart__plot">
        <svg viewBox="0 0 620 220" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {series.map((item) => {
              const gradientId = `practitioner-area-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

              return (
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1" key={item.label}>
                  <stop offset="0%" stopColor={item.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0.02" />
                </linearGradient>
              );
            })}
          </defs>
          {[0.25, 0.5, 0.75, 1].map((position) => (
            <line
              key={position}
              x1="18"
              x2="602"
              y1={18 + (220 - 36) * position}
              y2={18 + (220 - 36) * position}
              className="eftmra-dashboard-line-chart__grid"
            />
          ))}
          {series.map((item) => {
            const gradientId = `practitioner-area-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            const points = getChartPoints(item.values, maxValue);
            const line = points.map((point) => `${point.x},${point.y}`).join(" ");
            const area = `18,202 ${line} 602,202`;

            return (
              <g key={item.label}>
                <polygon points={area} fill={`url(#${gradientId})`} />
                <polyline points={line} fill="none" stroke={item.color} strokeLinecap="round" strokeWidth="3" />
                {points.map((point, index) => (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill="#ffffff"
                    key={`${item.label}-${monthLabels[index]}`}
                    r="3.8"
                    stroke={item.color}
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}
        </svg>
        <div className="eftmra-dashboard-line-chart__months" aria-hidden="true">
          {monthLabels.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PractitionerStatusOverviewWidget({
  practitioners,
  registrations,
}: {
  practitioners: PractitionerChartDoc[];
  registrations: PractitionerRegistrationChartDoc[];
}) {
  const pendingApproval = registrations.filter(
    (registration) => registration.status === "new" || registration.status === "in-review"
  ).length;
  const distribution: DistributionItem[] = [
    {
      color: "#00a6a0",
      key: "active",
      label: "Active",
      value: practitioners.filter((practitioner) => practitioner.status === "published").length,
    },
    {
      color: "#f5a623",
      key: "pending",
      label: "Pending Approval",
      value: pendingApproval,
    },
    {
      color: "#ff5a70",
      key: "suspended",
      label: "Suspended",
      value: 0,
    },
    {
      color: "#6b7f90",
      key: "inactive",
      label: "Inactive",
      value: practitioners.filter((practitioner) => practitioner.status === "draft").length,
    },
  ];
  const total = distribution.reduce((sum, item) => sum + item.value, 0);
  let progress = 0;
  const gradientStops = distribution
    .map((item) => {
      const start = progress;
      const size = total ? (item.value / total) * 100 : 0;
      progress += size;
      return `${item.color} ${start}% ${progress}%`;
    })
    .join(", ");

  return (
    <>
      <div className="eftmra-dashboard-panel__header">
        <h2 className="eftmra-dashboard-panel__title">Practitioner Status Overview</h2>
      </div>
      <div className="eftmra-dashboard-donut-layout">
        <div
          className="eftmra-dashboard-donut"
          style={{
            "--donut-gradient": gradientStops || "#edf0f6 0 100%",
          } as React.CSSProperties}
          role="img"
          aria-label="Practitioner status overview"
        >
          <strong>{total}</strong>
          <span>Total</span>
        </div>
        <div className="eftmra-dashboard-donut-legend">
          {distribution.map((item) => (
            <div key={item.key} style={{ "--legend-color": item.color } as React.CSSProperties}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PractitionerGrowthWidget({ practitioners }: { practitioners: PractitionerChartDoc[] }) {
  const currentYear = String(new Date().getFullYear());
  const years = useMemo(() => {
    const values = new Set<string>([currentYear]);

    practitioners.forEach((practitioner) => {
      const year = getYear(practitioner.createdAt);
      if (year) values.add(year);
    });

    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [currentYear, practitioners]);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const added = useMemo(
    () => countByMonth(practitioners, yearFilter, (practitioner) => practitioner.createdAt),
    [practitioners, yearFilter]
  );
  const verified = useMemo(
    () =>
      countByMonth(
        practitioners.filter((practitioner) => practitioner.status === "published"),
        yearFilter,
        (practitioner) => practitioner.createdAt
      ),
    [practitioners, yearFilter]
  );
  const active = useMemo(
    () =>
      countByMonth(
        practitioners.filter((practitioner) => practitioner.showOnHomepage),
        yearFilter,
        (practitioner) => practitioner.createdAt
      ),
    [practitioners, yearFilter]
  );
  const series = [
    { color: "#2a6397", label: "New practitioners", values: added },
    { color: "#00a6a0", label: "Verified", values: verified },
    { color: "#f5a623", label: "Active", values: active },
  ];

  return (
    <>
      <div className="eftmra-dashboard-panel__header">
        <h2 className="eftmra-dashboard-panel__title">Practitioner Growth</h2>
        <label className="eftmra-dashboard-filter">
          <span>Year</span>
          <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <LineAreaChart series={series} />
      <div className="eftmra-dashboard-chart-legend">
        {series.map((item) => (
          <span key={item.label} style={{ "--legend-color": item.color } as React.CSSProperties}>
            {item.label}
          </span>
        ))}
      </div>
    </>
  );
}
