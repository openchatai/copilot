import { type DependencyList, RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./use-IsoMorphicLayoutEffect";

interface IUseIndicator {
    dependancy: DependencyList;
    indicatorRef?: RefObject<HTMLElement>;
    indicatorId?: string;
    containerSelector: string;
    activeElementSelector: string;
    delay?: number;
    onChange?: ({ activeElement, indicator }: {
        activeElement: HTMLDivElement;
        indicator: HTMLElement;
    }) => void;
}
export function useIndicator({
    indicatorRef,
    dependancy,
    activeElementSelector,
    containerSelector,
    onChange,
    delay = 0,
    indicatorId,
}: IUseIndicator) {
    function getIndicator() {
        const indicator = indicatorRef?.current;
        if (indicator) {
            return indicator;
        }
        if (indicatorId) {
            return document.getElementById(indicatorId);
        }
        return null;
    }

    const ChangeIndicator = () => {
        const indicator = getIndicator()
        const chooseWidgetContainer = document.querySelector(
            containerSelector
        ) as HTMLDivElement;

        const activeWidgetItem = chooseWidgetContainer?.querySelector(
            activeElementSelector
        ) as HTMLDivElement;

        if (activeWidgetItem && indicator) {
            onChange?.({ activeElement: activeWidgetItem, indicator });
            const { offsetHeight, offsetLeft, offsetWidth, offsetTop } =
                activeWidgetItem;
            let styles = `--height: ${offsetHeight}px; --left: ${offsetLeft}px; --width: ${offsetWidth}px; --top: ${offsetTop}px;`;
            indicator.setAttribute("style", styles);
        }
    }
    useIsomorphicLayoutEffect(() => {
        console.log(getIndicator())
        ChangeIndicator()
    }, [])

    useIsomorphicLayoutEffect(() => {
        // we want to set optional delay
        setTimeout(ChangeIndicator, delay)
        window.addEventListener("resize", ChangeIndicator);
        return () => {
            window.removeEventListener("resize", ChangeIndicator);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependancy, activeElementSelector]);
}