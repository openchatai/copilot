import { useEffect, useState } from "react"

type Dir = "rtl" | "ltr"

export function useDocumentDirection() {
    const [direction, setDirection] = useState<Dir>(getComputedStyle(document.body).direction as Dir)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDirection(getComputedStyle(document.body).direction as Dir)
        })
        observer.observe(document.head, { attributes: true })
        return () => observer.disconnect()
    }, [])
    return {
        rtl: direction === "rtl",
        ltr: direction === "ltr",
        direction
    }
}