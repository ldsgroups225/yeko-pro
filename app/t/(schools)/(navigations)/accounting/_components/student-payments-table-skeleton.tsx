import { nanoid } from 'nanoid'
import { cn } from '@/lib/utils'

export function StudentPaymentsTableSkeleton() {
  const trStyle = 'border-b transition-colors'
  const thStyle = 'h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]'
  const tdStyle = 'p-1 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]'

  return (
    <table className="w-full caption-bottom text-sm text-muted-foreground">
      <thead className="[&_tr]:border-b">
        <tr className={trStyle}>
          <th className={cn(thStyle, 'text-left')}>Nom</th>
          <th className={cn(thStyle, 'text-center w-[90px]')}>Matricule</th>
          <th className={cn(thStyle, 'text-center w-[60px]')}>Classe</th>
          <th className={cn(thStyle, 'text-center w-[150px]')}>Dernier paiement</th>
          <th className={cn(thStyle, 'text-right w-[90px]')}>Reste à payer</th>
          <th className={cn(thStyle, 'text-end w-[70px]')}>Statut</th>
          <th className={cn(thStyle, 'text-end w-[20px]')}></th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {Array.from({ length: 5 }).map(() => (
          <tr key={nanoid()} className={trStyle}>
            <td className={cn(tdStyle, 'text-left')}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            </td>
            <td className={cn(tdStyle, 'text-center w-[90px]')}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mx-auto"></div>
            </td>
            <td className={cn(tdStyle, 'text-center w-[60px]')}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8 mx-auto"></div>
            </td>
            <td className={cn(tdStyle, 'text-center text-sm w-[160px]')}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mx-auto"></div>
            </td>
            <td className={cn(tdStyle, 'text-end w-[90px]')}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 ml-auto"></div>
            </td>
            <td className={cn(tdStyle, 'text-end w-[70px]')}>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 ml-auto"></div>
            </td>
            <td className={cn(tdStyle, 'text-end w-[20px]')}>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
