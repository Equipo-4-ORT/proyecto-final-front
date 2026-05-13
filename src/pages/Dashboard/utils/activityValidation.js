export function validateActivity(activityData) {
  const errors = {}

  if (!activityData.source) {
    errors.source = "Seleccioná una fuente"
  }

  if (!activityData.start) {
    errors.start = "Indicá una hora de inicio"
  }

  if (
    activityData.end &&
    activityData.start &&
    activityData.end <= activityData.start
  ) {
    errors.end = "La hora de fin debe ser mayor a la de inicio"
  }

  return errors
}