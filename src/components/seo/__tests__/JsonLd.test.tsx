import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "../JsonLd";

describe("JsonLd", () => {
  it("renders a parseable application/ld+json script", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ "@context": "https://schema.org", "@type": "Thing", name: "x" }} />);
    expect(html).toContain('type="application/ld+json"');
    const json = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(json).name).toBe("x");
  });

  it("cannot be broken out of by user-supplied text containing </script>", () => {
    const evil = '</script><script>alert(1)</script><!--';
    const html = renderToStaticMarkup(<JsonLd data={{ name: evil }} />);
    // Exactly one opening and one closing tag: the payload's tags were neutralised.
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(json).name).toBe(evil); // data survives intact once parsed
  });
});
