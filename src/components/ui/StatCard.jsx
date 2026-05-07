import Card from "./Card"

const iconColors = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
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
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3 text-slate-900">
            {value}
          </h2>

          <p className="text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        {Icon && (
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              ${selectedColor.bg}
            `}
          >
            <Icon
              size={28}
              className={selectedColor.text}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatCard