interface NumberFlowExportElement extends HTMLElement {
  _data?: {
    valueAsString?: string;
  };
}

const NUMBER_FLOW_TAGS = new Set(["number-flow", "number-flow-react"]);

export function isNumberFlowElement(
  element: Element
): element is NumberFlowExportElement {
  return NUMBER_FLOW_TAGS.has(element.tagName.toLowerCase());
}

export function getNumberFlowDisplayText(
  element: NumberFlowExportElement
): string {
  const fromData = element._data?.valueAsString?.trim();
  if (fromData) {
    return fromData;
  }

  const ariaLabel = element.shadowRoot
    ?.querySelector("[role='img']")
    ?.getAttribute("aria-label")
    ?.trim();
  if (ariaLabel) {
    return ariaLabel;
  }

  return element.textContent?.trim() ?? "";
}
