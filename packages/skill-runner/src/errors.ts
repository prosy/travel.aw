/**
 * SkillRunner error hierarchy.
 * All errors extend SkillRunnerError so callers can catch broadly or narrowly.
 */

export class SkillRunnerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "SkillRunnerError";
  }
}

export class ManifestValidationError extends SkillRunnerError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, "MANIFEST_VALIDATION");
    this.name = "ManifestValidationError";
  }
}

export class ContainerError extends SkillRunnerError {
  constructor(
    message: string,
    public readonly exitCode?: number,
  ) {
    super(message, "CONTAINER_ERROR");
    this.name = "ContainerError";
  }
}

export class ContainerTimeoutError extends SkillRunnerError {
  constructor(
    public readonly timeoutSeconds: number,
    public readonly containerName: string,
  ) {
    super(
      `Container "${containerName}" exceeded timeout of ${timeoutSeconds}s`,
      "CONTAINER_TIMEOUT",
    );
    this.name = "ContainerTimeoutError";
  }
}

export class OutputParseError extends SkillRunnerError {
  constructor(message: string) {
    super(message, "OUTPUT_PARSE");
    this.name = "OutputParseError";
  }
}

export class ConfigError extends SkillRunnerError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigError";
  }
}

export class NetworkError extends SkillRunnerError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class DnsResolutionError extends SkillRunnerError {
  constructor(public readonly domain: string) {
    super(
      `Failed to resolve domain "${domain}" — cannot create egress allowlist`,
      "DNS_RESOLUTION",
    );
    this.name = "DnsResolutionError";
  }
}

export class ImageBuildError extends SkillRunnerError {
  constructor(
    message: string,
    public readonly skillName: string,
  ) {
    super(message, "IMAGE_BUILD");
    this.name = "ImageBuildError";
  }
}
