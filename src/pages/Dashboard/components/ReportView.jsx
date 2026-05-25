import StatusBadge from './StatusBadge'
import ActivitiesTable from './ActivitiesTable'

function getReportStatus(activities) {
  if (activities.length === 0) return 'pending'
  if (activities.every((a) => a.status === 'approved')) return 'approved'
  if (activities.some((a) => a.status === 'review')) return 'review'
  return 'pending'
}

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

            <StatusBadge status={getReportStatus(activities)} />
          </div>

          <p className="mt-1 text-slate-500">
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
