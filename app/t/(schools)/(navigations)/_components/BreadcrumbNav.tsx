import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { mergedRoutes } from '@/constants'
import { useClasses } from '@/hooks'
import { Slash } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface IBreadcrumbItem {
  href: string
  label: string
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const { currentClass } = useClasses()

  const generateBreadcrumbs = () => {
    const pathSegments = pathname
      .replace(/\/$/, '')
      .split('/')
      .filter(segment => segment && segment !== 't')

    const breadcrumbs: IBreadcrumbItem[] = [{
      href: '/t/home',
      label: 'Accueil',
    }]

    let currentPath = '/t'

    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`

      // Try to match exact route first
      let matchingRoute = mergedRoutes.find(item => item.href === currentPath)

      // If no exact match, try to match dynamic routes
      if (!matchingRoute) {
        matchingRoute = mergedRoutes.find((item) => {
          const dynamicRoutePattern = item.href.replace(/\[.*?\]/g, '[^/]+')
          const regexp = new RegExp(`^${dynamicRoutePattern}$`)
          return regexp.test(currentPath)
        })

        if (matchingRoute) {
          // Special handling for class details route
          if (currentClass && matchingRoute.href.includes('[slug]')) {
            breadcrumbs.push({
              href: currentPath,
              label: currentClass.name, // Use the actual class name instead of "Détails"
            })
          }
          else {
            breadcrumbs.push({
              href: currentPath,
              label: matchingRoute.label,
            })
          }
          return
        }
      }

      if (matchingRoute) {
        breadcrumbs.push({
          href: matchingRoute.href,
          label: matchingRoute.label,
        })
      }
      else {
        // Handle unknown routes by capitalizing the segment
        breadcrumbs.push({
          href: currentPath,
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
        })
      }
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
