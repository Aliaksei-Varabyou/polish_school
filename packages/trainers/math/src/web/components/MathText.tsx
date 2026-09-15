import katex from "katex";
import { memo } from "react";

type Part = { math: false; text: string } | { math: true; text: string; display: boolean };

/** Splits "text $inline$ text $$display$$" into parts. */
function split(source: string): Part[] {
  const parts: Part[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$|\\\(([\s\S]+?)\\\)/g;
  let last = 0;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    if (m.index > last) parts.push({ math: false, text: source.slice(last, m.index) });
    parts.push({ math: true, text: m[1] ?? m[2] ?? m[3], display: m[1] !== undefined });
    last = m.index + m[0].length;
  }
  if (last < source.length) parts.push({ math: false, text: source.slice(last) });
  return parts;
}

export const MathText = memo(function MathText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`whitespace-pre-line ${className ?? ""}`}>
      {split(text).map((p, i) =>
        p.math ? (
          <span
            key={i}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(p.text, { throwOnError: false, displayMode: p.display, strict: "ignore" }),
            }}
          />
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
});
