import { useState } from "react";
type STATUS_TYPE = "idle" | "pending" | "rejected" | "resolved";

export function useStatus(initialStatus: STATUS_TYPE = "idle") {
    const [status, setStatus] = useState<
        STATUS_TYPE
    >(initialStatus);
    const is = (st: STATUS_TYPE) => status === st
    return [status, setStatus, is] as const
}
