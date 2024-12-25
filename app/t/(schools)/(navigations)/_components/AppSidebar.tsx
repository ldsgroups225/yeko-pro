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
import { sidebarItems } from '@/constants'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserProfile } from './UserProfile'

export function AppSidebar() {
  const currentPath = usePathname()
  const { toggleSidebar, state } = useSidebar()

  const sidebarAnimation = {
    width: state === 'collapsed' ? 80 : 240,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1], // Smooth easing function
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
    <Sidebar collapsible="icon">
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
              {state === 'collapsed' ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {sidebarItems.map(item => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center w-full gap-4 p-2 rounded-md transition-colors',
                            state === 'collapsed' && 'justify-center',
                            currentPath === item.href && 'bg-primary/10',
                          )}
                          aria-label={item.ariaLabel}
                          aria-current={currentPath === item.href ? 'page' : undefined}
                        >
                          <item.icon className="shrink-0" />
                          <AnimatePresence>
                            {state === 'expanded' && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Link>
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
  )
}

export default AppSidebar
