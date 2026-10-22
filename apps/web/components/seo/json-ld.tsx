const LT_RE = /</g;

/** Renders schema.org structured data as a JSON-LD script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | object[] }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD, `<` escaped
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(LT_RE, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
