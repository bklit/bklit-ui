import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validChartSlugs } from "@/chart-slugs";
import { generateStudioCode } from "../codegen";
import {
  generateStudioPrompt,
  studioPromptSettingChanges,
} from "../prompt-gen";
import { studioChartDefaultState } from "../studio-chart-defaults";

describe("generateStudioPrompt", () => {
  it("reports no changed settings for every chart's default state", () => {
    for (const slug of validChartSlugs) {
      assert.deepEqual(
        studioPromptSettingChanges(studioChartDefaultState(slug)),
        [],
        slug
      );
    }
  });

  it("includes install steps, labelled changes and the generated code", () => {
    const state = {
      ...studioChartDefaultState("line-chart"),
      curve: "linear" as const,
    };
    const prompt = generateStudioPrompt(state);

    assert.ok(prompt.includes("npx skills add bklit/bklit-ui"));
    assert.ok(prompt.includes("npx shadcn@latest add @bklit/line-chart"));
    assert.ok(prompt.includes("- Line › Curve: `linear`"));
    assert.ok(prompt.includes(generateStudioCode("line-chart", state).code));
  });

  it("installs profit/loss mode from its own registry item", () => {
    const prompt = generateStudioPrompt(
      studioChartDefaultState("profit-loss-line")
    );
    assert.ok(prompt.includes("@bklit/profit-loss-line"));
  });
});
