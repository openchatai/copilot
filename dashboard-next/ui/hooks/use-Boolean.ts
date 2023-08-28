import { useMemo, useState } from "react";

export function useBool(initialValue: boolean) {
    const [value, setValue] = useState(initialValue)
    return useMemo(() => (
        {
            value,
            on: () => setValue(true),
            off: () => setValue(false),
            toggle: () => setValue(x => !x)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [])
}