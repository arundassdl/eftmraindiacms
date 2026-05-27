"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useField } from "@payloadcms/ui";

type CrudOperation = "create" | "read" | "update" | "delete";
type Role = string;

type ModuleOption = {
  label: string;
  value: string;
};

type RoleDefaults = Record<Role, Record<string, Record<CrudOperation, boolean>>>;
type PermissionRow = {
  id?: string | null;
  module?: string | null;
  role?: string | null;
} & Partial<Record<CrudOperation, boolean | null>>;

type RoleConfig = {
  active?: boolean | null;
  label?: string | null;
  value?: string | null;
};

type Props = {
  field?: {
    admin?: {
      custom?: {
        defaultPermissions?: RoleDefaults;
        modules?: ModuleOption[];
      };
    };
  };
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  manager: "Manager",
  siteadmin: "Site Admin",
  superadmin: "Super Admin",
};

const operations: { label: string; shortLabel: string; value: CrudOperation }[] = [
  { label: "Create", shortLabel: "C", value: "create" },
  { label: "Read", shortLabel: "R", value: "read" },
  { label: "Update", shortLabel: "U", value: "update" },
  { label: "Delete", shortLabel: "D", value: "delete" },
];

function PermissionToggle({
  label,
  path,
  disabled = false,
  shortLabel,
}: {
  disabled?: boolean;
  label: string;
  path: string;
  shortLabel: string;
}) {
  const { value, setValue } = useField<boolean>({ path });

  useEffect(() => {
    if (disabled && value) {
      setValue(false);
    }
  }, [disabled, setValue, value]);

  return (
    <label className="eftmra-role-permissions-custom__toggle">
      <span className="eftmra-role-permissions-custom__toggle-text">
        <span className="eftmra-role-permissions-custom__toggle-short">{shortLabel}</span>
        {label}
      </span>
      <input
        type="checkbox"
        checked={disabled ? false : Boolean(value)}
        disabled={disabled}
        onChange={(event) => setValue(event.target.checked)}
      />
      <span className="eftmra-role-permissions-custom__switch" aria-hidden="true" />
    </label>
  );
}

function isPermissionLocked(role: Role, moduleValue: string) {
  return role === "siteadmin" && moduleValue === "users";
}

function getModuleSectionId(moduleValue: string) {
  return `rbac-module-${moduleValue}`;
}

function defaultPermissionValue(
  defaults: RoleDefaults | undefined,
  role: Role,
  moduleValue: string,
  operation: CrudOperation,
) {
  return Boolean(defaults?.[role]?.[moduleValue]?.[operation]);
}

export default function RolePermissionsMatrix({ field }: Props) {
  const modules = field?.admin?.custom?.modules ?? [];
  const defaults = field?.admin?.custom?.defaultPermissions;
  const defaultRoleOptions = useMemo(
    () =>
      Object.keys(defaults ?? {}).map((role) => ({
        active: true,
        label: roleLabels[role] ?? role,
        value: role,
      })),
    [defaults],
  );
  const { value: rolePermissionsValue, setValue: setRolePermissionsValue } = useField<PermissionRow[]>({
    path: "rolePermissions",
  });
  const [managedRoles, setManagedRoles] = useState<RoleConfig[]>([]);
  const roleOptions = useMemo(() => {
    const sourceRoles = managedRoles.length ? managedRoles : defaultRoleOptions;

    return sourceRoles
      .filter((role) => role.active !== false && role.value)
      .map((role) => ({
        label: role.label?.trim() || roleLabels[role.value ?? ""] || role.value || "",
        value: role.value ?? "",
      }));
  }, [defaultRoleOptions, managedRoles]);
  const rolePermissionRows = useMemo(
    () => (Array.isArray(rolePermissionsValue) ? rolePermissionsValue : []),
    [rolePermissionsValue],
  );
  const permissionIndexByKey = useMemo(() => {
    const indexByKey = new Map<string, number>();
    rolePermissionRows.forEach((row, index) => {
      if (row.role && row.module) {
        indexByKey.set(`${row.role}:${row.module}`, index);
      }
    });
    return indexByKey;
  }, [rolePermissionRows]);
  const [activeModule, setActiveModule] = useState(modules[0]?.value ?? "");
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const visibleRoleOptions = roleOptions;

  useEffect(() => {
    const controller = new AbortController();

    async function loadManagedRoles() {
      const response = await fetch("/api/role-management?depth=0&limit=100&sort=sortOrder", {
        credentials: "include",
        signal: controller.signal,
      });

      if (!response.ok) return;

      const data = (await response.json()) as { docs?: RoleConfig[] };
      setManagedRoles(Array.isArray(data.docs) ? data.docs : []);
    }

    loadManagedRoles().catch((error) => {
      if ((error as Error).name !== "AbortError") {
        setManagedRoles([]);
      }
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!roleOptions.length || !modules.length) return;

    let didChange = false;
    const nextRows = [...rolePermissionRows];
    const existingRows = new Set(nextRows.filter((row) => row.role && row.module).map((row) => `${row.role}:${row.module}`));

    roleOptions.forEach((role) => {
      modules.forEach((module) => {
        const key = `${role.value}:${module.value}`;
        if (existingRows.has(key)) return;

        didChange = true;
        nextRows.push({
          role: role.value,
          module: module.value,
          create: defaultPermissionValue(defaults, role.value, module.value, "create"),
          read: defaultPermissionValue(defaults, role.value, module.value, "read"),
          update: defaultPermissionValue(defaults, role.value, module.value, "update"),
          delete: defaultPermissionValue(defaults, role.value, module.value, "delete"),
        });
      });
    });

    if (didChange) {
      setRolePermissionsValue(nextRows);
    }
  }, [defaults, modules, roleOptions, rolePermissionRows, setRolePermissionsValue]);

  useEffect(() => {
    if (!activeModule && modules[0]?.value) {
      setActiveModule(modules[0].value);
    }
  }, [activeModule, modules]);

  function scrollToModule(moduleValue: string) {
    setActiveModule(moduleValue);

    const tableScroll = tableScrollRef.current;
    const row = tableScroll?.querySelector<HTMLElement>(`#${getModuleSectionId(moduleValue)}`);
    if (tableScroll && row) {
      tableScroll.scrollTo({ behavior: "smooth", top: Math.max(row.offsetTop - 55, 0) });
      window.history.replaceState(null, "", `#${getModuleSectionId(moduleValue)}`);
    }
  }

  function updateActiveModuleFromScroll() {
    const tableScroll = tableScrollRef.current;
    if (!tableScroll) return;

    const rows = Array.from(tableScroll.querySelectorAll<HTMLElement>("[data-module-value]"));
    const currentRow = rows.reduce<HTMLElement | null>((current, row) => {
      if (row.offsetTop <= tableScroll.scrollTop + 64) {
        return row;
      }

      return current;
    }, rows[0] ?? null);

    const moduleValue = currentRow?.dataset.moduleValue;
    if (moduleValue && moduleValue !== activeModule) {
      setActiveModule(moduleValue);
    }
  }

  function getPermissionPath(role: Role, moduleValue: string, operation: CrudOperation) {
    const index = permissionIndexByKey.get(`${role}:${moduleValue}`);
    return index === undefined ? "" : `rolePermissions.${index}.${operation}`;
  }

  return (
    <div className="eftmra-role-permissions-custom">
      <style jsx>{`
  .eftmra-role-permissions-custom__panel {
    min-height: 0;
    overflow: hidden;
  }

  // .eftmra-role-permissions-custom__table-scroll {
  //   height: 700px;
  //   max-height: 700px;
  //   overflow-y: auto;
  //   overflow-x: auto;
  //   position: relative;
  // }


  .eftmra-role-permissions-custom__table {
    width: max(100%, calc(var(--visible-role-count, 4) * var(--permissions-role-column-width, 300px)));
    min-width: max(980px, calc(var(--visible-role-count, 4) * var(--permissions-role-column-width, 300px)));
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
  }

  .eftmra-role-permissions-custom__table thead th {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    box-shadow: 0 1px 0 #e5e7eb;
  }

  .eftmra-role-permissions-custom__module-heading {
    position: sticky;
    left: 0;
    z-index: 101;
    background: #fff;
  }
.eftmra-role-permissions-custom__panel-header strong {
  display: block;
  margin-top: 0.2rem;
  color: #312d4b;
  font-size: 1rem;
  letter-spacing: 0;
  text-transform: none;
}

.eftmra-role-permissions-custom__role-count {
  display: inline-flex;
  min-height: 2.1rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  background: #eef4f8;
  color: #3b76a4;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}
.eftmra-role-permissions-custom__role-menu {
  position: relative;
}

.eftmra-role-permissions-custom__role-menu summary {
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  border: 1px solid #d6d8e1;
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  background: #ffffff;
  color: #312d4b;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
  list-style: none;
}

.eftmra-role-permissions-custom__role-menu summary::-webkit-details-marker {
  display: none;
}

.eftmra-role-permissions-custom__role-menu-panel {
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  z-index: 5;
  display: grid;
  width: 220px;
  gap: 0.55rem;
  border: 1px solid #e2e3e8;
  border-radius: 10px;
  padding: 0.75rem;
  background: #ffffff;
  box-shadow: 0 14px 35px rgba(47, 43, 61, 0.16);
}

.eftmra-role-permissions-custom__role-menu-panel label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #312d4b;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}


table.eftmra-role-permissions-custom__table thead {
    height: 55px;
}

.eftmra-role-permissions-custom__table th,
.eftmra-role-permissions-custom__table td {
  vertical-align: top;
  border-right: 1px solid #ececf1;
  border-bottom: 1px solid #ececf1;
  padding: 1rem;
  background: #ffffff;
}


.eftmra-role-permissions-custom__table th:last-child,
.eftmra-role-permissions-custom__table td:last-child {
  border-right: 0;
}

.eftmra-role-permissions-custom__table thead th {
  z-index: 3;
  background: #fbfbfc;
  box-shadow: 0 1px 0 #e2e3e8;
}
 
.eftmra-role-permissions-custom__module-heading,
.eftmra-role-permissions-custom__module-cell {
  position: sticky;
  left: 0;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
}

.eftmra-role-permissions-custom__module-heading {
  z-index: 4 !important;
}

.eftmra-role-permissions-custom__module-cell {
  z-index: 2;
  background: #f0f7fb;
  color: #312d4b;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.eftmra-role-permissions-custom__module-label {
  position: sticky;
  left: 1rem;
  z-index: 3;
  display: inline-flex;
  max-width: calc(100vw - 4rem);
  align-items: center;
  background: inherit;
}

.eftmra-role-permissions-custom__table tbody tr:hover th,
.eftmra-role-permissions-custom__table tbody tr:hover td {
  background: #fbfdff;
}

.eftmra-role-permissions-custom__role-title {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 1rem;
  background: #3b76a4;
  color: #ffffff;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 8px 18px rgba(26, 115, 232, 0.16);
}


.eftmra-role-permissions-custom__toggles {
  display: grid;
  gap: 0.85rem;
}

.eftmra-role-permissions-custom__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #ececf1;
  border-radius: 9px;
  padding: 0.8rem 0.85rem;
  color: #312d4b;
  cursor: pointer;
}

.eftmra-role-permissions-custom__toggle-text {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  font-weight: 600;
}


.eftmra-role-permissions-custom__toggle-short {
  display: inline-flex;
  width: 1.45rem;
  height: 1.45rem;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f1f4f8;
  color: #5f5b70;
  font-size: 0.72rem;
  font-weight: 800;
}

.eftmra-role-permissions-custom__toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.eftmra-role-permissions-custom__switch {
  position: relative;
  width: 2.35rem;
  height: 1.3rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #cfd3dc;
  transition: background 160ms ease;
}

.eftmra-role-permissions-custom__switch:before {
  content: "";
  position: absolute;
  top: 0.18rem;
  left: 0.2rem;
  width: 0.94rem;
  height: 0.94rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(47, 43, 61, 0.22);
  transition: transform 160ms ease;
}

.eftmra-role-permissions-custom__toggle input:checked + .eftmra-role-permissions-custom__switch {
  background: #3b76a4;
}

.eftmra-role-permissions-custom__toggle input:checked + .eftmra-role-permissions-custom__switch:before {
  transform: translateX(1.02rem);
}

.eftmra-role-permissions-custom {
  --permissions-matrix-height: clamp(520px, 72vh, 760px);
  --permissions-role-column-width: 200px;
  display: grid;
  grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
  align-items: stretch;
  gap: 0;
  min-height: var(--permissions-matrix-height);
  overflow: visible;
  border: 1px solid #dcdde3;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(47, 43, 61, 0.06);
}

.eftmra-role-permissions-custom__nav {
  position: sticky;
  top: 1rem;
  align-self: start;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: var(--permissions-matrix-height);
  max-height: calc(100vh - 2rem);
  min-height: 0;
  overflow: visible;
  border-right: 1px solid #e5e5ea;
  border-radius: 12px 0 0 12px;
  background: #fbfbfc;
}

.eftmra-role-permissions-custom__nav-title {
  min-height: 4.25rem;
  border-bottom: 1px solid #e2e3e8;
  padding: 1.45rem 1.25rem 1rem;
  color: #3b374c;
  font-size: 1rem;
  font-weight: 700;
}

.eftmra-role-permissions-custom__module-list {
  position: sticky;
  top: calc(1rem + 4.25rem);
  align-self: start;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.55rem;
}

.eftmra-role-permissions-custom__module {
  display: flex;
  width: 100%;
  align-items: center;
  border: 0;
  border-radius: 8px;
  padding: 0.72rem 0.85rem;
  background: transparent;
  color: #5f5b70;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.25;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.eftmra-role-permissions-custom__module:hover {
  background: #f0f4ff;
  color: #1f2a44;
}

.eftmra-role-permissions-custom__module.is-active {
  background: #3b76a4;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(26, 115, 232, 0.18);
}

.eftmra-role-permissions-custom__panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  height: var(--permissions-matrix-height);
  max-height: calc(100vh - 2rem);
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
}

.eftmra-role-permissions-custom__panel-header {
  display: flex;
  min-height: 4.25rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #e2e3e8;
  padding: 1rem 1.35rem;
  color: #7a7688;
  font-size: 0.83rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eftmra-role-permissions-custom__panel-header strong {
  display: block;
  margin-top: 0.2rem;
  color: #312d4b;
  font-size: 1rem;
  letter-spacing: 0;
  text-transform: none;
}

.eftmra-role-permissions-custom__role-count {
  display: inline-flex;
  min-height: 2.1rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  background: #eef4f8;
  color: #3b76a4;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.eftmra-role-permissions-custom__role-menu {
  position: relative;
}

.eftmra-role-permissions-custom__role-menu summary {
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  border: 1px solid #d6d8e1;
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  background: #ffffff;
  color: #312d4b;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
  list-style: none;
}

.eftmra-role-permissions-custom__role-menu summary::-webkit-details-marker {
  display: none;
}

.eftmra-role-permissions-custom__role-menu-panel {
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  z-index: 5;
  display: grid;
  width: 220px;
  gap: 0.55rem;
  border: 1px solid #e2e3e8;
  border-radius: 10px;
  padding: 0.75rem;
  background: #ffffff;
  box-shadow: 0 14px 35px rgba(47, 43, 61, 0.16);
}

.eftmra-role-permissions-custom__role-menu-panel label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #312d4b;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.eftmra-role-permissions-custom__table-scroll {
  min-height: 0;
  height: 450px;
  max-height: 450px;
  overflow-x: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  position: relative;
  background: #ffffff;
}

.eftmra-role-permissions-custom__table {
  width: max(100%, calc(var(--visible-role-count, 4) * var(--permissions-role-column-width, 300px)));
  min-width: max(980px, calc(var(--visible-role-count, 4) * var(--permissions-role-column-width, 300px)));
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

table.eftmra-role-permissions-custom__table thead {
    height: 55px;
}

.eftmra-role-permissions-custom__table th,
.eftmra-role-permissions-custom__table td {
  vertical-align: top;
  border-right: 1px solid #e1e1e1;
  border-bottom: 1px solid #ececf1;
  padding: 1rem;
  background: #ffffff;
}

.eftmra-role-permissions-custom__table th:last-child,
.eftmra-role-permissions-custom__table td:last-child {
  border-right: 0;
}

.eftmra-role-permissions-custom__table thead th {
  z-index: 3;
  background: #fbfbfc;
  box-shadow: 0 1px 0 #e2e3e8;
}

.eftmra-role-permissions-custom__module-heading,
.eftmra-role-permissions-custom__module-cell {
  z-index: 2;
  background: #f0f7fb;
  color: #312d4b;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.eftmra-role-permissions-custom__module-label {
  position: sticky;
  left: 1rem;
  z-index: 3;
  display: inline-flex;
  max-width: calc(100vw - 4rem);
  align-items: center;
  background: inherit;
}

.eftmra-role-permissions-custom__module-heading,
.eftmra-role-permissions-custom__module-cell {
  position: sticky;
  left: 0;
  width: auto;
  min-width: 0;
  max-width: none;
}

.eftmra-role-permissions-custom__module-heading {
  z-index: 4 !important;
}

 

.eftmra-role-permissions-custom__table tbody tr:hover th,
.eftmra-role-permissions-custom__table tbody tr:hover td {
  background: #fbfdff;
}

.eftmra-role-permissions-custom__role-title {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 1rem;
  background: #3b76a4;
  color: #ffffff;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 8px 18px rgba(26, 115, 232, 0.16);
}

.eftmra-role-permissions-custom__toggles {
  display: grid;
  gap: 0.85rem;
}

.eftmra-role-permissions-custom__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #ececf1;
  border-radius: 9px;
  padding: 0.8rem 0.85rem;
  color: #312d4b;
  cursor: pointer;
}

.eftmra-role-permissions-custom__toggle-text {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  font-weight: 600;
}

.eftmra-role-permissions-custom__toggle-short {
  display: inline-flex;
  width: 1.45rem;
  height: 1.45rem;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f1f4f8;
  color: #5f5b70;
  font-size: 0.72rem;
  font-weight: 800;
}

.eftmra-role-permissions-custom__toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.eftmra-role-permissions-custom__switch {
  position: relative;
  width: 2.35rem;
  height: 1.3rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #cfd3dc;
  transition: background 160ms ease;
}

.eftmra-role-permissions-custom__switch:before {
  content: "";
  position: absolute;
  top: 0.18rem;
  left: 0.2rem;
  width: 0.94rem;
  height: 0.94rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(47, 43, 61, 0.22);
  transition: transform 160ms ease;
}


`}</style>
      <aside className="eftmra-role-permissions-custom__nav" aria-label="Modules">
        <div className="eftmra-role-permissions-custom__nav-title">Modules</div>
        <div className="eftmra-role-permissions-custom__module-list">
          {modules.map((module) => {
            const isActive = module.value === activeModule;

            return (
              <a
                href={`#${getModuleSectionId(module.value)}`}
                key={module.value}
                aria-current={isActive ? "true" : undefined}
                className={`eftmra-role-permissions-custom__module ${isActive ? "is-active" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToModule(module.value);
                }}
              >
                {module.label}
              </a>
            );
          })}
        </div>
      </aside>

      <main className="eftmra-role-permissions-custom__panel">
        <div className="eftmra-role-permissions-custom__panel-header">
          <div>
            <span>Permissions</span>
            <strong>All Modules</strong>
          </div>
          <div className="eftmra-role-permissions-custom__role-count">
            {visibleRoleOptions.length} roles
          </div>
        </div>

        <div
          className="eftmra-role-permissions-custom__table-scroll"
          onScroll={updateActiveModuleFromScroll}
          ref={tableScrollRef}
          style={{ "--visible-role-count": visibleRoleOptions.length } as CSSProperties}
        >
          <table className="eftmra-role-permissions-custom__table">
            <thead>
              <tr>
                {/* <th className="eftmra-role-permissions-custom__module-heading" scope="col">
                  Module
                </th> */}
                {visibleRoleOptions.map((role) => (
                  <th key={role.value} scope="col" style={{ "textAlign": "left" }}>
                    <span className="eftmra-role-permissions-custom__role-title">{role.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <Fragment key={module.value}>
                <tr
                  data-module-value={module.value}
                  id={getModuleSectionId(module.value)}
                >
                  <th
                    className="eftmra-role-permissions-custom__module-cell"
                    colSpan={visibleRoleOptions.length}
                    scope="rowgroup"
                    style={{ "textAlign": "left" }}
                  >
                    <span className="eftmra-role-permissions-custom__module-label">{module.label}</span>
                  </th>
                </tr>
                <tr
                  onMouseEnter={() => setActiveModule(module.value)}
                >
                  {/* <th className="eftmra-role-permissions-custom__module-cell" scope="row">
                    {module.label}
                  </th> */}
                  {visibleRoleOptions.map((role) => (
                    <td key={role.value}>
                      <div className="eftmra-role-permissions-custom__toggles">
                        {operations.map((operation) => (
                          getPermissionPath(role.value, module.value, operation.value) ? (
                            <PermissionToggle
                              disabled={isPermissionLocked(role.value, module.value)}
                              key={operation.value}
                              label={operation.label}
                              path={getPermissionPath(role.value, module.value, operation.value)}
                              shortLabel={operation.shortLabel}
                            />
                          ) : null
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
