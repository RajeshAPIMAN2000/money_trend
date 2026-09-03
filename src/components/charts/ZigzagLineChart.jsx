import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const AXIS_COLOR = '#334155'
const TICK_STYLE = { fontSize: 12, fill: '#64748B' }

export const ZIGZAG_LINE_COLORS = ['#4A90E2', '#F39C12', '#92C44E', '#2563EB', '#DC2626', '#7C3AED', '#0891B2', '#DB2777']

const defaultTooltipFormatter = (value, name) => [value != null ? `${value}%` : '—', name]

export default function ZigzagLineChart({
  data,
  lines = [],
  height = 320,
  xDataKey = 'label',
  yDomain,
  yUnit = '%',
  tooltipFormatter = defaultTooltipFormatter,
  labelFormatter,
  showLegend = true,
  emptyLabel = 'No data available',
}) {
  const hasData = data?.length && lines.some((line) => data.some((row) => row[line.dataKey] != null))

  if (!hasData) {
    return (
      <div className="grid place-items-center text-sm text-slate-500" style={{ height }}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
        <XAxis
          dataKey={xDataKey}
          axisLine={{ stroke: AXIS_COLOR, strokeWidth: 2 }}
          tickLine={{ stroke: AXIS_COLOR }}
          tick={TICK_STYLE}
          dy={8}
        />
        <YAxis
          axisLine={{ stroke: AXIS_COLOR, strokeWidth: 2 }}
          tickLine={{ stroke: AXIS_COLOR }}
          tick={TICK_STYLE}
          domain={yDomain}
          unit={yUnit}
          width={48}
        />
        <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
        {showLegend && <Legend iconType="plainline" wrapperStyle={{ paddingTop: 12 }} />}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="linear"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
