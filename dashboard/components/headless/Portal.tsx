'use client';
import { createPortal } from 'react-dom'
import React, { useRef } from 'react'

type Props = {
    selector: string
    children: React.ReactNode
}

export function Portal({ selector, children }: Props) {
    const parent = useRef<HTMLElement | null>(document.querySelector(selector)).current
    if (!parent) {
        return null
    }
    return createPortal(<>{children}</>, parent)
}
