// Callouts (Alerts, Notes, Warning,Danger, Success, Info)
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";

import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    XOctagon,
} from 'lucide-react'

type CalloutType = "alert" | "note" | "warning" | "danger" | "success" | "info";

type CalloutProps = {
    type: CalloutType;
} & React.HTMLAttributes<HTMLDivElement>;

function getIcon(type: CalloutType) {
    switch (type) {
        case "alert":
            return AlertCircle
        case "note":
            return Info
        case "warning":
            return AlertTriangle
        case "danger":
            return XOctagon
        case "success":
            return CheckCircle
        case "info":
            return Info
        default:
            return XCircle
    }
}

const alertVariants = cva("rounded-lg p-2", {
    variants: {
        type: {
            alert: "bg-blue-100 border-blue-500 [&>p]:text-blue-700 [&>span]:text-blue-500",
            note: "bg-blue-100 border-blue-500 [&>p]:text-blue-700 [&>span]:text-blue-500",
            warning: "bg-yellow-100 border-yellow-500 [&>p]:text-yellow-700 [&>span]:text-yellow-500",
            danger: "bg-red-100 border-red-500 [&>p]:text-red-700 [&>span]:text-red-500",
            success: "bg-green-100 border-green-500 [&>p]:text-green-700 [&>span]:text-green-500",
            info: "bg-gray-100 border-gray-500 [&>p]:text-gray-700 [&>span]:text-gray-500",
        }
    }
});

const Alert = forwardRef<HTMLDivElement, CalloutProps>(({ className, children, type, ...oprops }, ref) => {
    const Icon = getIcon(type);
    return <div ref={ref} className={cn(alertVariants({ type }), className)} {...oprops}>
        <span>
            {<Icon className="size-4" />}
        </span>
        <p className="">
            {children}
        </p>
    </div>
});
Alert.displayName = "Alert";
