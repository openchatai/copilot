import React from "react";

export function useCallbackRef<CF extends (...args: any[]) => any>(cb?: CF) {
    const cbRef = React.useRef(cb);
    React.useEffect(() => {
        cbRef.current = cb;
    });
    return React.useMemo((...args) => cbRef.current?.(...args) as CF, [])
}