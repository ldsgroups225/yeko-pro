import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { sidebarItems } from '@/constants'
import { Slash } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export function BreadcrumbNav() {
  const pathname = usePathname()

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.replace(/\/$/, '').split('/').filter(Boolean)
    const breadcrumbs = [{
      href: '/t/home',
      label: 'Accueil',
    }]

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const matchingRoute = sidebarItems.find(item => item.href === currentPath)

      if (matchingRoute) {
        breadcrumbs.push({
          href: matchingRoute.href,
          label: matchingRoute.label,
        })
      }
    //   THIS IS `/T` path
    //   else {
    //     breadcrumbs.push({
    //       href: currentPath,
    //       label: segment.charAt(0).toUpperCase() + segment.slice(1),
    //     })
    //   }
    })
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1
                ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )
                : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <Slash className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
