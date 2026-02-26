/**
 * @travel/skill-runner — Ephemeral Docker container execution for travel skills.
 *
 * Public API:
 *   createSkillRunner() → SkillRunner
 */

export { loadManifest } from "./manifest";
export { parseSkillOutput } from "./output-parser";
export { runContainer, imageExists, buildImage, imageName, validateEnvVars } from "./docker";
export { createNetwork, destroyNetwork, resolveEgressDomains, buildNetworkArgs } from "./network";
export type { NetworkHandle, ResolvedEgress } from "./network";
export * from "./types";
export * from "./errors";

import { loadManifest } from "./manifest";
import { runContainer } from "./docker";
import type { ExecutionConfig, SkillInput, SkillOutput, SkillRunner } from "./types";

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
