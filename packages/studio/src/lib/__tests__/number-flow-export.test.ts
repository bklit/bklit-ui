import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getNumberFlowDisplayText,
  isNumberFlowElement,
} from "../svg-export/number-flow-export";

describe("number-flow-export", () => {
  it("detects number-flow custom element tags", () => {
    assert.equal(
      isNumberFlowElement({ tagName: "NUMBER-FLOW-REACT" } as HTMLElement),
      true
    );
    assert.equal(
      isNumberFlowElement({ tagName: "number-flow" } as HTMLElement),
      true
    );
    assert.equal(
      isNumberFlowElement({ tagName: "SPAN" } as HTMLElement),
      false
    );
  });

  it("reads formatted values from NumberFlow data", () => {
    const element = {
      tagName: "NUMBER-FLOW-REACT",
      _data: { valueAsString: "11,050" },
      textContent: "",
      shadowRoot: null,
    } as unknown as HTMLElement;

    assert.equal(getNumberFlowDisplayText(element), "11,050");
  });
});
