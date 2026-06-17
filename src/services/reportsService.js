import api from './api'

export async function getReportByDate(date) {
  const response = await api.get('/api/reports', {
    params: {
      from: date,
      to: date
    }
  });

  return response.data;
}

export async function generateReport(data) {
  const response = await api.post('/api/reports/generate', data, {
    // Techo de espera del front. Debe ser mayor que el worst case del back
    // (Gemini: REQUEST_TIMEOUT_MS * MAX_RETRIES + backoff + creación del Sheet)
    // para no abortar antes de que el back termine. Ver gemini.adapter.js.
    timeout: 120000,
  })
  return response.data
}

export async function getHistory(params) {
  const response = await api.get('/api/reports', { params })
  return response.data
}
