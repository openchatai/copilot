import React from "react";
import ConfigDataProvider, {
  ConfigDataContextType,
} from "./contexts/ConfigData";
import WidgetState from "./contexts/WidgetState";
import { AxiosProvider } from "./contexts/axiosInstance";
import root from "react-shadow";
import css from "../styles/index.css?inline";
import { LanguageProvider } from "./contexts/LocalesProvider";
import { get } from "./utils/pkg";
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
        <LanguageProvider>
          <WidgetState>
            <AxiosProvider>{children}</AxiosProvider>
          </WidgetState>
        </LanguageProvider>
      </ConfigDataProvider>
      <style>{css}</style>
    </root.div>
  );
}

export default Root;
