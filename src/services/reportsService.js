import api from "./api"

export async function getReportByDate(date) {
  const response = await api.get(`/api/reports/${date}`)
  return response.data
}