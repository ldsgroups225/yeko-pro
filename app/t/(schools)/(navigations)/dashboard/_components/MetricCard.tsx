import type { IMetricCardProps } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const variantStyles = {
  primary: {
    background: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary',
  },
  destructive: {
    background: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'text-destructive',
  },
  input: {
    background: 'bg-input/10',
    border: 'border-input/20',
    text: 'text-input',
  },
  success: {
    background: 'bg-emerald-50 dark:bg-emerald-900',
    border: 'border-emerald-200 dark:border-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
}

export function MetricCard({ title, icon, variant, children }: IMetricCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={`${styles.background} ${styles.border}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${variant === 'success' ? 'dark:text-white' : styles.text}`}>
            {title}
          </CardTitle>
          <div className={variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' : styles.text}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
