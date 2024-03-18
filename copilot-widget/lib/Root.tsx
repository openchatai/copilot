import React from "react";
import {
  ConfigDataProvider,
  AxiosProvider,
  ConfigDataContextType,
  LanguageProvider,
  MessageHandlerProvider,
  SocketProvider,
  WidgetState,
} from "@lib/contexts";
import "../styles/index.css";

type RootProps = {
  children: React.ReactNode;
  options: ConfigDataContextType;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
};

function Root({ children, options }: RootProps) {
  return (
    <ConfigDataProvider data={options}>
      <AxiosProvider>
        <LanguageProvider>
          <WidgetState>
            <SocketProvider>
              <MessageHandlerProvider>{children}</MessageHandlerProvider>
            </SocketProvider>
          </WidgetState>
        </LanguageProvider>
      </AxiosProvider>
    </ConfigDataProvider>
  );
}

export default Root;
