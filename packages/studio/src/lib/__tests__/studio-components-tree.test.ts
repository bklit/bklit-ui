import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  flattenStudioComponents,
  studioComponentAncestorIds,
  studioComponentHasChildren,
} from "../studio-components";
import type { StudioComponentDefinition } from "../types";

const tree: StudioComponentDefinition[] = [
  { id: "root", label: "Root", kind: "chart", controlGroups: [] },
  {
    id: "a",
    label: "A",
    parentId: "root",
    kind: "series",
    controlGroups: [],
  },
  {
    id: "b",
    label: "B",
    parentId: "a",
    kind: "series",
    controlGroups: [],
  },
  {
    id: "c",
    label: "C",
    parentId: "root",
    kind: "series",
    controlGroups: [],
  },
];

describe("studio component tree helpers", () => {
  it("detects children", () => {
    assert.equal(studioComponentHasChildren(tree, "root"), true);
    assert.equal(studioComponentHasChildren(tree, "a"), true);
    assert.equal(studioComponentHasChildren(tree, "b"), false);
  });

  it("returns ancestor ids nearest-first", () => {
    assert.deepEqual(studioComponentAncestorIds(tree, "b"), ["a", "root"]);
    assert.deepEqual(studioComponentAncestorIds(tree, "root"), []);
  });

  it("skips descendants of collapsed nodes", () => {
    const flat = flattenStudioComponents(tree, {
      collapsedIds: new Set(["root"]),
    });
    assert.deepEqual(
      flat.map((item) => item.id),
      ["root"]
    );

    const partial = flattenStudioComponents(tree, {
      collapsedIds: new Set(["a"]),
    });
    assert.deepEqual(
      partial.map((item) => item.id),
      ["root", "a", "c"]
    );
  });
});
