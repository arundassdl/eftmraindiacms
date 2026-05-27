import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const scriptsDir = resolve(process.cwd(), "scripts");

async function scriptSources() {
  const files = (await readdir(scriptsDir)).filter((file) => file.endsWith(".ts"));

  return Promise.all(
    files.map(async (file) => ({
      file,
      source: await readFile(resolve(scriptsDir, file), "utf8"),
    })),
  );
}

describe("CMS sync and import scripts", () => {
  it("loads Payload through the project config when a script touches CMS data", async () => {
    for (const { file, source } of await scriptSources()) {
      if (!/\bpayload\.(create|update|find|findGlobal|updateGlobal|delete)\b/.test(source)) continue;

      assert.match(source, /getPayload\s*\(/, `${file} should use getPayload()`);
      assert.match(source, /config(?:Promise)?/, `${file} should load the project Payload config`);
    }
  });

  it("uses slug, filename, or id lookups before creating likely duplicate records", async () => {
    const importScripts = (await scriptSources()).filter(({ file }) => /^import-|^seed-|^migrate/.test(file));

    for (const { file, source } of importScripts) {
      if (!/\bpayload\.create\b/.test(source)) continue;

      assert.match(
        source,
        /\b(payload\.find|findExisting|existing|slug|filename|where)\b/,
        `${file} creates records without an obvious lookup/upsert guard`,
      );
    }
  });

  it("keeps export scripts writing JSON seed artifacts", async () => {
    const exportScripts = (await scriptSources()).filter(({ file }) => file.startsWith("export-"));

    for (const { file, source } of exportScripts) {
      assert.match(source, /\.json["'`]/, `${file} should target JSON output`);
      assert.match(source, /\bwriteFile\b|\bfs\.writeFile/, `${file} should write an export artifact`);
    }
  });
});
