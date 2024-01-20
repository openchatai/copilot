import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

const methodVariants = cva('text-accent uppercase text-xs font-semibold', {
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
type MethodProps = VariantProps<typeof methodVariants>
const Method = forwardRef<HTMLSpanElement, { method: string, size?: MethodProps['size'] } & React.HTMLAttributes<HTMLSpanElement>>(({ method, size, className, ...props }, ref) => {
    const cs = methodVariants({ method, size } as MethodProps)
    return <span {...props} ref={ref} className={cn(cs, className)} />
})
Method.displayName = 'Method'

export {
    Method,
    methodVariants
}