'use client';
import React from 'react'
import { useWindowSize } from 'react-use'
import { default as ReactConfetti } from 'react-confetti'
import { useConfetti } from '@/app/_store/confetti';

export default function Confetti() {
    const { width, height } = useWindowSize()
    const { confetti } = useConfetti()
    return (
        confetti ? <ReactConfetti
            width={width}
            height={height}
            numberOfPieces={500}
            recycle={false}
        /> : null
    )
}