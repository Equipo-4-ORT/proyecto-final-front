import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, } from "recharts"
import { formatDuration, } from "../utils/dashboardCalculations"

function TimeDistributionChart({ data, workdayHours }) {
  const chartData = data
    .filter((item) => item.minutes > 0)
    .map((item) => ({
      name: item.label,
      value: item.minutes,
      percentage:
      workdayHours > 0
        ? Math.min(
            Math.round((item.minutes / (workdayHours * 60)) * 100),
            100
          )
        : 0,
      color: item.chartColor,
    }))

  const totalMinutes = chartData.reduce((total, item) => {
    return total + item.value
  }, 0)
  const totalWholeHours = Math.floor(totalMinutes / 60)

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[260px]">
      <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
            >
              {chartData.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                formatDuration(value)
              }
            />
          </PieChart>
        </ResponsiveContainer>

        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            pointer-events-none
          "
        >
          <p className="text-4xl font-bold text-slate-800">
            {totalWholeHours} h
          </p>

          <p className="text-sm text-slate-500">
            horas totales
          </p>
        </div>
      </div>

      <div className="w-full flex-1 space-y-3 sm:space-y-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="font-medium text-slate-700">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <span className="font-semibold text-slate-700 w-14 text-right">
                {item.percentage}%
              </span>

              <span className="text-slate-500 w-24 text-right whitespace-nowrap">
                {formatDuration(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimeDistributionChart