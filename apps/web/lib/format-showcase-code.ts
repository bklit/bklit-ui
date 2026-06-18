const INDENT_SIZE = 2;
const TRAILING_WHITESPACE_RE = /\s+$/;
const LEADING_WHITESPACE_RE = /^\s+/;
const LINE_PARTS_RE = /^(\s*)(.*)$/;
const STRING_LITERAL_RE = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
const JSX_SELF_CLOSING_RE = /^<[A-Za-z][\w.-]*(?:\s[^>]*)?\/>\s*$/;
const JSX_CLOSE_TAG_RE = /^<\/[\w.-]+>\s*$/;
const JSX_TAG_START_RE =
  /^<[A-Za-z][\w.-]*(?:\s[\w.-]+(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*\s*$/;
const JSX_PROP_LINE_RE = /^[\w.-]+=/;
const JSX_BOOLEAN_PROP_RE = /^[\w.-]+$/;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function stripStringLiterals(line: string): string {
  return line.replace(STRING_LITERAL_RE, '""');
}

function hasPreservedIndentation(lines: string[]): boolean {
  return lines.some(
    (line) => line.length > 0 && LEADING_WHITESPACE_RE.test(line)
  );
}

function normalizeExistingIndent(lines: string[]): string {
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) {
    return "";
  }

  const minIndent = Math.min(
    ...nonEmpty.map(
      (line) => line.match(LEADING_WHITESPACE_RE)?.[0].length ?? 0
    )
  );

  const dedented = lines.map((line) =>
    line.trim().length === 0 ? "" : line.slice(minIndent)
  );

  const indentSizes = dedented
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(LEADING_WHITESPACE_RE)?.[0].length ?? 0)
    .filter((size) => size > 0);

  const unit =
    indentSizes.length > 0
      ? indentSizes.reduce((acc, size) => gcd(acc, size), indentSizes[0] ?? 2)
      : INDENT_SIZE;

  const indentUnit = unit > 0 && unit % INDENT_SIZE === 0 ? unit : INDENT_SIZE;

  return dedented
    .map((line) => {
      if (line.trim().length === 0) {
        return "";
      }

      const match = line.match(LINE_PARTS_RE);
      if (!match) {
        return line;
      }

      const spaces = match[1] ?? "";
      const content = match[2] ?? "";
      const level = Math.round(spaces.length / indentUnit);
      return " ".repeat(level * INDENT_SIZE) + content;
    })
    .join("\n")
    .trimEnd();
}

function lineStartsCloser(trimmed: string): boolean {
  return (
    trimmed.startsWith("</") ||
    trimmed.startsWith("}") ||
    trimmed.startsWith("]") ||
    trimmed.startsWith(")")
  );
}

function isJsxOpenLine(trimmed: string): boolean {
  return (
    trimmed.startsWith("<") &&
    !trimmed.startsWith("</") &&
    trimmed.endsWith(">") &&
    !trimmed.endsWith("/>")
  );
}

function bracketBalance(trimmed: string): number {
  const stripped = stripStringLiterals(trimmed);
  let balance = 0;

  for (const char of stripped) {
    if (char === "{" || char === "(" || char === "[") {
      balance += 1;
    }
    if (char === "}" || char === ")" || char === "]") {
      balance -= 1;
    }
  }

  return balance;
}

function isAttrContinuationLine(trimmed: string): boolean {
  return JSX_PROP_LINE_RE.test(trimmed) || JSX_BOOLEAN_PROP_RE.test(trimmed);
}

function closesPendingTag(trimmed: string): boolean {
  return (
    trimmed.endsWith("/>") ||
    trimmed === ">" ||
    (trimmed.endsWith(">") && !trimmed.endsWith("/>"))
  );
}

function startsPendingTag(trimmed: string): boolean {
  return (
    JSX_TAG_START_RE.test(trimmed) &&
    !trimmed.endsWith(">") &&
    !trimmed.endsWith("/>")
  );
}

interface IndentLineResult {
  level: number;
  pendingTag: boolean;
}

function applyPendingTagLine(
  trimmed: string,
  level: number,
  output: string[]
): IndentLineResult {
  if (trimmed === ">") {
    output.push(" ".repeat(level * INDENT_SIZE) + trimmed);
    return { level: level + 1, pendingTag: false };
  }

  output.push(" ".repeat((level + 1) * INDENT_SIZE) + trimmed);

  if (closesPendingTag(trimmed)) {
    const nextLevel = isJsxOpenLine(trimmed) ? level + 1 : level;
    return { level: nextLevel, pendingTag: false };
  }

  return {
    level: Math.max(0, level + bracketBalance(trimmed)),
    pendingTag: true,
  };
}

function applyNormalLine(
  trimmed: string,
  level: number,
  output: string[]
): IndentLineResult {
  output.push(" ".repeat(level * INDENT_SIZE) + trimmed);

  if (startsPendingTag(trimmed)) {
    return { level, pendingTag: true };
  }

  if (JSX_SELF_CLOSING_RE.test(trimmed) || JSX_CLOSE_TAG_RE.test(trimmed)) {
    return { level, pendingTag: false };
  }

  if (isJsxOpenLine(trimmed)) {
    return { level: level + 1, pendingTag: false };
  }

  return {
    level: Math.max(0, level + bracketBalance(trimmed)),
    pendingTag: false,
  };
}

/**
 * Re-indent JSX/TSX after MDX strips leading whitespace from template literals.
 */
function indentStrippedCode(code: string): string {
  const lines = code.split("\n");
  let level = 0;
  let pendingTag = false;
  const output: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      output.push("");
      continue;
    }

    if (
      pendingTag &&
      !isAttrContinuationLine(trimmed) &&
      !closesPendingTag(trimmed)
    ) {
      pendingTag = false;
    }

    if (!pendingTag && lineStartsCloser(trimmed)) {
      level = Math.max(0, level - 1);
    }

    const result: IndentLineResult = pendingTag
      ? applyPendingTagLine(trimmed, level, output)
      : applyNormalLine(trimmed, level, output);

    level = result.level;
    pendingTag = result.pendingTag;
  }

  return output.join("\n").trimEnd();
}

/**
 * Normalize docs code snippets to consistent 2-space indentation.
 * MDX attribute template literals lose leading whitespace at compile time,
 * so flat snippets are structurally re-indented before render.
 */
export function formatShowcaseCode(code: string): string {
  const lines = code
    .replace(/\t/g, " ".repeat(INDENT_SIZE))
    .split("\n")
    .map((line) => line.replace(TRAILING_WHITESPACE_RE, ""));

  if (lines.every((line) => line.trim().length === 0)) {
    return "";
  }

  if (hasPreservedIndentation(lines)) {
    return normalizeExistingIndent(lines);
  }

  return indentStrippedCode(lines.join("\n"));
}

/** @alias formatShowcaseCode */
export const formatDocsCode = formatShowcaseCode;
