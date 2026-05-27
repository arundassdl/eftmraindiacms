"use client";

import React, { useMemo, useState } from "react";

export type TrainingChartDoc = {
  createdAt?: string | null;
  endDate?: string | null;
  id?: number | string;
  levelKey?: string | null;
  price?: string | null;
  startDate?: string | null;
};

export type TrainingRegistrationChartDoc = {
  status?: string | null;
  submittedAt?: string | null;
  training?: number | string | { id?: number | string } | null;
};

type MonthlySeries = {
  color: string;
  label: string;
  values: number[];
};

type DistributionItem = {
  color: string;
  key: string;
  label: string;
  value: number;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const trainingTypeLabels: Record<string, string> = {
  intro: "Introductory",
  l12: "Level 1 & 2",
  l3: "Level 3",
  matrix: "Matrix Reimprinting",
  other: "Other",
};

const distributionColors = ["#2a6397", "#00a6a0", "#f5a623", "#7d56cc", "#6b7f90"];

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

function getTrainingId(value: TrainingRegistrationChartDoc["training"]) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && value.id !== undefined) return String(value.id);
  return "";
}

function parsePrice(value?: string | null) {
  if (!value) return 0;

  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function formatCompactCurrency(value: number) {
  if (!value) return "0";

  return new Intl.NumberFormat("en-IN", {
    compactDisplay: "short",
    currency: "INR",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
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
    <div className="eftmra-dashboard-line-chart" role="img" aria-label="Training trends by month">
      <div className="eftmra-dashboard-line-chart__axis" aria-hidden="true">
        {axis.map((value, index) => (
          <span key={`${value}-${index}`}>{value}</span>
        ))}
      </div>
      <div className="eftmra-dashboard-line-chart__plot">
        <svg viewBox="0 0 620 220" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {series.map((item) => {
              const gradientId = `training-area-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

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
            const gradientId = `training-area-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
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

export function TrainingOverTimeWidget({
  registrations,
  trainings,
}: {
  registrations: TrainingRegistrationChartDoc[];
  trainings: TrainingChartDoc[];
}) {
  const currentYear = String(new Date().getFullYear());
  const years = useMemo(() => {
    const values = new Set<string>([currentYear]);

    trainings.forEach((training) => {
      const year = getYear(training.createdAt || training.startDate);
      if (year) values.add(year);
    });

    registrations.forEach((registration) => {
      const year = getYear(registration.submittedAt);
      if (year) values.add(year);
    });

    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [currentYear, registrations, trainings]);

  const [yearFilter, setYearFilter] = useState(currentYear);

  const trainingPriceById = useMemo(() => {
    return new Map(trainings.map((training) => [String(training.id), parsePrice(training.price)]));
  }, [trainings]);

  const created = useMemo(
    () => countByMonth(trainings, yearFilter, (training) => training.createdAt || training.startDate),
    [trainings, yearFilter]
  );
  const enrollments = useMemo(
    () => countByMonth(registrations, yearFilter, (registration) => registration.submittedAt),
    [registrations, yearFilter]
  );
  const completions = useMemo(
    () =>
      countByMonth(
        registrations.filter((registration) => registration.status === "closed"),
        yearFilter,
        (registration) => registration.submittedAt
      ),
    [registrations, yearFilter]
  );
  const revenue = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0);

    registrations.forEach((registration) => {
      const month = getMonthIndex(registration.submittedAt);
      const year = getYear(registration.submittedAt);
      if (month === null) return;
      if (yearFilter !== "all" && year !== yearFilter) return;
      if (registration.status !== "confirmed" && registration.status !== "closed") return;

      totals[month] += trainingPriceById.get(getTrainingId(registration.training)) || 0;
    });

    return totals;
  }, [registrations, trainingPriceById, yearFilter]);

  const series = [
    { color: "#2a6397", label: "Trainings", values: created },
    { color: "#00a6a0", label: "Enrollments", values: enrollments },
    { color: "#f5a623", label: "Completions", values: completions },
  ];
  const totalRevenue = revenue.reduce((sum, value) => sum + value, 0);

  return (
    <>
      <div className="eftmra-dashboard-panel__header">
        <h2 className="eftmra-dashboard-panel__title">Trainings Over Time</h2>
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
        <span style={{ "--legend-color": "#7d56cc" } as React.CSSProperties}>
          Revenue {formatCompactCurrency(totalRevenue)}
        </span>
      </div>
    </>
  );
}

export function TrainingTypeDistributionWidget({ trainings }: { trainings: TrainingChartDoc[] }) {
  const distribution = useMemo<DistributionItem[]>(() => {
    const counts = new Map<string, number>();

    trainings.forEach((training) => {
      const key = training.levelKey || "other";
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return ["l3", "l12", "matrix", "intro", "other"].map((key, index) => ({
      color: distributionColors[index],
      key,
      label: trainingTypeLabels[key] || "Other",
      value: counts.get(key) || 0,
    }));
  }, [trainings]);

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
        <h2 className="eftmra-dashboard-panel__title">Training Type Distribution</h2>
      </div>
      <div className="eftmra-dashboard-donut-layout">
        <div
          className="eftmra-dashboard-donut"
          style={{
            "--donut-gradient": gradientStops || "#edf0f6 0 100%",
          } as React.CSSProperties}
          role="img"
          aria-label="Training type distribution"
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

export function TrainingEventsChart({ trainings }: { trainings: TrainingChartDoc[] }) {
  return <TrainingTypeDistributionWidget trainings={trainings} />;
}
