import { tv, type VariantProps } from "tailwind-variants";

export const toastVariants = tv({

    slots: {
        base: "inline-block min-w-80 px-4 py-2 rounded-sm text-sm border dark:!border-none group pointer-events-auto cursor-grab active:cursor-grabbing relative w-full overflow-hidden transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        description: "font-normal",
        title: "font-medium",
        close: "w-4 h-4 top-2 right-2.5 shrink-0 opacity-70 hover:opacity-80",
        icon: "w-4 h-4 shrink-0 fill-current opacity-80 mr-3"
    },
    variants: {
        toastType: {
            toast: {
                base: ""
            },
            notification: {
                base: "!bg-white !border-slate-200",
                title: "text-slate-800",
                description: "text-slate-600 mt-1 text-sm ml-7",
            },
        },
        intent: {
            warning: "bg-amber-100 dark:bg-amber-400/20 border-amber-200 text-amber-600 dark:text-amber-400",
            error: "bg-rose-100 dark:bg-rose-400/20 border-rose-200 text-rose-600 dark:text-rose-400",
            success: "bg-emerald-100 dark:bg-emerald-400/20 border-emerald-200 text-emerald-600 dark:text-emerald-500",
            info: "bg-indigo-100 dark:bg-indigo-400/20 border-indigo-200 text-indigo-500 dark:text-indigo-400",
        }

    },
    defaultVariants: {
        intent: "info",
    },
});


export type ToastVariantsType = VariantProps<typeof toastVariants>;