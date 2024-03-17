import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentProps } from "@lib/types";
import { BotMessageWrapper } from "@lib/components";

type Props = ComponentProps<{
  message: string;
}>;

/**
 * The Basic Text component
 */
export function Text({ id, data }: Props) {
  const { message } = data;

  return (
    <BotMessageWrapper id={id}>
      <div className="space-y-2 flex-1">
        <div className=" w-fit">
          <div dir="auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-slate font-medium text-sm prose-sm prose-h1:font-medium prose-h2:font-normal prose-headings:my-1 max-w-full"
            >
              {message}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
