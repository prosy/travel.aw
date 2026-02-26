/**
 * @travel/skill-runner — Ephemeral Docker container execution for travel skills.
 *
 * Public API:
 *   createSkillRunner() → SkillRunner
 */

export { loadManifest } from "./manifest.js";
export { parseSkillOutput } from "./output-parser.js";
export { runContainer, imageExists, buildImage, imageName, validateEnvVars } from "./docker.js";
export { createNetwork, destroyNetwork, resolveEgressDomains, buildNetworkArgs } from "./network.js";
export type { NetworkHandle, ResolvedEgress } from "./network.js";
export * from "./types.js";
export * from "./errors.js";

import { loadManifest } from "./manifest.js";
import { runContainer } from "./docker.js";
import type { ExecutionConfig, SkillInput, SkillOutput, SkillRunner } from "./types.js";

/**
 * Create a SkillRunner instance with optional default config.
 */
export function createSkillRunner(defaultConfig?: ExecutionConfig): SkillRunner {
  return {
    async execute(
      input: SkillInput,
      config?: ExecutionConfig,
    ): Promise<SkillOutput> {
      const mergedConfig: ExecutionConfig = { ...defaultConfig, ...config };
      const manifest = await loadManifest(input.skillDir);
      return runContainer(manifest, input.data, input.skillDir, mergedConfig);
    },
  };
}
