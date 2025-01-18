import { Badge } from '@/components/ui/badge'

export function AbsenceBadge({ count }: { count: number }) {
  const getBadgeClass = () => {
    if (count > 3)
      return 'bg-red-500/10'
    if (count > 1)
      return 'bg-yellow-500/10'
    return 'bg-green-500/10'
  }

  return (
    <Badge variant="outline" className={getBadgeClass()}>
      {count}
    </Badge>
  )
}
