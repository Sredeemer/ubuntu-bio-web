import React from "react";

/**
 * Renders a JSON-LD <script>. `<` is escaped so dataset text containing "</script>" or "<!--"
 * cannot break out of the tag (data here comes from user-submitted metadata).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data)
    .split("<")
    .join("\\u003c")
    .split(String.fromCharCode(0x2028))
    .join("\\u2028")
    .split(String.fromCharCode(0x2029))
    .join("\\u2029");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
