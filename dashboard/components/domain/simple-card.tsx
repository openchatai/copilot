import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

export function SimpleCard({ children, title, description }: {
    children: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
}) {
    return <Card className="flex flex-col">
        <CardHeader className="w-full">
            <CardTitle>
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