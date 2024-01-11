import { cva } from "class-variance-authority";


export const methodVariants = cva('text-accent uppercase text-xs font-semibold', {
    variants: {
        method: {
            GET: 'bg-green-500',
            POST: 'bg-blue-500',
            PUT: 'bg-yellow-500',
            DELETE: 'bg-red-500',
            PATCH: 'bg-purple-500',
            OPTIONS: 'bg-gray-500',
            HEAD: 'bg-gray-500',
            TRACE: 'bg-gray-500',
            CONNECT: 'bg-gray-500',
        },
        size: {
            tiny: 'px-1 py-0.5 rounded-sm',
            xs: 'px-2 py-1.5 rounded-md',
        }
    }, defaultVariants: {
        size: 'xs',
        method: 'GET'
    }
})