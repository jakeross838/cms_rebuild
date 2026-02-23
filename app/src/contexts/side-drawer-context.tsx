'use client'

import React, { createContext, useContext, useState, type ReactNode } from 'react'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'

interface SideDrawerConfig {
    title?: string
    description?: string
    content: ReactNode | null
    size?: 'default' | 'sm' | 'lg' | 'xl' | 'full'
}

interface SideDrawerContextType {
    openDrawer: (config: SideDrawerConfig) => void
    closeDrawer: () => void
    isOpen: boolean
}

const SideDrawerContext = createContext<SideDrawerContextType | undefined>(undefined)

export function SideDrawerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<SideDrawerConfig>({
        title: '',
        description: '',
        content: null,
        size: 'default',
    })

    const openDrawer = (newConfig: SideDrawerConfig) => {
        setConfig(newConfig)
        setIsOpen(true)
    }

    const closeDrawer = () => {
        setIsOpen(false)
        setTimeout(() => {
            setConfig((prev) => ({ ...prev, content: null }))
        }, 300) // Wait for animation
    }

    const getSizeClass = (size: SideDrawerConfig['size']) => {
        switch (size) {
            case 'sm': return 'sm:max-w-sm'
            case 'lg': return 'sm:max-w-lg md:max-w-xl'
            case 'xl': return 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl'
            case 'full': return 'w-full sm:max-w-full'
            default: return 'sm:max-w-md'
        }
    }

    return (
        <SideDrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen }}>
            {children}
            <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <SheetContent className={`${getSizeClass(config.size)} overflow-y-auto`}>
                    {(config.title || config.description) ? <SheetHeader className="mb-4">
                            {config.title ? <SheetTitle>{config.title}</SheetTitle> : null}
                            {config.description ? <SheetDescription>{config.description}</SheetDescription> : null}
                        </SheetHeader> : null}
                    {config.content}
                </SheetContent>
            </Sheet>
        </SideDrawerContext.Provider>
    )
}

export function useSideDrawer() {
    const context = useContext(SideDrawerContext)
    if (context === undefined) {
        throw new Error('useSideDrawer must be used within a SideDrawerProvider')
    }
    return context
}
