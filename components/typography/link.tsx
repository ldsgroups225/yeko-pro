import type { LinkProps } from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import NextLink from 'next/link'

export function Link({
  className,
  children,
  ref,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: ReactNode
    ref?: React.Ref<HTMLAnchorElement>
  }) {
  return (
    <NextLink
      ref={ref}
      className={cn(
        'font-medium text-primary underline underline-offset-4 hover:no-underline cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  )
}

// Optional: Add display name for better debugging
Link.displayName = 'StyledLink'
