"use client";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  stackoverflowLight,
  stackoverflowDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { useTheme } from "next-themes";
import { FcCheckmark } from "react-icons/fc";
import { BiCopy } from "react-icons/bi";

function CodeBlock({ code }: { code: string }) {
  const [copied, copyFn] = useCopyToClipboard();
  const { theme } = useTheme();
  const CodeBlockTheme =
    theme === "light" ? stackoverflowLight : stackoverflowDark;
  return (
    <div className="relative w-full max-w-full group/code">
      <button
        onClick={() => copyFn(code)}
        className="absolute right-3 top-4 p-1 rounded-md bg-slate-100 dark:bg-slate-800 opacity-30 group-hover/code:opacity-100 transition-all"
      >
        {copied ? <FcCheckmark /> : <BiCopy />}
      </button>
      <div className="w-full">
        <SyntaxHighlighter
          language="html"
          style={{
            ...CodeBlockTheme,
            hljs: {
              ...CodeBlockTheme["hljs"],
              overflow: "auto",
              padding: "1rem",
              borderRadius: "0.5rem",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeBlock;
