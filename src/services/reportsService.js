import api from './api'

export async function getReportByDate(date) {
  const response = await api.get(`/api/reports/${date}`)
  return response.data
}

export async function generateReport(data) {
  const response = await api.post('/api/reports/generate', data, {
    timeout: 90000,
  })
  return response.data
}