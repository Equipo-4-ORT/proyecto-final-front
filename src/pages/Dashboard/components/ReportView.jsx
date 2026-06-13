import ActivitiesTable from './ActivitiesTable'

function ReportView({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  defaultActivityHours,
  readOnly = false,
}) {
  return (
    <div className="space-y-4">
      <ActivitiesTable
        activities={activities}
        onAddActivity={onAddActivity}
        onUpdateActivity={onUpdateActivity}
        onDeleteActivity={onDeleteActivity}
        defaultActivityHours={defaultActivityHours}
        readOnly={readOnly}
      />
    </div>
  )
}

export default ReportView
