/**
 * SkillRunner type definitions.
 * Aligned with SKILL_MANIFEST_SPEC.md from travel-aw-skills.
 */

// --- Manifest types (parsed from skill.yaml) ---

export interface EgressRule {
  domain: string;
  reason: string;
}

export interface SkillPermissions {
  network: {
    egress: EgressRule[];
  };
  filesystem: {
    read: string[];
    write: string[];
  };
  env_vars: {
    required: string[];
    optional: string[];
  };
}

export type RiskLevel = "low" | "medium" | "high";

/** Controls container network access. "none" blocks all; "allowlist" permits manifest-declared domains. */
export type EgressMode = "none" | "allowlist";

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: string[];
  journeyStages: string[];
  permissions: SkillPermissions;
  risk_level: RiskLevel;
}

// --- Execution types ---

export interface ExecutionConfig {
  /** Memory limit in MB (default: 256) */
  memoryMb?: number;
  /** CPU limit as fraction (default: 0.5) */
  cpus?: number;
  /** Timeout in seconds (default: 30) */
  timeoutSeconds?: number;
  /** Docker image prefix (default: "travel-aw-skill-") */
  imagePrefix?: string;
  /** Environment variables to inject into the container */
  envVars?: Record<string, string>;
  /** Egress mode: "none" blocks all network, "allowlist" uses manifest egress rules (default: "allowlist") */
  egressMode?: EgressMode;
}

export interface SkillInput {
  /** The skill to execute (path to skill directory) */
  skillDir: string;
  /** JSON-serializable input data passed to the skill via stdin */
  data: Record<string, unknown>;
}

export interface SkillOutput {
  /** Whether the skill executed successfully */
  success: boolean;
  /** Parsed JSON output from the skill */
  data: Record<string, unknown>;
  /** Execution metadata */
  metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
  /** Skill name from manifest */
  skillName: string;
  /** Skill version from manifest */
  skillVersion: string;
  /** Container ID (truncated) */
  containerId: string;
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Container exit code */
  exitCode: number;
}

export interface SkillRunner {
  /** Execute a skill in a Docker container */
  execute(input: SkillInput, config?: ExecutionConfig): Promise<SkillOutput>;
}
