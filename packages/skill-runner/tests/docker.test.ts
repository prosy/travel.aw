import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { loadManifest } from "../src/manifest.js";
import {
  validateEnvVars,
  imageName,
  imageExists,
  buildImage,
  runContainer,
} from "../src/docker.js";
import {
  ConfigError,
  ContainerTimeoutError,
} from "../src/errors.js";

const FIXTURES = join(__dirname, "..", "test-fixtures");
const ECHO_SKILL = join(FIXTURES, "echo-skill");
const TIMEOUT_SKILL = join(FIXTURES, "timeout-skill");

describe("validateEnvVars", () => {
  it("passes when all required vars are provided", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    // echo-skill has no required env vars
    expect(() => validateEnvVars(manifest, {})).not.toThrow();
  });

  it("throws ConfigError for missing required vars", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    // Simulate a manifest with required vars
    manifest.permissions.env_vars.required = ["API_KEY", "SECRET"];
    expect(() => validateEnvVars(manifest, {})).toThrow(ConfigError);
    expect(() => validateEnvVars(manifest, {})).toThrow("API_KEY, SECRET");
  });

  it("passes when required vars are present", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    manifest.permissions.env_vars.required = ["API_KEY"];
    expect(() =>
      validateEnvVars(manifest, { API_KEY: "test-key" }),
    ).not.toThrow();
  });
});

describe("imageName", () => {
  it("generates correct image name", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    expect(imageName(manifest, "travel-aw-skill-")).toBe(
      "travel-aw-skill-echo-skill:0.1.0",
    );
  });
});

// Integration tests — require Docker to be running
describe("Docker container lifecycle", () => {
  const IMAGE = "travel-aw-skill-echo-skill:0.1.0";

  it("builds echo-skill image", async () => {
    await buildImage(ECHO_SKILL, IMAGE, "echo-skill");
    const exists = await imageExists(IMAGE);
    expect(exists).toBe(true);
  });

  it("runs echo-skill and returns parsed output", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    const input = { message: "hello", count: 42 };

    const result = await runContainer(manifest, input, ECHO_SKILL, {
      imagePrefix: "travel-aw-skill-",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      echo: input,
      skill: "echo-skill",
    });
    expect(result.metadata.skillName).toBe("echo-skill");
    expect(result.metadata.durationMs).toBeGreaterThan(0);
    expect(result.metadata.exitCode).toBe(0);
  });

  it("handles container timeout", async () => {
    const TIMEOUT_IMAGE = "travel-aw-skill-timeout-skill:0.1.0";
    await buildImage(TIMEOUT_SKILL, TIMEOUT_IMAGE, "timeout-skill");

    const manifest = await loadManifest(TIMEOUT_SKILL);

    await expect(
      runContainer(manifest, { test: true }, TIMEOUT_SKILL, {
        timeoutSeconds: 3,
        imagePrefix: "travel-aw-skill-",
      }),
    ).rejects.toThrow(ContainerTimeoutError);
  }, 15_000);

  it("rejects when required env vars are missing", async () => {
    const manifest = await loadManifest(ECHO_SKILL);
    manifest.permissions.env_vars.required = ["MISSING_VAR"];

    await expect(
      runContainer(manifest, {}, ECHO_SKILL),
    ).rejects.toThrow(ConfigError);
  });
});
