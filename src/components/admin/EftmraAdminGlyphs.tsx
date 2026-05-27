import React from "react";

type IconProps = {
  className?: string;
  fill?: string;
};

export function EftmraMark({ className, fill }: IconProps) {
  const gradientId = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6F7FA" />
          <stop offset="0.55" stopColor="#A8E0E7" />
          <stop offset="1" stopColor="#F4D27C" />
        </linearGradient>
      </defs>
      <path
        d="M32 9c2.4 0 4.5 1.5 5.3 3.8l1.4 3.8 4.1.2c2.5.1 4.6 1.8 5.3 4.2.7 2.4-.1 5-2 6.6l-3.1 2.8 1 4c.6 2.5-.3 5.1-2.4 6.5-2 1.4-4.8 1.5-6.9.1L32 39.2 28.3 41c-2.1 1.1-4.8 1.1-6.9-.3-2.1-1.4-3-4-2.4-6.5l1-4-3.1-2.8c-1.9-1.7-2.7-4.3-2-6.6.7-2.4 2.8-4.1 5.3-4.2l4.1-.2 1.4-3.8A5.67 5.67 0 0 1 32 9Z"
        fill={fill || `url(#${gradientId})`}
        fillOpacity="0.96"
      />
      <path
        d="M32 15.5c1.5 4.8 4.4 8.2 8.7 10.1-3.8 2.3-6.7 5.6-8.7 10.1-1.9-4.5-4.8-7.8-8.7-10.1 4.3-1.9 7.2-5.3 8.7-10.1Z"
        stroke="#173F50"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="25.5" r="2.8" fill="#173F50" />
      <path
        d="M20 47.5c3.3-3 7.3-4.5 12-4.5s8.7 1.5 12 4.5"
        stroke="#173F50"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
    </svg>
  );
}

export function HomeGlyph({ className, fill }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10.8 12 4l8 6.8v7.7c0 1.1-.9 2-2 2h-3.2v-5.6H9.2v5.6H6c-1.1 0-2-.9-2-2v-7.7Z"
        fill={fill || "currentColor"}
      />
      <path
        d="M2.8 11.2 12 3.4l9.2 7.8"
        stroke={fill || "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkGlyph({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 2.2 11.5 6l3.8 1.5-3.8 1.5L10 12.8 8.5 9 4.7 7.5 8.5 6 10 2.2Z"
        fill="currentColor"
      />
      <path
        d="M15.2 11.8 15.9 13.7l1.9.7-1.9.8-.7 1.9-.8-1.9-1.9-.8 1.9-.7.8-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TileGlyph({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.95" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.55" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.55" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.95" />
    </svg>
  );
}

export function PeopleGlyph({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="13.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.8" opacity="0.7" />
      <path d="M3.5 15c.8-2.1 2.7-3.2 5.5-3.2 2.7 0 4.6 1.1 5.5 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.8 14.7c.5-1.3 1.6-2 3.2-2 1.3 0 2.3.5 3 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function ChatGlyph({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 4h9c1.4 0 2.5 1.1 2.5 2.5v5A2.5 2.5 0 0 1 14.5 14H10l-3.7 2.5c-.5.3-1.1-.1-1.1-.7V14h-.7A2.5 2.5 0 0 1 2 11.5v-5C2 5.1 3.1 4 4.5 4h1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M6.5 8.4h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 11h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
