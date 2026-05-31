import Card from "../../../components/ui/Card"
import { formatDuration, } from "../utils/dashboardCalculations"
import TimeDistributionChart from "./TimeDistributionChart"

function SourceSummary({ sourceSummary, workdayHours }) {
  return (
    <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Resumen por fuente
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {sourceSummary.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.key} className="p-4 sm:p-4 shadow-none">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon size={20} className="text-slate-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.label}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.activities} actividades
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    {formatDuration(item.minutes)}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.sidebarColor}`}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 min-h-[260px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Tiempo por aplicación
        </h3>

        <TimeDistributionChart data={sourceSummary} workdayHours={workdayHours}/>
      </Card>
    </div>
  )
}

export default SourceSummary