"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { withCmsBasePath } from "./adminBasePath";

export function EftmraAdminDashboardLink() {
  const pathname = usePathname();
  const isActive = pathname === "/admin" || pathname.endsWith("/admin");

  return (
    <a
      className={["eftmra-admin-dashboard-link", "nav__link", isActive ? "active" : undefined]
        .filter(Boolean)
        .join(" ")}
      href={withCmsBasePath("/admin")}
    >
      <span className="nav__link-label">Dashboard</span>
    </a>
  );
}

export default EftmraAdminDashboardLink;
