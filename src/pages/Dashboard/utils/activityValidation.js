import { parseTimeToMinutes } from "./dashboardCalculations"

export function validateActivity(activityData) {
  const errors = {}

  if (activityData.source === "") {
    errors.source = "Seleccioná una fuente"
  }

 if (!activityData.start) {
    errors.start = "Indicá una hora de inicio"
  }

  

  return errors
}
