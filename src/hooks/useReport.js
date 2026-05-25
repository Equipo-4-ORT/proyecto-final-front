import { useQuery } from "@tanstack/react-query"

import { getReportByDate } from "../services/reportsService"

export function useReport(date) {
  return useQuery({
    queryKey: ["report", date],

    queryFn: () => getReportByDate(date),

    enabled: Boolean(date),

    staleTime: 1000 * 60 * 5,
  })
}