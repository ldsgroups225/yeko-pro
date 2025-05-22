import { Badge } from '@/components/ui/badge'

export function GradeBadge({ grade }: { grade: number }) {
  const getBadgeClass = () => {
    if (grade >= 16)
      return 'bg-green-500/10'
    if (grade >= 14)
      return 'bg-blue-500/10'
    if (grade >= 12)
      return 'bg-yellow-500/10'
    return 'bg-red-500/10'
  }

  return (
    <Badge variant="outline" className={getBadgeClass()}>
      {grade.toFixed(2).endsWith('.00') ? grade : grade.toFixed(2)}
    </Badge>
  )
}
