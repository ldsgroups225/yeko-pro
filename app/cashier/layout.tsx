import { CashierLayoutClient } from './_components/CashierLayoutClient'

interface Props {
  children: React.ReactNode
}

export default async function CashierLayout({ children }: Props) {
  // Authorization is handled by middleware for /cashier routes
  // No need for additional server-side checks that could cause redirect loops

  return (
    <CashierLayoutClient>
      {children}
    </CashierLayoutClient>
  )
}
