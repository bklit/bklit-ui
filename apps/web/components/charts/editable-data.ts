import { isValidElement, type ReactNode } from "react";

/**
 * Opt-in contract for editing an example's data as JSON in the present
 * dialog. When set, the dialog renders `render(data)` with the parsed JSON
 * instead of the example's own `render()`; edits are local to the dialog
 * session. `render` may receive any shape the user typed — the dialog catches
 * render errors and keeps the last good chart.
 */
export interface EditableData {
  data: unknown;
  render: (data: unknown) => ReactNode;
}

/** Typed helper: `render` is written against the example's own data shape. */
export function editableData<T>(spec: {
  data: T;
  render: (data: T) => ReactNode;
}): EditableData {
  return spec as unknown as EditableData;
}

/** ISO dates (what `JSON.stringify` makes of `Date`) come back as `Date`. */
const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:\d{2})?)?$/;

function reviveDates(_key: string, value: unknown) {
  if (typeof value === "string" && ISO_DATE_PATTERN.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

export function stringifyEditableData(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

const POSITION_PATTERN = /position (\d+)/;
const LINE_COLUMN_PATTERN = /line (\d+) column (\d+)/;

export type EditableJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string; line?: number; column?: number };

/** Parses editor JSON (dates revived); errors carry line / column when known. */
export function parseEditableJson(
  text: string,
  { revive = true }: { revive?: boolean } = {}
): EditableJsonResult {
  try {
    return {
      ok: true,
      data: revive ? JSON.parse(text, reviveDates) : JSON.parse(text),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lineColumn = LINE_COLUMN_PATTERN.exec(message);
    if (lineColumn) {
      return {
        ok: false,
        message,
        line: Number(lineColumn[1]),
        column: Number(lineColumn[2]),
      };
    }
    const position = POSITION_PATTERN.exec(message);
    if (position) {
      const lines = text.slice(0, Number(position[1])).split("\n");
      return {
        ok: false,
        message,
        line: lines.length,
        column: (lines.at(-1)?.length ?? 0) + 1,
      };
    }
    return { ok: false, message };
  }
}

/* -------------------------------------------------------------------------- */
/* Generic chart data (registered by chart roots, see `chart-data-override`)  */
/* -------------------------------------------------------------------------- */

const FUNCTION_PLACEHOLDER = "[function]";
const ELEMENT_PLACEHOLDER = "[React element]";

function placeholderFor(value: unknown): string | null {
  if (typeof value === "function") {
    return FUNCTION_PLACEHOLDER;
  }
  if (isValidElement(value)) {
    return ELEMENT_PLACEHOLDER;
  }
  return null;
}

/** Pretty JSON of a chart's data; functions / elements become placeholders. */
export function stringifyChartData(data: unknown): string {
  return (
    JSON.stringify(data, (_key, value) => placeholderFor(value) ?? value, 2) ??
    ""
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Restores what JSON can't carry, using the chart's original data as the
 * template: `Date` fields come back as dates (new rows follow the last
 * original row), placeholders as the original function / element.
 */
export function restoreChartData(value: unknown, template: unknown): unknown {
  if (template instanceof Date) {
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date;
    }
    return value;
  }
  const placeholder = placeholderFor(template);
  if (placeholder) {
    return value === placeholder ? template : value;
  }
  if (Array.isArray(value)) {
    if (!Array.isArray(template)) {
      return value;
    }
    return value.map((item, index) =>
      restoreChartData(item, template[index] ?? template.at(-1))
    );
  }
  if (isPlainObject(value) && isPlainObject(template)) {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = restoreChartData(item, template[key]);
    }
    return next;
  }
  return value;
}

export type ChartDataKind =
  | "array"
  | "object"
  | "number"
  | "string"
  | "boolean"
  | "null";

export function chartDataKind(value: unknown): ChartDataKind | null {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  switch (typeof value) {
    case "object":
      return "object";
    case "number":
    case "string":
    case "boolean":
      return typeof value as ChartDataKind;
    default:
      return null;
  }
}
