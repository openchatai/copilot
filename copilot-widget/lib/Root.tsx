import React from "react";
import ConfigDataProvider, {
  ConfigDataContextType,
} from "./contexts/ConfigData";
import WidgetState from "./contexts/WidgetState";
import { AxiosProvider } from "./contexts/axiosInstance";
import { InitialDataProvider } from "./contexts/InitialDataContext";
import root from 'react-shadow';
import css from '../styles/index.css?inline';

function Root({
  children,
  options,
  containerProps,
}: {
  children: React.ReactNode;
  options: ConfigDataContextType;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}) {
  const { style, id, ...containerProp } = containerProps || {}
  return (
    <root.div {...containerProp} id="copilot-widget" style={{ width: '100%', height: '100%', ...style }}>
      <ConfigDataProvider data={options}>
        <WidgetState>
          <AxiosProvider>
            <InitialDataProvider>{children}</InitialDataProvider>
          </AxiosProvider>
        </WidgetState>
      </ConfigDataProvider>
      <style>
        {css}
      </style>
    </root.div>
  );
}

export default Root;
