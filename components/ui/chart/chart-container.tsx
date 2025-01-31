import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export type ChartColors = {
  [key: string]: string | { light: string; dark: string }
}

export type ChartConfig = {
  [key: string]: {
    label: string
    icon?: LucideIcon
    color?: string
    theme?: {
      light: string
      dark: string
    }
  }
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  config?: ChartConfig
}

function ChartContainer({
  children,
  config = {},
  className,
  ...props
}: ChartContainerProps) {
  // Create CSS variables for each color
  const style = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    },
    {}
  )

  return (
    <Card
      className={cn("p-4", className)}
      style={style}
      {...props}
    >
      {children}
    </Card>
  )
}

export { ChartContainer }
