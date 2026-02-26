import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { createSkillRunner } from "../src/index.js";
import { ContainerTimeoutError, OutputParseError } from "../src/errors.js";

const FIXTURES = join(__dirname, "..", "test-fixtures");

describe("createSkillRunner end-to-end", () => {
  const runner = createSkillRunner({
    imagePrefix: "travel-aw-skill-",
  });

  it("executes echo-skill and returns structured output", async () => {
    const result = await runner.execute({
      skillDir: join(FIXTURES, "echo-skill"),
      data: { query: "best flights to Tokyo", budget: 1500 },
    });

    expect(result.success).toBe(true);
    expect(result.data.echo).toEqual({
      query: "best flights to Tokyo",
      budget: 1500,
    });
    expect(result.data.skill).toBe("echo-skill");
    expect(result.metadata.skillName).toBe("echo-skill");
    expect(result.metadata.skillVersion).toBe("0.1.0");
    expect(result.metadata.durationMs).toBeGreaterThan(0);
  });

  it("times out on timeout-skill", async () => {
    await expect(
      runner.execute(
        {
          skillDir: join(FIXTURES, "timeout-skill"),
          data: {},
        },
        { timeoutSeconds: 3 },
      ),
    ).rejects.toThrow(ContainerTimeoutError);
  }, 15_000);

  it("handles complex nested input", async () => {
    const complexInput = {
      travelers: [
        { name: "Alice", preferences: { class: "business" } },
        { name: "Bob", preferences: { class: "economy" } },
      ],
      dates: { departure: "2026-03-15", return: "2026-03-22" },
      metadata: { source: "test", nested: { deep: true } },
    };

    const result = await runner.execute({
      skillDir: join(FIXTURES, "echo-skill"),
      data: complexInput,
    });

    expect(result.success).toBe(true);
    expect(result.data.echo).toEqual(complexInput);
  });

  it("no raw Docker output leaks into SkillOutput", async () => {
    const result = await runner.execute({
      skillDir: join(FIXTURES, "echo-skill"),
      data: { test: true },
    });

    // The output should only contain the parsed JSON from between markers
    // No Docker debug output, no stderr content
    expect(result.data).toHaveProperty("echo");
    expect(result.data).toHaveProperty("skill");
    expect(Object.keys(result.data)).toEqual(["echo", "skill"]);
  });
});
