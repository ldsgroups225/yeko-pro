import { EducatorLayoutClient } from './_components/EducatorLayoutClient'

interface Props {
  children: React.ReactNode
}

export default async function EducatorLayout({ children }: Props) {
  // Authorization is handled by middleware for /educator routes
  // No need for additional server-side checks that could cause redirect loops

  return (
    <EducatorLayoutClient>
      {children}
    </EducatorLayoutClient>
  )
}
