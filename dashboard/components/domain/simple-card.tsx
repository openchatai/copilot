import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export function SimpleCard({ children, title, description, className }: {
    children: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    className?: string
}) {
    return <Card className={cn("flex flex-col", className)}>
        <CardHeader className="w-full">
            <CardTitle className="text-base font-semibold lg:text-xl lg:font-bold">
                {title}
            </CardTitle>
            {description && <CardDescription>
                {description}
            </CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 w-full">
            {children}
        </CardContent>
    </Card>
}