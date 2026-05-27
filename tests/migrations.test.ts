import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { migrations } from "../src/migrations";

const migrationsDir = resolve(process.cwd(), "src/migrations");
const migrationNamePattern = /^\d{8}_\d{6}_[a-z0-9_]+$/;

describe("Payload migrations", () => {
  it("registers every migration file in the migration index", async () => {
    const files = (await readdir(migrationsDir))
      .filter((file) => migrationNamePattern.test(file.replace(/\.ts$/, "")) && file.endsWith(".ts"))
      .map((file) => file.replace(/\.ts$/, ""));
    const indexedNames = migrations.map((migration) => migration.name);

    assert.deepEqual([...indexedNames].sort(), files.sort());
  });

  it("keeps migrations in timestamp order", () => {
    const indexedNames = migrations.map((migration) => migration.name);

    assert.deepEqual(indexedNames, [...indexedNames].sort());
  });

  it("exports up and down handlers for every migration", () => {
    for (const migration of migrations) {
      assert.equal(typeof migration.up, "function", `${migration.name} is missing up()`);
      assert.equal(typeof migration.down, "function", `${migration.name} is missing down()`);
    }
  });

  it("keeps migration files named after their exported index entries", async () => {
    const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".ts"));

    for (const migration of migrations) {
      assert.ok(files.includes(`${migration.name}.ts`), `${migration.name} has no matching migration file`);
    }
  });
});
