// convert hex color to rgb color
// used inside configurations to convert tailwind's hex color to rgb color
export const hexToRGB = (h: string): string => {
    let r = 0
    let g = 0
    let b = 0
    if (h.length === 4) {
        r = parseInt(`0x${h[1]}${h[1]}`)
        g = parseInt(`0x${h[2]}${h[2]}`)
        b = parseInt(`0x${h[3]}${h[3]}`)
    } else if (h.length === 7) {
        r = parseInt(`0x${h[1]}${h[2]}`)
        g = parseInt(`0x${h[3]}${h[4]}`)
        b = parseInt(`0x${h[5]}${h[6]}`)
    }
    return `${+r},${+g},${+b}`
}