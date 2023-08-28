import React from "react";
import WidgetState from "../contexts/WidgetState";
import { AxiosProvider } from "../contexts/axiosInstance";
import { InitialDataProvider } from "../contexts/InitialDataContext";

import ConfigDataProvider, {
  ConfigDataContextType,
} from "../contexts/ConfigData";

function Root({
  children,
  options,
}: {
  children: React.ReactNode;
  options: ConfigDataContextType;
}) {
  return (
    <ConfigDataProvider data={options}>
      <WidgetState>
        <AxiosProvider>
          <InitialDataProvider>{children}</InitialDataProvider>
        </AxiosProvider>
      </WidgetState>
    </ConfigDataProvider>
  );
}

export default Root;
