import type { CSSProperties } from "react";
function getOrCreateRootById(id: string): HTMLElement {
    let root = document.getElementById(id);
    if (!root) {
        root = document.createElement('div');
        root.id = id;
        document.body.appendChild(root);
    }
    return root;
}

function styleTheRoot(root: HTMLElement, styles?: CSSProperties): HTMLElement {
    // user may style the root from outside, so we need to preserve it and merge with our styles but our styles should have low priority. 
    Object.assign(root.style, styles);
    return root;
}

export function composeRoot(id: string, fluid?: boolean): HTMLElement {
    const baseStyles: CSSProperties = {
        isolation: 'isolate',
        unicodeBidi: 'bidi-override',
        fontVariantNumeric: 'tabular-nums',
    }

    const fluidStyles: CSSProperties = {
        width: '100%',
        height: '100%',
    }

    const styles = fluid ? { ...baseStyles, ...fluidStyles } : baseStyles;
    return styleTheRoot(getOrCreateRootById(id), styles);
}