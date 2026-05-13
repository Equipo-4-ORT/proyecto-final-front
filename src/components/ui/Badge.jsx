const badgeColors = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  yellow: "bg-yellow-100 text-yellow-800",
  orange: "bg-orange-100 text-orange-700",
  violet: "bg-violet-100 text-violet-700",
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-700",
}

function Badge({ children, color = "slate" }) {
  const colorClasses = badgeColors[color] || badgeColors.slate

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-medium
        whitespace-nowrap
        ${colorClasses}
      `}
    >
      {children}
    </span>
  )
}

export default Badge