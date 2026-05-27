import type { CollectionConfig, Payload } from "payload";

function isRoleManager(user: { role?: string | null } | null | undefined) {
  return user?.role === "admin" || user?.role === "superadmin";
}

type RoleRelationshipValue =
  | number
  | string
  | {
      value?: string | null;
    }
  | null
  | undefined;

async function resolveRoleKey({
  payload,
  selectedRole,
}: {
  payload: Payload;
  selectedRole: RoleRelationshipValue;
}) {
  if (!selectedRole) return undefined;

  if (typeof selectedRole === "object" && selectedRole.value) {
    return selectedRole.value;
  }

  const id = typeof selectedRole === "string" || typeof selectedRole === "number" ? selectedRole : undefined;
  if (!id) return undefined;

  const role = await payload.findByID({
    collection: "role-management",
    id,
    depth: 0,
    overrideAccess: true,
  });

  return typeof role?.value === "string" && role.value ? role.value : undefined;
}

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Settings",
    hidden: ({ user }) => user?.role !== "admin" && user?.role !== "superadmin",
  },
  hooks: {
    beforeValidate: [
      async ({ context, data, req }) => {
        if (!data) return data;

        if (context.skipRoleSelectionResolve && data.role) {
          return data;
        }

        const roleKey = await resolveRoleKey({
          payload: req.payload,
          selectedRole: data.roleSelection as RoleRelationshipValue,
        });

        return {
          ...data,
          role: roleKey ?? data.role ?? "editor",
        };
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "roleSelection",
      label: "Role",
      type: "relationship",
      relationTo: "role-management",
      required: true,
      access: {
        create: ({ req }) => isRoleManager(req.user),
        read: ({ req }) => isRoleManager(req.user),
        update: ({ req }) => isRoleManager(req.user),
      },
      admin: {
        condition: (_, __, { user }) => isRoleManager(user),
        description: "Select a role created in Settings > Role Management.",
      },
    },
    {
      name: "role",
      type: "text",
      defaultValue: "editor",
      required: true,
      access: {
        create: ({ req }) => isRoleManager(req.user),
        read: ({ req }) => isRoleManager(req.user),
        update: ({ req }) => isRoleManager(req.user),
      },
      admin: {
        hidden: true,
      },
    },
  ],
};
