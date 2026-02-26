import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadManifest } from "../src/manifest.js";
import { ManifestValidationError } from "../src/errors.js";

let tempDir: string;

const VALID_MANIFEST = `
name: test-skill
version: "1.0.0"
description: "A valid test skill"
author: "test-author"
capabilities:
  - C-INFO
journeyStages:
  - J0
permissions:
  network:
    egress: []
  filesystem:
    read: []
    write: []
  env_vars:
    required: []
    optional: []
risk_level: "low"
`;

async function writeManifest(yaml: string): Promise<void> {
  await writeFile(join(tempDir, "skill.yaml"), yaml, "utf-8");
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "skill-runner-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("manifest field validation", () => {
  it("accepts a valid manifest", async () => {
    await writeManifest(VALID_MANIFEST);
    const m = await loadManifest(tempDir);
    expect(m.name).toBe("test-skill");
    expect(m.version).toBe("1.0.0");
  });

  it("rejects non-kebab-case name", async () => {
    await writeManifest(VALID_MANIFEST.replace("test-skill", "TestSkill"));
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("kebab-case");
  });

  it("rejects invalid semver version", async () => {
    await writeManifest(VALID_MANIFEST.replace('"1.0.0"', '"v1"'));
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("semver");
  });

  it("rejects missing description", async () => {
    await writeManifest(
      VALID_MANIFEST.replace('description: "A valid test skill"', "description: \"\""),
    );
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("description");
  });

  it("rejects invalid C-code format", async () => {
    await writeManifest(VALID_MANIFEST.replace("C-INFO", "info"));
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("capability code");
  });

  it("rejects invalid J-stage format", async () => {
    await writeManifest(VALID_MANIFEST.replace("J0", "J9"));
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("journey stage");
  });

  it("rejects invalid risk_level", async () => {
    await writeManifest(VALID_MANIFEST.replace('"low"', '"critical"'));
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("risk_level");
  });

  it("rejects wildcard domains in egress", async () => {
    const yaml = VALID_MANIFEST.replace(
      "egress: []",
      'egress:\n      - domain: "*.example.com"\n        reason: "test"',
    );
    await writeManifest(yaml);
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("Wildcard");
  });

  it("accepts valid egress rules", async () => {
    const yaml = VALID_MANIFEST.replace(
      "egress: []",
      'egress:\n      - domain: "api.example.com"\n        reason: "API access"',
    );
    await writeManifest(yaml);
    const m = await loadManifest(tempDir);
    expect(m.permissions.network.egress).toEqual([
      { domain: "api.example.com", reason: "API access" },
    ]);
  });

  it("rejects invalid YAML", async () => {
    await writeManifest("{{{{not yaml");
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
  });

  it("rejects missing permissions object", async () => {
    const yaml = VALID_MANIFEST.replace(
      /permissions:[\s\S]*?risk_level/,
      "risk_level",
    );
    await writeManifest(yaml);
    await expect(loadManifest(tempDir)).rejects.toThrow(ManifestValidationError);
    await expect(loadManifest(tempDir)).rejects.toThrow("permissions");
  });
});
