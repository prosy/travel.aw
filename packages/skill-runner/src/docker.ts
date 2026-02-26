import { spawn } from "node:child_process";
import { v4 as uuidv4 } from "uuid";
import {
  ContainerError,
  ContainerTimeoutError,
  ConfigError,
  ImageBuildError,
} from "./errors.js";
import {
  createNetwork,
  resolveEgressDomains,
  buildNetworkArgs,
  type NetworkHandle,
} from "./network.js";
import { parseSkillOutput } from "./output-parser.js";
import type {
  EgressMode,
  ExecutionConfig,
  ExecutionMetadata,
  SkillManifest,
  SkillOutput,
} from "./types.js";

const DEFAULT_MEMORY_MB = 256;
const DEFAULT_CPUS = 0.5;
const DEFAULT_TIMEOUT_SECONDS = 30;
const DEFAULT_IMAGE_PREFIX = "travel-aw-skill-";

interface ResolvedConfig {
  memoryMb: number;
  cpus: number;
  timeoutSeconds: number;
  imagePrefix: string;
  envVars: Record<string, string>;
  egressMode: EgressMode;
}

function resolveConfig(config?: ExecutionConfig): ResolvedConfig {
  return {
    memoryMb: config?.memoryMb ?? DEFAULT_MEMORY_MB,
    cpus: config?.cpus ?? DEFAULT_CPUS,
    timeoutSeconds: config?.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS,
    imagePrefix: config?.imagePrefix ?? DEFAULT_IMAGE_PREFIX,
    envVars: config?.envVars ?? {},
    egressMode: config?.egressMode ?? "allowlist",
  };
}

/**
 * Validate that all required env vars from the manifest are provided.
 */
export function validateEnvVars(
  manifest: SkillManifest,
  provided: Record<string, string>,
): void {
  const missing = manifest.permissions.env_vars.required.filter(
    (v) => !(v in provided),
  );
  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

/**
 * Get the Docker image name for a skill.
 */
export function imageName(
  manifest: SkillManifest,
  prefix: string,
): string {
  return `${prefix}${manifest.name}:${manifest.version}`;
}

/**
 * Check if a Docker image exists locally.
 */
export async function imageExists(image: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("docker", ["image", "inspect", image], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

/**
 * Build a Docker image from a skill directory.
 */
export async function buildImage(
  skillDir: string,
  image: string,
  skillName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("docker", ["build", "-t", image, skillDir], {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new ImageBuildError(
            `Docker build failed for "${skillName}" (exit ${code}): ${stderr.slice(0, 500)}`,
            skillName,
          ),
        );
      }
    });

    proc.on("error", (err) => {
      reject(
        new ImageBuildError(
          `Failed to spawn docker build: ${err.message}`,
          skillName,
        ),
      );
    });
  });
}

/**
 * Run a skill in a Docker container and return parsed output.
 *
 * Network behavior:
 * - egressMode "none" OR empty manifest egress: --network=none (offline)
 * - egressMode "allowlist" with declared egress: temporary bridge network
 *   with DNS-based domain allowlisting (--add-host + --dns=127.0.0.1)
 */
export async function runContainer(
  manifest: SkillManifest,
  inputData: Record<string, unknown>,
  skillDir: string,
  config?: ExecutionConfig,
): Promise<SkillOutput> {
  const cfg = resolveConfig(config);

  // Validate env vars before spawning
  validateEnvVars(manifest, cfg.envVars);

  const image = imageName(manifest, cfg.imagePrefix);

  // Auto-build if image doesn't exist
  if (!(await imageExists(image))) {
    await buildImage(skillDir, image, manifest.name);
  }

  // Set up network: allowlist (with egress domains) or none (offline)
  const hasEgress =
    cfg.egressMode === "allowlist" &&
    manifest.permissions.network.egress.length > 0;

  let networkHandle: NetworkHandle | null = null;
  let networkArgs: string[];

  if (hasEgress) {
    networkHandle = await createNetwork(manifest.name);
    const resolved = await resolveEgressDomains(
      manifest.permissions.network.egress,
    );
    networkArgs = buildNetworkArgs(networkHandle.networkName, resolved);
  } else {
    networkArgs = buildNetworkArgs(null, []);
  }

  const shortId = uuidv4().slice(0, 8);
  const containerName = `skill-${manifest.name}-${shortId}`;

  try {
    return await spawnContainer(
      containerName,
      image,
      networkArgs,
      cfg,
      manifest,
      inputData,
    );
  } finally {
    if (networkHandle) {
      await networkHandle.destroy();
    }
  }
}

/**
 * Spawn the Docker container and handle I/O, timeout, and parsing.
 */
function spawnContainer(
  containerName: string,
  image: string,
  networkArgs: string[],
  cfg: ResolvedConfig,
  manifest: SkillManifest,
  inputData: Record<string, unknown>,
): Promise<SkillOutput> {
  const args = [
    "run",
    "--rm",
    "-i",
    `--name=${containerName}`,
    ...networkArgs,
    `--memory=${cfg.memoryMb}m`,
    `--cpus=${cfg.cpus}`,
    "--security-opt=no-new-privileges",
    "--read-only",
    "--tmpfs=/tmp:rw,noexec,nosuid,size=64m",
  ];

  // Inject env vars
  for (const [key, val] of Object.entries(cfg.envVars)) {
    args.push("-e", `${key}=${val}`);
  }

  args.push(image);

  const startTime = Date.now();

  return new Promise<SkillOutput>((resolve, reject) => {
    const proc = spawn("docker", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    // Timeout handler
    const timer = setTimeout(() => {
      killed = true;
      const killProc = spawn("docker", ["kill", containerName], {
        stdio: "ignore",
      });
      killProc.on("close", () => {
        spawn("docker", ["rm", "-f", containerName], {
          stdio: "ignore",
        });
      });
    }, cfg.timeoutSeconds * 1000);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    // Write input to stdin and close
    proc.stdin.write(JSON.stringify(inputData));
    proc.stdin.end();

    proc.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;

      if (killed) {
        reject(new ContainerTimeoutError(cfg.timeoutSeconds, containerName));
        return;
      }

      if (code !== 0) {
        reject(
          new ContainerError(
            `Container "${containerName}" exited with code ${code}`,
            code ?? undefined,
          ),
        );
        return;
      }

      try {
        const data = parseSkillOutput(stdout);
        const metadata: ExecutionMetadata = {
          skillName: manifest.name,
          skillVersion: manifest.version,
          containerId: containerName,
          durationMs,
          exitCode: code ?? 0,
        };

        resolve({ success: true, data, metadata });
      } catch (err) {
        reject(err);
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(
        new ContainerError(`Failed to spawn container: ${err.message}`),
      );
    });
  });
}
