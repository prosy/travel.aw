import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { ManifestValidationError } from "./errors.js";
import type { EgressRule, RiskLevel, SkillManifest, SkillPermissions } from "./types.js";

const VALID_RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
const C_CODE_PATTERN = /^C-[A-Z][A-Z0-9-]*$/;
const J_STAGE_PATTERN = /^J[0-8]$/;
const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Load and validate a skill.yaml manifest from a skill directory.
 */
export async function loadManifest(skillDir: string): Promise<SkillManifest> {
  const manifestPath = join(skillDir, "skill.yaml");

  let raw: string;
  try {
    raw = await readFile(manifestPath, "utf-8");
  } catch {
    throw new ManifestValidationError(
      `Cannot read manifest at ${manifestPath}`,
      "skill.yaml",
    );
  }

  let doc: unknown;
  try {
    doc = parseYaml(raw);
  } catch (err) {
    throw new ManifestValidationError(
      `Invalid YAML in ${manifestPath}: ${(err as Error).message}`,
      "skill.yaml",
    );
  }

  if (typeof doc !== "object" || doc === null) {
    throw new ManifestValidationError(
      "Manifest must be a YAML mapping",
      "skill.yaml",
    );
  }

  const m = doc as Record<string, unknown>;
  return validateManifest(m);
}

function validateManifest(m: Record<string, unknown>): SkillManifest {
  // name
  requireString(m, "name");
  if (!KEBAB_CASE_PATTERN.test(m.name as string)) {
    throw new ManifestValidationError(
      `"name" must be lowercase kebab-case, got "${m.name}"`,
      "name",
    );
  }

  // version
  requireString(m, "version");
  if (!SEMVER_PATTERN.test(m.version as string)) {
    throw new ManifestValidationError(
      `"version" must be semver (X.Y.Z), got "${m.version}"`,
      "version",
    );
  }

  // description
  requireString(m, "description");

  // author
  requireString(m, "author");

  // capabilities
  requireArray(m, "capabilities");
  for (const cap of m.capabilities as unknown[]) {
    if (typeof cap !== "string" || !C_CODE_PATTERN.test(cap)) {
      throw new ManifestValidationError(
        `Invalid capability code "${cap}". Must match C-CODE pattern (e.g., C-FLIGHT-SEARCH).`,
        "capabilities",
      );
    }
  }

  // journeyStages
  requireArray(m, "journeyStages");
  for (const stage of m.journeyStages as unknown[]) {
    if (typeof stage !== "string" || !J_STAGE_PATTERN.test(stage)) {
      throw new ManifestValidationError(
        `Invalid journey stage "${stage}". Must be J0-J8.`,
        "journeyStages",
      );
    }
  }

  // permissions
  if (typeof m.permissions !== "object" || m.permissions === null) {
    throw new ManifestValidationError(
      '"permissions" is required and must be an object',
      "permissions",
    );
  }
  const permissions = validatePermissions(m.permissions as Record<string, unknown>);

  // risk_level
  requireString(m, "risk_level");
  if (!VALID_RISK_LEVELS.includes(m.risk_level as RiskLevel)) {
    throw new ManifestValidationError(
      `"risk_level" must be one of ${VALID_RISK_LEVELS.join(", ")}, got "${m.risk_level}"`,
      "risk_level",
    );
  }

  return {
    name: m.name as string,
    version: m.version as string,
    description: m.description as string,
    author: m.author as string,
    capabilities: m.capabilities as string[],
    journeyStages: m.journeyStages as string[],
    permissions,
    risk_level: m.risk_level as RiskLevel,
  };
}

function validatePermissions(p: Record<string, unknown>): SkillPermissions {
  // network.egress
  const network = requireObject(p, "network");
  requireArray(network, "egress");
  const egress: EgressRule[] = [];
  for (const rule of network.egress as unknown[]) {
    if (typeof rule !== "object" || rule === null) {
      throw new ManifestValidationError(
        "Each egress rule must be an object with {domain, reason}",
        "permissions.network.egress",
      );
    }
    const r = rule as Record<string, unknown>;
    if (typeof r.domain !== "string" || r.domain.length === 0) {
      throw new ManifestValidationError(
        "Egress rule missing required string field: domain",
        "permissions.network.egress",
      );
    }
    if (r.domain.includes("*")) {
      throw new ManifestValidationError(
        `Wildcard domains not allowed in egress: "${r.domain}"`,
        "permissions.network.egress",
      );
    }
    if (typeof r.reason !== "string" || r.reason.length === 0) {
      throw new ManifestValidationError(
        "Egress rule missing required string field: reason",
        "permissions.network.egress",
      );
    }
    egress.push({ domain: r.domain, reason: r.reason });
  }

  // filesystem
  const filesystem = requireObject(p, "filesystem");
  requireArray(filesystem, "read");
  requireArray(filesystem, "write");

  // env_vars
  const envVars = requireObject(p, "env_vars");
  requireArray(envVars, "required");
  requireArray(envVars, "optional");

  return {
    network: { egress },
    filesystem: {
      read: filesystem.read as string[],
      write: filesystem.write as string[],
    },
    env_vars: {
      required: envVars.required as string[],
      optional: envVars.optional as string[],
    },
  };
}

// --- Helpers ---

function requireString(obj: Record<string, unknown>, field: string): void {
  if (typeof obj[field] !== "string" || (obj[field] as string).length === 0) {
    throw new ManifestValidationError(
      `"${field}" is required and must be a non-empty string`,
      field,
    );
  }
}

function requireArray(obj: Record<string, unknown>, field: string): void {
  if (!Array.isArray(obj[field])) {
    throw new ManifestValidationError(
      `"${field}" is required and must be an array`,
      field,
    );
  }
}

function requireObject(
  obj: Record<string, unknown>,
  field: string,
): Record<string, unknown> {
  if (typeof obj[field] !== "object" || obj[field] === null || Array.isArray(obj[field])) {
    throw new ManifestValidationError(
      `"${field}" is required and must be an object`,
      field,
    );
  }
  return obj[field] as Record<string, unknown>;
}
