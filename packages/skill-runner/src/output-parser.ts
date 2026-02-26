import { OutputParseError } from "./errors.js";

const START_MARKER = "---SKILL_OUTPUT_START---";
const END_MARKER = "---SKILL_OUTPUT_END---";

/**
 * Parse structured output from a skill container's stdout.
 *
 * Skills write JSON between delimiter markers:
 *   ---SKILL_OUTPUT_START---
 *   {"key": "value"}
 *   ---SKILL_OUTPUT_END---
 *
 * Everything outside the markers is ignored (logs, debug output, etc).
 */
export function parseSkillOutput(stdout: string): Record<string, unknown> {
  const startIdx = stdout.indexOf(START_MARKER);
  if (startIdx === -1) {
    throw new OutputParseError(
      "No output start marker found in container stdout. " +
        "Skills must print ---SKILL_OUTPUT_START--- before their JSON output.",
    );
  }

  const endIdx = stdout.indexOf(END_MARKER, startIdx);
  if (endIdx === -1) {
    throw new OutputParseError(
      "No output end marker found in container stdout. " +
        "Skills must print ---SKILL_OUTPUT_END--- after their JSON output.",
    );
  }

  const jsonStr = stdout
    .slice(startIdx + START_MARKER.length, endIdx)
    .trim();

  if (jsonStr.length === 0) {
    throw new OutputParseError(
      "Empty output between markers. Skills must emit valid JSON.",
    );
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new OutputParseError(
        "Skill output must be a JSON object, got " +
          (Array.isArray(parsed) ? "array" : typeof parsed),
      );
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof OutputParseError) throw err;
    throw new OutputParseError(
      `Failed to parse JSON between output markers: ${(err as Error).message}`,
    );
  }
}
