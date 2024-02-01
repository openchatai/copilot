import React from "react";
import { ChatScreen } from "./_parts/ChatScreen";

import { ConversationHeader } from "./_parts/ConversationHeader";

export default function Conversations() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden [&_input]:font-semibold">
      <div className="flex flex-1 items-start overflow-auto bg-accent/25">
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
          <ConversationHeader />
          <ChatScreen />
        </div>
      </div>
    </div>
  );
}
