import { CalendarDays, Clock3, TrendingUp, Video } from 'lucide-react'
import StatCard from '../../../components/ui/StatCard'
import { formatDuration } from '../utils/dashboardCalculations'

function DashboardStats({
  totaldisplayedActivities,
  calendarEventCount,
  totalHours,
  productivityPercentage,
  workdayHours,
}) {
  const isOverWorkday = totalHours > workdayHours

  const stats = [
    {
      title: 'Actividades cargadas',
      value: totaldisplayedActivities,
      subtitle: 'Desde todas las fuentes',
      icon: CalendarDays,
      color: 'blue',
    },
    {
      title: 'Eventos de Calendar',
      value: calendarEventCount,
      subtitle: 'Del día seleccionado',
      icon: Video,
      color: 'orange',
    },
    {
      title: 'Total horas trabajadas',
      value: formatDuration(Math.round(totalHours * 60)),
      subtitle: 'Del día seleccionado',
      icon: Clock3,
      color: isOverWorkday ? 'red' : 'purple',
    },
    {
      title: 'Productividad del día',
      value: `${productivityPercentage}%`,
      subtitle: 'Basada en su jornada laboral',
      icon: TrendingUp,
      color: 'green',
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  )
}

export default DashboardStats
