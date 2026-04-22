import type { CSSProperties } from "react";

export function ProgressQuote({ quote }: { quote: string | null }) {
  if (!quote) return null;

  return (
    <p key={quote} style={quoteStyle}>
      “{quote}”
    </p>
  );
}

const quoteStyle = {
  animation: "progressQuoteRise 3000ms ease-out both",
  color: "#cbd5e1",
  fontSize: "0.92rem",
  fontStyle: "italic",
  lineHeight: 1.45,
  margin: "8px 0 0",
} satisfies CSSProperties;
