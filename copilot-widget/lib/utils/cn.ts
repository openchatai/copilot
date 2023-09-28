import { twMerge } from 'tailwind-merge';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function cn(...classNames: Array<string|undefined|any>): string {
    return twMerge(classNames)
}