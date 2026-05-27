import type { GlobalConfig } from "payload";

import { defaultRolePermissions, isRoleOperationAllowed, moduleOptions, type Role } from "../access/rbac";

type PermissionRow = {
  id?: string | null;
  module?: string | null;
  role?: string | null;
  create?: boolean | null;
  read?: boolean | null;
  update?: boolean | null;
  delete?: boolean | null;
};

const builtinRoles = Object.keys(defaultRolePermissions);

function defaultPermissionsForRole(role: Role) {
  return moduleOptions.map(({ value }) => ({
    module: value,
    ...defaultRolePermissions[role][value],
  }));
}

function coercePermissionRows(rows?: PermissionRow[] | Record<string, PermissionRow> | null) {
  if (Array.isArray(rows)) return rows;
  if (rows && typeof rows === "object") return Object.values(rows);
  return [];
}

function normalizePermissionsForRole(role: Role, rows?: PermissionRow[] | Record<string, PermissionRow> | null) {
  const coercedRows = coercePermissionRows(rows);
  const rowsByModule = new Map(coercedRows.filter((row) => row.module).map((row) => [row.module, row]));

  return moduleOptions.map(({ value }) => {
    const row = rowsByModule.get(value);
    const defaults = defaultRolePermissions[role][value];

    if (row && 
        row.module === value && 
        typeof row.create === 'boolean' && 
        typeof row.read === 'boolean' && 
        typeof row.update === 'boolean' && 
        typeof row.delete === 'boolean') {
      return {
        ...row,
        create: row.create && isRoleOperationAllowed(role, value, "create"),
        read: row.read && isRoleOperationAllowed(role, value, "read"),
        update: row.update && isRoleOperationAllowed(role, value, "update"),
        delete: row.delete && isRoleOperationAllowed(role, value, "delete"),
      };
    }

    return {
      id: row?.id || undefined,
      module: value,
      create: Boolean(row?.create ?? defaults.create) && isRoleOperationAllowed(role, value, "create"),
      read: Boolean(row?.read ?? defaults.read) && isRoleOperationAllowed(role, value, "read"),
      update: Boolean(row?.update ?? defaults.update) && isRoleOperationAllowed(role, value, "update"),
      delete: Boolean(row?.delete ?? defaults.delete) && isRoleOperationAllowed(role, value, "delete"),
    };
  });
}

function normalizeGenericPermissions(
  rows?: PermissionRow[] | Record<string, PermissionRow> | null,
) {
  const coercedRows = coercePermissionRows(rows);
  const roleValues = Array.from(
    new Set([
      ...builtinRoles,
      ...coercedRows
        .map((row) => row.role)
        .filter((role): role is string => typeof role === "string" && Boolean(role.trim())),
    ]),
  );
  const rowsByRoleModule = new Map(
    coercedRows
      .filter((row) => row.role && row.module)
      .map((row) => [`${row.role}:${row.module}`, row]),
  );

  return roleValues.flatMap((roleValue) =>
    moduleOptions.map(({ value }) => {
      const row = rowsByRoleModule.get(`${roleValue}:${value}`);
      const defaults = defaultRolePermissions[roleValue]?.[value] ?? {
        create: false,
        read: false,
        update: false,
        delete: false,
      };

      return {
        id: row?.id || undefined,
        role: roleValue,
        module: value,
        create: Boolean(row?.create ?? defaults.create) && isRoleOperationAllowed(roleValue, value, "create"),
        read: Boolean(row?.read ?? defaults.read) && isRoleOperationAllowed(roleValue, value, "read"),
        update: Boolean(row?.update ?? defaults.update) && isRoleOperationAllowed(roleValue, value, "update"),
        delete: Boolean(row?.delete ?? defaults.delete) && isRoleOperationAllowed(roleValue, value, "delete"),
      };
    }),
  );
}

function rolePermissionField(role: Role, label: string) {
  return {
    name: `${role}Permissions`,
    label,
    type: "array" as const,
    defaultValue: defaultPermissionsForRole(role),
    admin: {
      hidden: true,
    },
    fields: [
      {
        name: "module",
        type: "select" as const,
        required: true,
        options: moduleOptions,
      },
      {
        type: "row" as const,
        admin: {
          className: "eftmra-role-permissions-row",
        },
        fields: [
          {
            name: "create",
            label: "Create",
            type: "checkbox" as const,
            defaultValue: false,
          },
          {
            name: "read",
            label: "Read",
            type: "checkbox" as const,
            defaultValue: false,
          },
          {
            name: "update",
            label: "Update",
            type: "checkbox" as const,
            defaultValue: false,
          },
          {
            name: "delete",
            label: "Delete",
            type: "checkbox" as const,
            defaultValue: false,
          },
        ],
      },
    ],
  };
}

export const RoleModuleVisibility: GlobalConfig = {
  slug: "role-module-visibility",
  label: "Role Module Visibility",
  forceSelect: {
    updatedAt: true,
    createdAt: true,
  },
  admin: {
    group: "Settings",
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        return {
          ...data,
          rolePermissions: normalizeGenericPermissions(data.rolePermissions),
          editorPermissions: normalizePermissionsForRole("editor", data.editorPermissions),
          managerPermissions: normalizePermissionsForRole("manager", data.managerPermissions),
          siteadminPermissions: normalizePermissionsForRole("siteadmin", data.siteadminPermissions),
          adminPermissions: normalizePermissionsForRole("admin", data.adminPermissions),
        };
      },
    ],
  },
  fields: [
    {
      name: "rolePermissions",
      type: "array",
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: "role",
          type: "text",
          required: true,
        },
        {
          name: "module",
          type: "select" as const,
          required: true,
          options: moduleOptions,
        },
        {
          type: "row" as const,
          admin: {
            className: "eftmra-role-permissions-row",
          },
          fields: [
            {
              name: "create",
              label: "Create",
              type: "checkbox" as const,
              defaultValue: false,
            },
            {
              name: "read",
              label: "Read",
              type: "checkbox" as const,
              defaultValue: false,
            },
            {
              name: "update",
              label: "Update",
              type: "checkbox" as const,
              defaultValue: false,
            },
            {
              name: "delete",
              label: "Delete",
              type: "checkbox" as const,
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: "rolePermissionsMatrix",
      type: "ui",
      admin: {
        components: {
          Field: "./src/components/admin/RolePermissionsMatrix.tsx#default",
        },
        custom: {
          defaultPermissions: defaultRolePermissions,
          modules: moduleOptions,
        },
      },
    },
    rolePermissionField("editor", "Editor"),
    rolePermissionField("manager", "Manager"),
    rolePermissionField("siteadmin", "Site Admin"),
    rolePermissionField("admin", "Admin"),
  ],
};
