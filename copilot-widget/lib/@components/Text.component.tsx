import { useChatState } from "@lib/contexts/statefulMessageHandler";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  data: {
    message: string;
  };
  id: string;
};

/**
 * The Basic Text component
 */
export function Text(props: Props) {
  const {
    data: { message },
    id,
  } = props;
  const { currentUserMessage, conversationInfo } = useChatState();
  const isTheSameUserMessage =
    currentUserMessage && currentUserMessage.id === id ? true : false;

  return (
    <div className="space-y-2 flex-1">
      <div className=" w-fit">
        <div dir="auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-slate font-medium text-sm prose-sm prose-h1:font-medium prose-h2:font-normal prose-headings:my-1 max-w-full"
          >
            {isTheSameUserMessage && conversationInfo
              ? conversationInfo
              : message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
