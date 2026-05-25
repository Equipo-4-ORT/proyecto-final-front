import api from "./api"

import { initialActivities } from "../pages/Dashboard/mocks/activities"

export async function getReportByDate(date) {
  try {
    const response = await api.get(`/api/reports/${date}`)

    return response.data
  } catch (error) {
    console.warn(
      "Falling back to mock report data:",
      error.message
    )

    return {
      date,
      activities: initialActivities,
    }
  }
}