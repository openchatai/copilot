import React from "react";
import ConfigDataProvider, {
  ConfigDataContextType,
} from "./contexts/ConfigData";
import WidgetState from "./contexts/WidgetState";
import { AxiosProvider } from "./contexts/axiosInstance";
import { InitialDataProvider } from "./contexts/InitialDataContext";

function Root({
  children,
  options,
}: {
  children: React.ReactNode;
  options: ConfigDataContextType;
}) {
  return (
    <React.Fragment>
      <ConfigDataProvider data={options}>
        <WidgetState>
          <AxiosProvider>
            <InitialDataProvider>{children}</InitialDataProvider>
          </AxiosProvider>
        </WidgetState>
      </ConfigDataProvider>
    </React.Fragment>
  );
}

export default Root;
