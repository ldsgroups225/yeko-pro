import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/ModeToggle'
import { SchoolYearSelector } from '@/components/SchoolYearSelector'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { sidebarItems } from '@/constants'
import { cn } from '@/lib/utils'
import { BreadcrumbNav } from './BreadcrumbNav'

export function MobileNavbar() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between md:hidden mb-2">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6 text-primary" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  priority
                  src="/logo.png"
                  alt="Logo Yeko"
                  className="size-16"
                  width={64}
                  height={64}
                />
              </div>
              <DrawerTitle className="text-lg font-semibold mb-4">Menu</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <nav className="space-y-2">
                {sidebarItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-center space-x-2">
                <ModeToggle textColor="text-secondary" />
                <SchoolYearSelector onYearChange={() => {}} />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <BreadcrumbNav />
    </div>
  )
}
