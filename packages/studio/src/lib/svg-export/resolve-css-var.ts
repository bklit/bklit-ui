import { CHART_VAR_ALIASES } from "./chart-var-aliases";

const VAR_REFERENCE = /var\(\s*(--[\w-]+)/;
const MAX_RESOLVE_DEPTH = 8;

export function containsCssVar(value: string): boolean {
  return value.includes("var(");
}

export function parseVarName(value: string): string | null {
  const match = VAR_REFERENCE.exec(value.trim());
  return match?.[1] ?? null;
}

/** Parse a single `var(...)` token, including fallbacks with nested parentheses. */
export function parseVarExpression(value: string): {
  name: string;
  fallback: string | null;
} | null {
  const trimmed = value.trim();
  if (!(trimmed.startsWith("var(") && trimmed.endsWith(")"))) {
    return null;
  }

  let depth = 0;
  let commaIndex = -1;
  for (let index = 4; index < trimmed.length - 1; index += 1) {
    const char = trimmed[index];
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    } else if (char === "," && depth === 0) {
      commaIndex = index;
      break;
    }
  }

  if (commaIndex === -1) {
    const name = trimmed.slice(4, -1).trim();
    return name.startsWith("--") ? { name, fallback: null } : null;
  }

  const name = trimmed.slice(4, commaIndex).trim();
  const fallback = trimmed.slice(commaIndex + 1, -1).trim();
  return name.startsWith("--") ? { name, fallback: fallback || null } : null;
}

function getCustomPropertyFromAncestors(
  element: Element,
  name: string,
  aliasDepth = 0
): string {
  if (aliasDepth > MAX_RESOLVE_DEPTH) {
    return "";
  }

  let current: Element | null = element;
  while (current) {
    const inlineValue =
      current instanceof HTMLElement
        ? current.style.getPropertyValue(name).trim()
        : "";
    if (inlineValue) {
      return inlineValue;
    }

    const computedValue = getComputedStyle(current)
      .getPropertyValue(name)
      .trim();
    if (computedValue) {
      return computedValue;
    }

    current = current.parentElement;
  }

  const alias = CHART_VAR_ALIASES[name];
  if (alias) {
    return getCustomPropertyFromAncestors(element, alias, aliasDepth + 1);
  }

  return "";
}

interface ResolveContext {
  element?: Element;
  style: CSSStyleDeclaration;
}

function getCustomProperty(context: ResolveContext, name: string): string {
  if (context.element) {
    return getCustomPropertyFromAncestors(context.element, name);
  }

  return context.style.getPropertyValue(name).trim();
}

function resolveNestedValue(
  context: ResolveContext,
  value: string,
  depth: number
): string {
  return resolveCssVarFromStyle(context.style, value, depth, context.element);
}

function resolveMaybeNested(
  context: ResolveContext,
  value: string,
  depth: number
): string {
  if (containsCssVar(value)) {
    return resolveNestedValue(context, value, depth + 1);
  }

  return value;
}

function resolveVarToken(
  context: ResolveContext,
  parsed: { name: string; fallback: string | null },
  trimmed: string,
  depth: number
): string {
  const resolved = getCustomProperty(context, parsed.name);
  if (resolved) {
    return resolveMaybeNested(context, resolved, depth);
  }

  if (parsed.fallback) {
    return resolveMaybeNested(context, parsed.fallback, depth);
  }

  return trimmed;
}

/**
 * Resolve a CSS color/value that may contain `var(--token)` references.
 * Walks the element's ancestor chain so preset overrides on the Studio frame apply.
 */
export function resolveCssVar(element: Element, value: string): string {
  const trimmed = value.trim();
  if (!containsCssVar(trimmed)) {
    return trimmed;
  }

  return resolveCssVarFromStyle(getComputedStyle(element), trimmed, 0, element);
}

export function resolveCssVarFromStyle(
  style: CSSStyleDeclaration,
  value: string,
  depth = 0,
  element?: Element
): string {
  if (depth > MAX_RESOLVE_DEPTH) {
    return value;
  }

  const trimmed = value.trim();
  if (!containsCssVar(trimmed)) {
    return trimmed;
  }

  const context: ResolveContext = { style, element };

  if (trimmed.startsWith("var(")) {
    const parsed = parseVarExpression(trimmed);
    if (!parsed) {
      return trimmed;
    }

    return resolveVarToken(context, parsed, trimmed, depth);
  }

  return trimmed.replace(/var\([^)]*(?:\([^)]*\)[^)]*)*\)/g, (match) =>
    resolveNestedValue(context, match, depth)
  );
}
