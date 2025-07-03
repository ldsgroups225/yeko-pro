'use client'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { sidebarItems } from '@/constants'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserProfile } from './UserProfile'

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const currentPath = usePathname()
  const { toggleSidebar, state } = useSidebar()

  const sidebarAnimation = {
    width: state === 'collapsed' ? 80 : 256,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }

  const logoAnimation = {
    width: state === 'collapsed' ? 64 : 96,
    height: state === 'collapsed' ? 64 : 96,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Sidebar collapsible="icon" className={className}>
        <motion.aside
          initial={false}
          animate={sidebarAnimation}
          className="overflow-hidden"
        >
          <aside className="bg-card shadow-md h-screen flex flex-col">
            <div className="p-4 flex flex-col items-center">
              <motion.div
                animate={logoAnimation}
                className="relative"
              >
                <Image
                  priority
                  src="/logo.png"
                  alt="Logo Yeko"
                  className="size-16"
                  width={96}
                  height={96}
                />
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mb-4"
                aria-label={state === 'collapsed' ? 'Réduire le menu' : 'Développer le menu'}
              >
                {state !== 'collapsed' ? <ChevronLeft /> : <ChevronRight />}
              </Button>
            </div>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {sidebarItems.map(item => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          {state === 'collapsed'
                            ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={item.href}
                                      className={cn(
                                        'flex items-center w-full gap-4 p-2 rounded-md transition-colors justify-center',
                                        currentPath === item.href && 'bg-primary/10',
                                      )}
                                      aria-label={item.ariaLabel}
                                      aria-current={currentPath === item.href ? 'page' : undefined}
                                    >
                                      <item.icon className="shrink-0" />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    {item.label}
                                  </TooltipContent>
                                </Tooltip>
                              )
                            : (
                                <Link
                                  href={item.href}
                                  className={cn(
                                    'flex items-center w-full gap-4 p-2 rounded-md transition-colors',
                                    currentPath === item.href && 'bg-primary/10',
                                  )}
                                  aria-label={item.ariaLabel}
                                  aria-current={currentPath === item.href ? 'page' : undefined}
                                >
                                  <item.icon className="shrink-0" />
                                  <AnimatePresence>
                                    <motion.span
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      transition={{ duration: 0.2, delay: 0.1 }}
                                    >
                                      {item.label}
                                    </motion.span>
                                  </AnimatePresence>
                                </Link>
                              )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <UserProfile expanded={state === 'expanded'} />
          </aside>
        </motion.aside>
      </Sidebar>
    </TooltipProvider>
  )
}

export default AppSidebar
