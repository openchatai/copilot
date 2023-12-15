import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { NavLink } from "../ui/NavLink";

type LinkItemOptions = {
    type: "link";
    href: string;
    render?: React.ReactNode;
}

type BaseItemOptions = {
    type: "base";
    render?: React.ReactNode;
}

const BaseItem = forwardRef<React.ElementRef<'li'>, React.ComponentPropsWithoutRef<"li"> & BaseItemOptions>(({ className, children, render, ...props }, ref) => {
    return <li ref={ref} {...props} className={cn("px-1 py-0.5 line-clamp-1 rounded-md hover:bg-accent", className)}>
        {children ?? render}
    </li>;
});

BaseItem.displayName = "BreadCrumbItem";

const LinkItem = forwardRef<React.ElementRef<typeof NavLink>, React.ComponentPropsWithoutRef<typeof NavLink> & LinkItemOptions>(({ className, render, children, ...props }, ref) => {
    return <NavLink {...props} ref={ref} className={cn("px-1 py-0.5 rounded-md", className)} inactiveClassName="hover:bg-accent" activeClassName="bg-accent">
        {children ?? render}
    </NavLink>
})

LinkItem.displayName = "BreadCrumbLinkItem";


type BreadCrumbType = LinkItemOptions | BaseItemOptions;

interface BreadCrumbsProps extends React.ComponentPropsWithoutRef<"nav"> {
    items: BreadCrumbType[];
}
function renderBreadCrumb(item: BreadCrumbType) {
    switch (item.type) {
        case "link":
            return <LinkItem {...item} />;
        case "base":
            return <BaseItem {...item} />;
    }
}

// add separator in between each item except the last one
export const BreadCrumbs = forwardRef<React.ElementRef<'ul'>, BreadCrumbsProps>(({ items, ...props }, ref) => {
    return <ul ref={ref} {...props} className="flex items-center select-text space-x-0.5 font-semibold text-base text-accent-foreground">
        {items.map((item, index) => {
            return <React.Fragment key={index}>
                {renderBreadCrumb(item)}
                {index < items.length - 1 && <li>/</li>}
            </React.Fragment>;
        })}
    </ul>;
});

BreadCrumbs.displayName = "BreadCrumbs";