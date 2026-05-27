import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canCreate,
  canDelete,
  canRead,
  canReadUsersOrSelf,
  canUpdateUsersOrSelf,
  defaultRolePermissions,
  hasRole,
  isRoleOperationAllowed,
  moduleOptions,
  publicCreate,
  publicRead,
  publishedOnly,
} from "../src/access/rbac";

function accessArgs(role?: string | null, payload?: unknown, userExtras: Record<string, unknown> = {}) {
  return {
    req: {
      payload,
      user: role ? { id: 42, role, ...userExtras } : null,
    },
  } as any;
}

describe("RBAC defaults", () => {
  it("defines permissions for every built-in role and module", () => {
    const operations = ["create", "read", "update", "delete"] as const;

    for (const [role, permissions] of Object.entries(defaultRolePermissions)) {
      for (const { value: moduleKey } of moduleOptions) {
        assert.ok(permissions[moduleKey], `${role} is missing ${moduleKey}`);

        for (const operation of operations) {
          assert.equal(typeof permissions[moduleKey][operation], "boolean", `${role}.${moduleKey}.${operation}`);
        }
      }
    }
  });

  it("prevents site admins from operating on users even when a row grants it", async () => {
    const payload = {
      async findGlobal() {
        return {
          rolePermissions: [
            {
              role: "siteadmin",
              module: "users",
              create: true,
              read: true,
              update: true,
              delete: true,
            },
          ],
        };
      },
      async find() {
        return { docs: [] };
      },
    };

    assert.equal(isRoleOperationAllowed("siteadmin", "users", "read"), false);
    assert.equal(await canRead("users")(accessArgs("siteadmin", payload)), false);
    assert.equal(await canCreate("users")(accessArgs("siteadmin", payload)), false);
  });

  it("allows admins and superadmins full module operations", async () => {
    for (const role of ["admin", "superadmin"]) {
      assert.equal(await canCreate("users")(accessArgs(role)), true);
      assert.equal(await canDelete("role-management")(accessArgs(role)), true);
    }
  });

  it("enforces rank checks for hasRole", () => {
    assert.equal(hasRole("manager")(accessArgs("editor")), false);
    assert.equal(hasRole("manager")(accessArgs("manager")), true);
    assert.equal(hasRole("manager")(accessArgs("admin")), true);
    assert.equal(hasRole("editor")(accessArgs(null)), false);
  });
});

describe("RBAC public helpers", () => {
  it("allows anonymous public reads and creates", async () => {
    assert.equal(await publicRead("pages")(accessArgs(null)), true);
    assert.equal(await publicCreate("leads")(accessArgs(null)), true);
  });

  it("limits anonymous publishedOnly access to published documents", async () => {
    assert.deepEqual(await publishedOnly("pages")(accessArgs(null)), {
      _status: {
        equals: "published",
      },
    });
  });

  it("falls back to self-only user access when role cannot read or update users", async () => {
    assert.deepEqual(await canReadUsersOrSelf()(accessArgs("siteadmin", undefined, { id: 7 })), {
      id: {
        equals: 7,
      },
    });
    assert.deepEqual(await canUpdateUsersOrSelf()(accessArgs("siteadmin", undefined, { id: 8 })), {
      id: {
        equals: 8,
      },
    });
  });
});
