import { describe, it, expect } from "vitest";
import { parseSkillOutput } from "../src/output-parser.js";
import { OutputParseError } from "../src/errors.js";

describe("parseSkillOutput", () => {
  it("parses valid output between markers", () => {
    const stdout = [
      "some log line",
      "---SKILL_OUTPUT_START---",
      '{"result": "hello"}',
      "---SKILL_OUTPUT_END---",
      "trailing log",
    ].join("\n");

    const result = parseSkillOutput(stdout);
    expect(result).toEqual({ result: "hello" });
  });

  it("handles output with no surrounding logs", () => {
    const stdout =
      '---SKILL_OUTPUT_START---\n{"key": 42}\n---SKILL_OUTPUT_END---';
    expect(parseSkillOutput(stdout)).toEqual({ key: 42 });
  });

  it("handles multiline JSON", () => {
    const stdout = [
      "---SKILL_OUTPUT_START---",
      "{",
      '  "a": 1,',
      '  "b": [2, 3]',
      "}",
      "---SKILL_OUTPUT_END---",
    ].join("\n");

    expect(parseSkillOutput(stdout)).toEqual({ a: 1, b: [2, 3] });
  });

  it("throws OutputParseError when start marker missing", () => {
    const stdout = '{"result": "hello"}\n---SKILL_OUTPUT_END---';
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("No output start marker");
  });

  it("throws OutputParseError when end marker missing", () => {
    const stdout = '---SKILL_OUTPUT_START---\n{"result": "hello"}';
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("No output end marker");
  });

  it("throws OutputParseError for empty content between markers", () => {
    const stdout = "---SKILL_OUTPUT_START---\n\n---SKILL_OUTPUT_END---";
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("Empty output");
  });

  it("throws OutputParseError for invalid JSON", () => {
    const stdout =
      "---SKILL_OUTPUT_START---\n{not json}\n---SKILL_OUTPUT_END---";
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("Failed to parse JSON");
  });

  it("throws OutputParseError for array output", () => {
    const stdout =
      '---SKILL_OUTPUT_START---\n[1, 2, 3]\n---SKILL_OUTPUT_END---';
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("must be a JSON object");
  });

  it("throws OutputParseError for string output", () => {
    const stdout =
      '---SKILL_OUTPUT_START---\n"just a string"\n---SKILL_OUTPUT_END---';
    expect(() => parseSkillOutput(stdout)).toThrow(OutputParseError);
    expect(() => parseSkillOutput(stdout)).toThrow("must be a JSON object");
  });

  it("uses only the first pair of markers", () => {
    const stdout = [
      "---SKILL_OUTPUT_START---",
      '{"first": true}',
      "---SKILL_OUTPUT_END---",
      "---SKILL_OUTPUT_START---",
      '{"second": true}',
      "---SKILL_OUTPUT_END---",
    ].join("\n");

    expect(parseSkillOutput(stdout)).toEqual({ first: true });
  });
});
