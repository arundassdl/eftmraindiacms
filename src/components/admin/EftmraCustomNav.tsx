"use client";

import React, { useMemo, useState } from "react";
import { useAuth, useNav } from "@payloadcms/ui";
import { LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { adminMenu } from "../../admin/menu";
import { withCmsBasePath } from "./adminBasePath";
import EftmraAdminNav from "./EftmraAdminNav";

type MenuLink = {
  href: string;
  label: string;
  slug: string;
};

type MenuGroup = {
  id: string;
  label: string;
  links: MenuLink[];
};

type AdminUser = {
  role?: string | null;
};

const baseClass = "nav";

function isRoleManager(user: AdminUser | null | undefined) {
  return user?.role === "admin" || user?.role === "superadmin";
}

function collectionLink(slug: string, label: string): MenuLink {
  return {
    href: withCmsBasePath(`/admin/collections/${slug}`),
    label,
    slug,
  };
}

function globalLink(slug: string, label: string): MenuLink {
  return {
    href: withCmsBasePath(`/admin/globals/${slug}`),
    label,
    slug,
  };
}

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, "");
}

function isActivePath(pathname: string, href: string) {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function getMenuGroups(canManagePayloadSettings: boolean): MenuGroup[] {
  const groups = [
    adminMenu.content,
    adminMenu.resources,
    adminMenu.trainings,
    adminMenu.practitioners,
    adminMenu.crm,
  ].map((group) => ({
    id: group.label,
    label: group.label,
    links: group.items.map((item) => collectionLink(item.slug, item.label)),
  }));

  if (canManagePayloadSettings) {
    groups.push({
      id: adminMenu.system.label,
      label: adminMenu.system.label,
      links: adminMenu.system.items.map((item) => collectionLink(item.slug, item.label)),
    });
  }

  return [
    ...groups,
    ...(canManagePayloadSettings
      ? [
          {
            id: adminMenu.settings.label,
            label: adminMenu.settings.label,
            links: adminMenu.settings.globals.map((item) => globalLink(item.slug, item.label)),
          },
        ]
      : []),
  ];
}

function CustomNavLink({ href, label, pathname }: MenuLink & { pathname: string }) {
  const active = isActivePath(pathname, href);
  const labelNode = (
    <>
      {active ? <div className={`${baseClass}__link-indicator`} /> : null}
      <span className={`${baseClass}__link-label`}>{label}</span>
    </>
  );

  if (active) {
    return (
      <div aria-current="page" className={`${baseClass}__link active`} id={`nav-${label}`}>
        {labelNode}
      </div>
    );
  }

  return (
    <a className={`${baseClass}__link`} href={href} id={`nav-${label}`}>
      {labelNode}
    </a>
  );
}

function CustomNavGroup({ group, pathname }: { group: MenuGroup; pathname: string }) {
  const hasActiveChild = group.links.some((link) => isActivePath(pathname, link.href));
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={["nav-group", !isOpen ? "nav-group--collapsed" : undefined]
        .filter(Boolean)
        .join(" ")}
      id={`nav-group-${group.id}`}
    >
      <button
        aria-expanded={isOpen}
        className="nav-group__toggle"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="nav-group__label">{group.label}</span>
        <span className="nav-group__indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path className="stroke" d="m6 9 6 6 6-6" fill="none" strokeWidth="2" />
          </svg>
        </span>
      </button>
      <div
        className="rah-static rah-static--height-auto"
        style={{ display: isOpen || hasActiveChild ? "block" : "none" }}
      >
        <div className="collapsible__content">
          {group.links.map((link) => (
            <CustomNavLink key={link.slug} {...link} pathname={pathname} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EftmraCustomNav() {
  const pathname = usePathname();
  const { user } = useAuth<AdminUser>();
  const { hydrated, navOpen, navRef, shouldAnimate } = useNav();
  const canManagePayloadSettings = isRoleManager(user);
  const groups = useMemo(() => getMenuGroups(canManagePayloadSettings), [canManagePayloadSettings]);
  const dashboardHref = withCmsBasePath(adminMenu.dashboard.href);
  const isDashboardActive = isActivePath(pathname, dashboardHref);
  const navClasses = [
    baseClass,
    navOpen ? `${baseClass}--nav-open` : undefined,
    shouldAnimate ? `${baseClass}--nav-animate` : undefined,
    hydrated ? `${baseClass}--nav-hydrated` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={navClasses} inert={!navOpen ? true : undefined}>
      <div className={`${baseClass}__scroll`} ref={navRef}>
        <EftmraAdminNav />
        <nav className={`${baseClass}__wrap`} aria-label="Admin navigation">
          {isDashboardActive ? (
            <div
              aria-current="page"
              className="eftmra-admin-dashboard-link nav__link active"
              id="nav-dashboard"
            >
              <span className="nav__link-label">{adminMenu.dashboard.label}</span>
            </div>
          ) : (
            <a
              className="eftmra-admin-dashboard-link nav__link"
              href={dashboardHref}
              id="nav-dashboard"
            >
              <span className="nav__link-label">{adminMenu.dashboard.label}</span>
            </a>
          )}

          {groups.map((group) => (
            <CustomNavGroup key={group.id} group={group} pathname={pathname} />
          ))}

          <div className={`${baseClass}__controls`}>
            <a className="btn btn--style-pill" href={withCmsBasePath("/admin/account")}>
              <Settings aria-hidden="true" size={16} />
              <span className="nav__link-label">Account</span>
            </a>
            <a className="btn btn--style-pill" href={withCmsBasePath("/admin/logout")}>
              <LogOut aria-hidden="true" size={16} />
              <span className="nav__link-label">Logout</span>
            </a>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default EftmraCustomNav;
