import type { StudioUrlState } from "./studio-parsers";

const presets = {
  utcTime: {
    locale: "en-GB",
    options: {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hourCycle: "h23",
    },
  },
  stockholmDate: {
    locale: "sv-SE",
    options: { day: "numeric", month: "short", timeZone: "Europe/Stockholm" },
  },
} satisfies Record<
  string,
  { locale: string; options: Intl.DateTimeFormatOptions }
>;

const formatters = {
  utcTime: new Intl.DateTimeFormat(
    presets.utcTime.locale,
    presets.utcTime.options
  ).format,
  stockholmDate: new Intl.DateTimeFormat(
    presets.stockholmDate.locale,
    presets.stockholmDate.options
  ).format,
};

export function studioXLabelFormatter(
  state: Pick<StudioUrlState, "xLabelFormat">
) {
  return state.xLabelFormat === "default"
    ? undefined
    : formatters[state.xLabelFormat];
}

export function xLabelFormatCodegen(
  state: Pick<StudioUrlState, "xLabelFormat">
): string {
  if (state.xLabelFormat === "default") {
    return "";
  }
  const { locale, options } = presets[state.xLabelFormat];
  return `const formatXLabel = new Intl.DateTimeFormat(${JSON.stringify(locale)}, ${JSON.stringify(options)}).format;\n`;
}

export function xLabelFormatPropCodegen(
  state: Pick<StudioUrlState, "xLabelFormat">
): string {
  return state.xLabelFormat === "default" ? "" : " formatXLabel={formatXLabel}";
}
