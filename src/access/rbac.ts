import type { Access, AccessArgs as PayloadAccessArgs } from "payload";

export type Role = string;
export type ModuleKey =
  | "pages"
  | "posts"
  | "categories"
  | "media"
  | "sites"
  | "leads"
  | "email-accounts"
  | "email-templates"
  | "trainings"
  | "trainers"
  | "trainer-contacts"
  | "training-registrations"
  | "practitioners"
  | "practitioner-contacts"
  | "practitioner-registrations"
  | "practitioner-registration-countries"
  | "practitioner-registration-specialties"
  | "testimonials"
  | "practitioner-reviews"
  | "training-reviews"
  | "gallery"
  | "header"
  | "footer"
  | "role-management"
  | "users";
export type CrudOperation = "create" | "read" | "update" | "delete";
export type ModulePermissions = Record<CrudOperation, boolean>;
type RolePermissions = Record<Role, Record<ModuleKey, ModulePermissions>>;
type PermissionRow = {
  module?: ModuleKey | null;
  role?: string | null;
} & Partial<Record<CrudOperation, boolean | null>>;
type NormalizedPermissionRow = {
  module: ModuleKey;
} & Partial<Record<CrudOperation, boolean | null>>;

type AccessArgs = PayloadAccessArgs;
type AccessUserWithRole = NonNullable<PayloadAccessArgs["req"]["user"]> & {
  role?: Role | null;
};

const roleRank: Record<string, number> = {
  editor: 1,
  manager: 2,  
  siteadmin: 3,
  admin: 4,
  superadmin: 5,
};

const builtinRoles = ["editor", "manager", "siteadmin", "admin", "superadmin"] as const;

export const moduleOptions: { label: string; value: ModuleKey }[] = [
  { label: "Pages", value: "pages" },
  { label: "Posts", value: "posts" },
  { label: "Categories", value: "categories" },
  { label: "Media", value: "media" },
  { label: "Sites", value: "sites" },
  { label: "Leads", value: "leads" },
  { label: "Email Accounts", value: "email-accounts" },
  { label: "Email Templates", value: "email-templates" },
  { label: "Trainings", value: "trainings" },
  { label: "Trainers", value: "trainers" },
  { label: "Trainer Contacts", value: "trainer-contacts" },
  { label: "Training Registrations", value: "training-registrations" },
  { label: "Practitioners", value: "practitioners" },
  { label: "Practitioner Contacts", value: "practitioner-contacts" },
  { label: "Practitioner Registrations", value: "practitioner-registrations" },
  { label: "Practitioner Registration Countries", value: "practitioner-registration-countries" },
  { label: "Practitioner Registration Specialties", value: "practitioner-registration-specialties" },
  { label: "Testimonials", value: "testimonials" },
  { label: "Practitioner Reviews", value: "practitioner-reviews" },
  { label: "Training Reviews", value: "training-reviews" },
  { label: "Gallery", value: "gallery" },
  { label: "Header", value: "header" },
  { label: "Footer", value: "footer" },
  { label: "Role Management", value: "role-management" },
  { label: "Users", value: "users" },
];

export const defaultModuleVisibility: Record<string, ModuleKey[]> = {
  editor: ["pages", "posts", "media", "testimonials", "gallery"],
  manager: [
    "pages",
    "posts",
    "categories",
    "media",
    "leads",
    "email-accounts",
    "email-templates",
    "trainings",
    "trainers",
    "trainer-contacts",
    "training-registrations",
    "practitioners",
    "practitioner-contacts",
    "practitioner-registrations",
    "practitioner-registration-countries",
    "practitioner-registration-specialties",
    "testimonials",
    "practitioner-reviews",
    "training-reviews",
    "gallery",
    "header",
    "footer",
  ],
  admin: moduleOptions.map(({ value }) => value),
  superadmin: moduleOptions.map(({ value }) => value),
   siteadmin: [
    "pages",
    "posts",
    "categories",
    "media",
    "leads",
    "email-accounts",
    "email-templates",
    "trainings",
    "trainers",
    "trainer-contacts",
    "training-registrations",
    "practitioners",
    "practitioner-contacts",
    "practitioner-registrations",
    "practitioner-registration-countries",
    "practitioner-registration-specialties",
    "testimonials",
    "practitioner-reviews",
    "training-reviews",
    "gallery",
    "header",
    "footer",
  ],
};

const noAccess: ModulePermissions = {
  create: false,
  read: false,
  update: false,
  delete: false,
};

const readOnly: ModulePermissions = {
  create: false,
  read: true,
  update: false,
  delete: false,
};

export function isRoleOperationAllowed(role: Role, moduleKey: ModuleKey, _operation: CrudOperation) {
  if (role === "siteadmin" && moduleKey === "users") {
    return false;
  }

  return true;
}

function permissions(operations: CrudOperation[]): ModulePermissions {
  return {
    create: operations.includes("create"),
    read: operations.includes("read"),
    update: operations.includes("update"),
    delete: operations.includes("delete"),
  };
}

function roleDefaults(overrides: Partial<Record<ModuleKey, ModulePermissions>>): Record<ModuleKey, ModulePermissions> {
  return Object.fromEntries(moduleOptions.map(({ value }) => [value, overrides[value] ?? noAccess])) as Record<
    ModuleKey,
    ModulePermissions
  >;
}

export const defaultRolePermissions: RolePermissions = {
  editor: roleDefaults({
    pages: permissions(["create", "read", "update"]),
    posts: permissions(["create", "read", "update"]),
    media: permissions(["create", "read"]),
    testimonials: permissions(["create", "read", "update"]),
    gallery: readOnly,
  }),
  manager: roleDefaults({
    pages: permissions(["create", "read", "update", "delete"]),
    posts: permissions(["create", "read", "update", "delete"]),
    categories: permissions(["create", "read", "update"]),
    media: permissions(["create", "read", "update", "delete"]),
    leads: permissions(["read"]),
    "email-accounts": permissions(["create", "read", "update"]),
    "email-templates": permissions(["create", "read", "update"]),
    trainings: permissions(["create", "read", "update"]),
    trainers: permissions(["create", "read", "update"]),
    "trainer-contacts": permissions(["read", "update"]),
    "training-registrations": permissions(["read", "update"]),
    practitioners: permissions(["create", "read", "update"]),
    "practitioner-contacts": permissions(["read", "update"]),
    "practitioner-registrations": permissions(["read", "update"]),
    "practitioner-registration-countries": permissions(["create", "read", "update"]),
    "practitioner-registration-specialties": permissions(["create", "read", "update"]),
    testimonials: permissions(["create", "read", "update", "delete"]),
    "practitioner-reviews": permissions(["create", "read", "update"]),
    "training-reviews": permissions(["create", "read", "update"]),
    gallery: permissions(["create", "read", "update"]),
    header: permissions(["read", "update"]),
    footer: permissions(["read", "update"]),
    "role-management": permissions(["read"]),
  }),
  siteadmin: roleDefaults({
    pages: permissions(["create", "read", "update", "delete"]),
    posts: permissions(["create", "read", "update", "delete"]),
    categories: permissions(["create", "read", "update"]),
    media: permissions(["create", "read", "update", "delete"]),
    leads: permissions(["read"]),
    "email-accounts": permissions(["create", "read", "update"]),
    "email-templates": permissions(["create", "read", "update"]),
    trainings: permissions(["create", "read", "update"]),
    trainers: permissions(["create", "read", "update"]),
    "trainer-contacts": permissions(["read", "update"]),
    "training-registrations": permissions(["read", "update"]),
    practitioners: permissions(["create", "read", "update"]),
    "practitioner-contacts": permissions(["read", "update"]),
    "practitioner-registrations": permissions(["read", "update"]),
    "practitioner-registration-countries": permissions(["create", "read", "update"]),
    "practitioner-registration-specialties": permissions(["create", "read", "update"]),
    testimonials: permissions(["create", "read", "update", "delete"]),
    "practitioner-reviews": permissions(["create", "read", "update"]),
    "training-reviews": permissions(["create", "read", "update"]),
    gallery: permissions(["create", "read", "update"]),
    header: permissions(["read", "update"]),
    footer: permissions(["read", "update"]),
    "role-management": permissions(["read"]),
  }),
  admin: roleDefaults(
    Object.fromEntries(moduleOptions.map(({ value }) => [value, permissions(["create", "read", "update", "delete"])])),
  ),
  superadmin: roleDefaults(
    Object.fromEntries(moduleOptions.map(({ value }) => [value, permissions(["create", "read", "update", "delete"])])),
  ),
};

const visibilityCache = new WeakMap<object, Promise<Record<Role, Set<ModuleKey>>>>();
const permissionCache = new WeakMap<object, Promise<RolePermissions>>();

type RoleRecord = {
  active?: boolean | null;
  label?: string | null;
  value?: string | null;
};

type RoleConfigSource = Record<string, unknown> & {
  roleManagement?: RoleRecord[] | null;
};

function getRole(args: AccessArgs): Role | null {
  const role = (args.req.user as AccessUserWithRole | null | undefined)?.role;
  return typeof role === "string" && role.trim() ? role : null;
}

function visibilityFromGlobal(
  global: unknown,
): Record<Role, Set<ModuleKey>> {
  const visibility: Record<Role, Set<ModuleKey>> = {};
  const globalRecord = (global ?? {}) as Record<string, unknown>;
  const genericRows = getGenericPermissionRows(globalRecord);

  getConfiguredRoles(globalRecord).forEach((role) => {
    const roleRows = genericRows.filter((row) => row.role === role);
    if (roleRows.length) {
      visibility[role] = new Set(
        roleRows
          .filter((row) => row.read && isRoleOperationAllowed(role, row.module, "read"))
          .map((row) => row.module),
      );
      return;
    }

    const legacyRows = getPermissionRows(globalRecord, role);
    if (legacyRows.length) {
      visibility[role] = new Set(
        legacyRows
          .filter((row) => row.read && isRoleOperationAllowed(role, row.module, "read"))
          .map((row) => row.module),
      );
      return;
    }

    const visibleModules = globalRecord[`${role}Modules`];
    visibility[role] = new Set(
      Array.isArray(visibleModules) && visibleModules.length
        ? visibleModules.filter((module): module is ModuleKey => isRoleOperationAllowed(role, module as ModuleKey, "read"))
        : defaultModuleVisibility[role] ?? [],
    );
  });

  return visibility;
}

function getPermissionRows(
  global: Record<string, unknown> | null | undefined,
  role: Role,
): NormalizedPermissionRow[] {
  const rows = global?.[`${role}Permissions`];
  return Array.isArray(rows)
    ? rows.filter((row): row is NormalizedPermissionRow => Boolean(row?.module))
    : [];
}

function getConfiguredRoles(
  global: RoleConfigSource | null | undefined,
): Role[] {
  const dynamicRoles =
    (Array.isArray(global?.roleManagement) ? global.roleManagement : [])
      ?.filter((role) => role.active !== false && role.value)
      .map((role) => role.value as string) ?? [];

  return Array.from(new Set([...builtinRoles, ...dynamicRoles]));
}

function getGenericPermissionRows(
  global: Record<string, unknown> | null | undefined,
): (NormalizedPermissionRow & { role: string })[] {
  const rows = global?.rolePermissions;
  return Array.isArray(rows)
    ? rows.filter((row): row is NormalizedPermissionRow & { role: string } => Boolean(row?.role && row?.module))
    : [];
}

function defaultPermissionsForRole(role: Role): Record<ModuleKey, ModulePermissions> {
  return defaultRolePermissions[role] ?? roleDefaults({});
}

function permissionsFromRows(
  global: unknown,
): RolePermissions {
  const next: RolePermissions = {};
  const globalRecord = (global ?? {}) as Record<string, unknown>;
  const genericRows = getGenericPermissionRows(globalRecord);

  getConfiguredRoles(globalRecord).forEach((role) => {
    next[role] = { ...defaultPermissionsForRole(role) };

    const roleRows = genericRows.filter((row) => row.role === role);
    if (roleRows.length) {
      roleRows.forEach((row) => {
        next[role][row.module] = {
          create: Boolean(row.create) && isRoleOperationAllowed(role, row.module, "create"),
          read: Boolean(row.read) && isRoleOperationAllowed(role, row.module, "read"),
          update: Boolean(row.update) && isRoleOperationAllowed(role, row.module, "update"),
          delete: Boolean(row.delete) && isRoleOperationAllowed(role, row.module, "delete"),
        };
      });
      return;
    }

    const rows = getPermissionRows(globalRecord, role);

    if (rows.length) {
      next[role] = { ...defaultPermissionsForRole(role) };
      rows.forEach((row) => {
        next[role][row.module] = {
          create: Boolean(row.create) && isRoleOperationAllowed(role, row.module, "create"),
          read: Boolean(row.read) && isRoleOperationAllowed(role, row.module, "read"),
          update: Boolean(row.update) && isRoleOperationAllowed(role, row.module, "update"),
          delete: Boolean(row.delete) && isRoleOperationAllowed(role, row.module, "delete"),
        };
      });
      return;
    }

    const visibleModules = globalRecord[`${role}Modules`];
    if (Array.isArray(visibleModules) && visibleModules.length) {
      next[role] = { ...defaultPermissionsForRole(role) };
      moduleOptions.forEach(({ value }) => {
        if (!visibleModules.includes(value)) {
          next[role][value] = noAccess;
        }
      });
    }
  });

  return next;
}

async function getModuleVisibility(args: AccessArgs): Promise<Record<Role, Set<ModuleKey>>> {
  const req = args.req;

  if (!req || !req.payload?.findGlobal) {
    return visibilityFromGlobal(null);
  }

  const cached = visibilityCache.get(req);
  if (cached) {
    return cached;
  }

  const visibility = req.payload
    .findGlobal({
      slug: "role-module-visibility",
      depth: 0,
      overrideAccess: true,
    })
    .then(async (global) => ({
      ...((global ?? {}) as unknown as Record<string, unknown>),
      roleManagement: await req.payload
        .find({
          collection: "role-management",
          depth: 0,
          limit: 100,
          overrideAccess: true,
          sort: "sortOrder",
        })
        .then((result) => result.docs as RoleRecord[])
        .catch(() => []),
    }))
    .then(visibilityFromGlobal)
    .catch(() => visibilityFromGlobal(null));

  visibilityCache.set(req, visibility);
  return visibility;
}

async function getRolePermissions(args: AccessArgs): Promise<RolePermissions> {
  const req = args.req;

  if (!req || !req.payload?.findGlobal) {
    return defaultRolePermissions;
  }

  const cached = permissionCache.get(req);
  if (cached) {
    return cached;
  }

  const rolePermissions = req.payload
    .findGlobal({
      slug: "role-module-visibility",
      depth: 0,
      overrideAccess: true,
    })
    .then(async (global) => ({
      ...((global ?? {}) as unknown as Record<string, unknown>),
      roleManagement: await req.payload
        .find({
          collection: "role-management",
          depth: 0,
          limit: 100,
          overrideAccess: true,
          sort: "sortOrder",
        })
        .then((result) => result.docs as RoleRecord[])
        .catch(() => []),
    }))
    .then(permissionsFromRows)
    .catch(() => defaultRolePermissions);

  permissionCache.set(req, rolePermissions);
  return rolePermissions;
}

async function canAccessModule(args: AccessArgs, moduleKey: ModuleKey): Promise<boolean> {
  const role = getRole(args);
  if (!role) {
    return false;
  }

  // Always allow admins to see all modules
  if (role === "admin" || role === "superadmin") {
    return true;
  }

  const visibility = await getModuleVisibility(args);
  return Boolean(visibility[role]?.has(moduleKey));
}

async function canUseOperation(
  args: AccessArgs,
  moduleKey: ModuleKey,
  operation: CrudOperation,
): Promise<boolean> {
  const role = getRole(args);
  if (!role) {
    return false;
  }

  // Always allow admins full access to all operations
  if (role === "admin" || role === "superadmin") {
    return true;
  }

  const rolePermissions = await getRolePermissions(args);
  return Boolean(rolePermissions[role]?.[moduleKey]?.[operation]) && isRoleOperationAllowed(role, moduleKey, operation);
}

export function hasRole(minimumRole: Role) {
  return ((args: AccessArgs) => {
    const role = getRole(args);
    return role ? (roleRank[role] ?? 0) >= (roleRank[minimumRole] ?? 0) : false;
  }) satisfies Access;
}

export function hasRoleForModule(minimumRole: Role, moduleKey: ModuleKey) {
  return (async (args: AccessArgs) => {
    const role = getRole(args);
    return role ? (roleRank[role] ?? 0) >= (roleRank[minimumRole] ?? 0) && (await canAccessModule(args, moduleKey)) : false;
  }) satisfies Access;
}

export function canCreate(moduleKey: ModuleKey) {
  return ((args: AccessArgs) => canUseOperation(args, moduleKey, "create")) satisfies Access;
}

export function canRead(moduleKey: ModuleKey) {
  return ((args: AccessArgs) => canUseOperation(args, moduleKey, "read")) satisfies Access;
}

export function canReadUsersOrSelf() {
  return (async (args: AccessArgs) => {
    if (await canUseOperation(args, "users", "read")) {
      return true;
    }

    const userID = args.req.user?.id;
    if (!userID) {
      return false;
    }

    return {
      id: {
        equals: userID,
      },
    };
  }) satisfies Access;
}

export function canUpdate(moduleKey: ModuleKey) {
  return ((args: AccessArgs) => canUseOperation(args, moduleKey, "update")) satisfies Access;
}

export function canUpdateUsersOrSelf() {
  return (async (args: AccessArgs) => {
    if (await canUseOperation(args, "users", "update")) {
      return true;
    }

    const userID = args.req.user?.id;
    if (!userID) {
      return false;
    }

    return {
      id: {
        equals: userID,
      },
    };
  }) satisfies Access;
}

export function canDelete(moduleKey: ModuleKey) {
  return ((args: AccessArgs) => canUseOperation(args, moduleKey, "delete")) satisfies Access;
}

export function publicRead(moduleKey?: ModuleKey) {
  return (async (args: AccessArgs) => {
    if (!args.req.user || !moduleKey) {
      return true;
    }

    return canUseOperation(args, moduleKey, "read");
  }) satisfies Access;
}

export function publicCreate(moduleKey?: ModuleKey) {
  return (async (args: AccessArgs) => {
    if (!args.req.user || !moduleKey) {
      return true;
    }

    return canUseOperation(args, moduleKey, "create");
  }) satisfies Access;
}

export function publishedOnly(moduleKey?: ModuleKey, statusField = "_status") {
  return (async (args: AccessArgs) => {
    if (args.req.user) {
      return moduleKey ? canUseOperation(args, moduleKey, "read") : true;
    }

    return {
      [statusField]: {
        equals: "published",
      },
    };
  }) satisfies Access;
}
