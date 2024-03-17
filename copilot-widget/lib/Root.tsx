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
import { get } from "@lib/utils/pkg";
import "../styles/index.css";

const version = get("version");

type RootProps = {
  children: React.ReactNode;
  options: ConfigDataContextType;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
};

function Root({ children, options, containerProps }: RootProps) {
  const { style, ...containerProp } = containerProps || {};

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
