import { type ChartConfig } from "./chart-container"

export interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    payload: Record<string, any>
  }>
  label?: string
  config?: ChartConfig
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "dot" | "line" | "dashed"
  labelKey?: string
  nameKey?: string
}

export interface ChartTooltipContentProps extends ChartTooltipProps {}

function ChartTooltip({
  content,
  ...props
}: {
  content: React.ReactNode | ((props: ChartTooltipProps) => React.ReactNode)
} & ChartTooltipProps) {
  if (!props.active || !props.payload?.length) {
    return null
  }

  if (typeof content === "function") {
    return content(props)
  }

  return content
}

function ChartTooltipContent({
  active,
  payload,
  label,
  config = {},
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  labelKey,
  nameKey,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && (
        <div className="px-3 py-1.5">
          <div className="text-sm text-muted-foreground">
            {labelKey ? payload[0]?.payload[labelKey] : label}
          </div>
        </div>
      )}
      <div className="px-3 py-1.5">
        {payload.map((item, index) => {
          const color = config[item.name]?.color ?? "var(--chart-1)"
          const name = nameKey
            ? item.payload[nameKey]
            : config[item.name]?.label ?? item.name
          return (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className="h-2 w-2 shrink-0"
                  style={{
                    background: color,
                    borderRadius: indicator === "dot" ? "50%" : "0px",
                    borderBottom:
                      indicator === "dashed"
                        ? `2px dashed ${color}`
                        : indicator === "line"
                        ? `2px solid ${color}`
                        : "none",
                    width: indicator !== "dot" ? "12px" : "8px",
                  }}
                />
              )}
              <div className="flex gap-2">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartTooltip, ChartTooltipContent }
