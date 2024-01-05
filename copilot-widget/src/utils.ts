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

function styleTheRoot(root: HTMLElement, styles?: CSSProperties) {
    const prevStyles = { ...root.style, ...styles }
    Object.assign(root.style, prevStyles);
    return root;
}

export function composeRoot(id: string, styles?: CSSProperties) {
    return styleTheRoot(getOrCreateRootById(id), styles);
}