"use client"

import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"

export interface SideDrawerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
    width?: "sm" | "md" | "lg" | "xl" | "full"
}

export function SideDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    width = "md",
}: SideDrawerProps) {
    const widthClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg md:max-w-2xl",
        xl: "sm:max-w-xl md:max-w-4xl",
        full: "w-full sm:max-w-full md:max-w-[90vw]",
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={`flex flex-col gap-0 p-0 ${widthClasses[width]}`}>
                <SheetHeader className="px-6 py-4 border-b border-border/40 shrink-0 bg-card">
                    <SheetTitle className="text-xl tracking-tight">{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
                    {children}
                </div>

                {footer && (
                    <SheetFooter className="px-6 py-4 border-t border-border/40 shrink-0 bg-card">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
