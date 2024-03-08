import { createRoot } from "react-dom/client";
import type { Options as BaseOptions } from "../lib/types";
import Root from "../lib/Root";
import { CopilotWidget } from "../lib/CopilotWidget";
import { composeRoot } from "./utils";

const defaultRootId = "opencopilot-root";
interface Options extends Omit<BaseOptions, "components"> {
  rootId?: string;
}
declare global {
  interface Window {
    initAiCoPilot: typeof initAiCoPilot;
  }
}
function C_get_current_business_managers_api_lists_businessmanagers_get({
  data,
}: {
  data: {
    Email: "dfilippi@burrburton.org";
    FirstName: "DENNIS";
    LastName: "FILIPPI";
    OrgID: "PA002";
    OrgName: "BURR AND BURTON ACADEMY";
    Phone: "8023621775";
    ServerId: "1";
  }[];
}) {
  return (
    <div className="max-w-full w-full overflow-auto">
      <div>List of Business Managers</div>
      <table className="text-xs whitespace-nowrap">
        <thead>
          <tr className="*:p-0.5 text-start">
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Organization</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="*:p-0.5 text-start">
              <td>{row.FirstName}</td>
              <td>{row.LastName}</td>
              <td>{row.Email}</td>
              <td>{row.Phone}</td>
              <td>{row.OrgName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * @param rootId The id of the root element for more control, you don't need to use this unless you want more control over the widget
 * @description Initialize the widget
 */
function initAiCoPilot({
  triggerSelector,
  containerProps,
  rootId,
  ...options
}: Options) {
  const container = composeRoot(rootId ?? defaultRootId, rootId === undefined);
  createRoot(container).render(
    <Root
      options={{
        ...options,
        components: [
          {
            key: "get_current_business_managers_api_lists_businessmanagers_get",
            component:
              C_get_current_business_managers_api_lists_businessmanagers_get,
          },
        ],
      }}
      containerProps={containerProps}
    >
      <CopilotWidget triggerSelector={triggerSelector} __isEmbedded />
    </Root>
  );
}

window.initAiCoPilot = initAiCoPilot;
