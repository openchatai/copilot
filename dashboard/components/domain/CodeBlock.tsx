"use client";
import SyntaxHighlighter from "react-syntax-highlighter";
import { ocean } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/copy-to-clipboard";
import { ExpandCollapse } from "../headless/Collapse";

export function BaseCodeBlock({ code, language = "html" }: { code: string, language?: string }) {
  return (
    <SyntaxHighlighter
      style={ocean}
      language={language}
      wrapLongLines
    >
      {code.trim()}
    </SyntaxHighlighter>
  );
}

function CodeBlock({
  code,
  language = "html",
}: {
  code: string;
  language?: string;
}) {
  const [copied, copyFn] = useCopyToClipboard();
  const CodeBlockTheme = ocean
  return (
    <ExpandCollapse maxHeight={350} className="rounded-lg">
      <div className="group/code relative text-sm h-full">
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
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </ExpandCollapse>
  );
}

export default CodeBlock;
