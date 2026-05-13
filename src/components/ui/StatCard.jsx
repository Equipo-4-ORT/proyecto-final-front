import Card from "./Card"

const iconColors = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    value: "text-slate-900",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    value: "text-slate-900",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    value: "text-slate-900",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    value: "text-slate-900",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    value: "text-red-600",
  },
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const selectedColor = iconColors[color]

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-5 text-center sm:text-left">
        {Icon && (
          <div
            className={`
              w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
              ${selectedColor.bg}
            `}
          >
            <Icon
              size={24}
              className={`sm:w-[34px] sm:h-[34px] ${selectedColor.text}`}
            />
          </div>
        )}

        <div>
          <p className="text-xs sm:text-base text-slate-500 font-medium">
            {title}
          </p>

          <h2 className={`text-2xl sm:text-4xl font-bold mt-1 sm:mt-2 ${selectedColor.value}`}>
            {value}
          </h2>

          <p className="text-xs sm:text-base text-slate-500 mt-1 sm:mt-2 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default StatCard