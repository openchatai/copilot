import { useEffect, useState } from "react";



type useTypeWriterOpts = { text: string, every?: number, onFinish?: () => void, shouldStart?: boolean }


export default function useTypeWriter({ text, every, onFinish, shouldStart = true }: useTypeWriterOpts) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isComplete, setIsComplete] = useState(false);
    const timeout = every || 0.00001;

    useEffect(() => {
        if (shouldStart) {
            if (currentIndex < text.length + 1) {
                const timer = setInterval(() => {
                    setDisplayText(text.substring(0, currentIndex + 1));
                    setCurrentIndex((prevIndex) => prevIndex + 1);
                }, timeout);

                return () => {
                    clearInterval(timer);
                };
            } else {
                setIsComplete(true);
                if (typeof onFinish === "function") {
                    onFinish();
                }
            }
        }
    }, [text, currentIndex, timeout, onFinish, shouldStart]);
    return { displayText, isComplete, text }
}