import {
  useConfigData,
  useLang,
  useMessageHandler,
  useSocket,
} from "@lib/contexts";

export function useSendMessage() {
  const { __handler } = useMessageHandler();
  const { headers, token, queryParams } = useConfigData();
  const { lang } = useLang();
  const socket = useSocket();

  function send(content: string) {
    __handler.handleTextMessage(
      {
        headers: headers ?? {},
        query_params: queryParams ?? {},
        content,
        bot_token: token,
        language: lang,
      },
      socket.__socket
    );
  }

  return {
    send,
  };
}
