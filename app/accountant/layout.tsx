import { AccountantLayoutClient } from './_components/AccountantLayoutClient'

interface Props {
  children: React.ReactNode
}

export default async function AccountantLayout({ children }: Props) {
  // Authorization is handled by middleware for /accountant routes
  // No need for additional server-side checks that could cause redirect loops

  return (
    <AccountantLayoutClient>
      {children}
    </AccountantLayoutClient>
  )
}
