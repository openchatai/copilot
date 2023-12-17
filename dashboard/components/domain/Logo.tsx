import Image from 'next/image'
import React from 'react'

export function Logo() {
    return (
        <div className="relative w-20 aspect-square">
            <Image src='/logo.png' alt="" className="" fill />
        </div>
    )
}