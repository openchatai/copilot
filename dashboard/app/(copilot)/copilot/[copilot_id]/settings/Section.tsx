import type { ReactNode } from "react";
import { VariantProps, cva } from "class-variance-authority";

const sectionVariants = cva('block space-y-2', {
    variants: {
        intent: {
            danger: "[&>h2]:text-destructive [&>div]:border-destructive",
            default: "[&>h2]:text-secondary-foreground [&>div]:border-border",
        }
    }

})

export function Section({ children, title, header, ...props }: { children: ReactNode, title?: string, header?: ReactNode } & VariantProps<typeof sectionVariants>) {
    return <section className={sectionVariants(props)}>
        {
            header && <div className="contents">{header}</div>
        }

        {
            (title && !header) && <h2 className="text-base font-bold">{title}</h2>
        }
        <div className={"rounded-lg border bg-white shadow shadow-accent p-5"}>
            {children}
        </div>
    </section>
}
