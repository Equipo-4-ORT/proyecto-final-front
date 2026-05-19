import StatusBadge from './StatusBadge'
import ActivitiesTable from './ActivitiesTable'

function ReportView({
  activities,
  setActivities,
  defaultActivityHours,
  readOnly = false,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <div>
    <div className="flex items-center gap-3">
      <h2 className="text-2xl font-bold text-slate-800">
        Reporte diario
      </h2>

      <StatusBadge status="pending" />
    </div>

    <p className="text-slate-500 mt-1">
      Actividades registradas del día.
    </p>
  </div>
</div>

      <ActivitiesTable
        activities={activities}
        setActivities={setActivities}
        defaultActivityHours={defaultActivityHours}
        readOnly={readOnly}
      />
    </div>
  )
}

export default ReportView