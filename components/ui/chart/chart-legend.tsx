import { type ChartConfig } from "./chart-container"

export interface ChartLegendProps {
  payload?: Array<{
    value: string
    type?: string
    id?: string
    color?: string
  }>
  config?: ChartConfig
  nameKey?: string
}

export interface ChartLegendContentProps extends ChartLegendProps {}

function ChartLegend({
  content,
  ...props
}: {
  content: React.ReactNode | ((props: ChartLegendProps) => React.ReactNode)
} & ChartLegendProps) {
  if (!props.payload?.length) {
    return null
  }

  if (typeof content === "function") {
    return content(props)
  }

  return content
}

function ChartLegendContent({
  payload,
  config = {},
  nameKey,
}: ChartLegendContentProps) {
  if (!payload?.length) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {payload.map((item, index) => {
        const color = config[item.value]?.color ?? item.color ?? "var(--chart-1)"
        const name = nameKey
          ? item.id
          : config[item.value]?.label ?? item.value
        const Icon = config[item.value]?.icon

        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
            />
            <span className="text-sm font-medium">{name}</span>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
        )
      })}
    </div>
  )
}

export { ChartLegend, ChartLegendContent }
