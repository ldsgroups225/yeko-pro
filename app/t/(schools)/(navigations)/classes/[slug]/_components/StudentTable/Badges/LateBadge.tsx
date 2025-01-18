import { Badge } from '@/components/ui/badge'

export function LateBadge({ count }: { count: number }) {
  const getBadgeClass = () => {
    if (count > 2)
      return 'bg-red-500/10'
    if (count > 0)
      return 'bg-yellow-500/10'
    return 'bg-green-500/10'
  }

  return (
    <Badge variant="outline" className={getBadgeClass()}>
      {count}
    </Badge>
  )
}
