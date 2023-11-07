"use client";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  a11yLight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/copy-to-clipboard";

type Theme = "dark" | "light";
const theme: Theme = "light";
function CodeBlock({
  code,
  language = "html",
}: {
  code: string;
  language?: string;
}) {
  const [copied, copyFn] = useCopyToClipboard();
  const CodeBlockTheme = theme === "light" ? a11yDark : a11yLight;
  return (
    <div className="group/code relative text-sm">
      <button
        onClick={() => copyFn(code)}
        className="absolute right-3 top-4 block rounded-lg p-1 text-sm text-white opacity-30 transition-all group-hover/code:opacity-100"
      >
        {copied ? (
          <Check className="stroke-current [font-size:1em]" />
        ) : (
          <Copy className="stroke-current [font-size:1em]" />
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={{
          ...CodeBlockTheme,
          hljs: {
            ...CodeBlockTheme["hljs"],
            display: "block",
            overflowX: "auto",
            padding: "20px 24px",
            color: "#ddd",
            fontFamily: '"Fira Code"',
            fontSize: "14px",
            margin: "0px",
            borderRadius: "0.5rem",
            fontWeight: 500,
          },
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;
