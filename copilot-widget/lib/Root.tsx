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
import root from "react-shadow";
import { get } from "@lib/utils/pkg";
import css from "../styles/index.css?inline";

const version = get("version");

const cssColors = {
  "--opencopilot-primary-clr": "hsl(200 18% 46%)",
  "--opencopilot-accent-clr": "hsl(300, 7%, 97%)",
};

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
    <root.div
      {...containerProp}
      data-version={version}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...cssColors,
        ...style,
      }}
    >
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
      <style>{css}</style>
    </root.div>
  );
}

export default Root;
