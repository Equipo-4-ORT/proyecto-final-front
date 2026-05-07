import AppLayout from "../components/layout/AppLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import StatCard from "../components/ui/StatCard"
import Badge from "../components/ui/Badge"
import {CalendarDays,Video,Clock3,Pencil,Trash2} from "lucide-react"
import TextInput from "../components/ui/TextInput"
import { SOURCES } from "../constants/sources"

//Reemplazar por datos provenientes del backend cuando estén dispo
const sources = [
  { name: "Calendario", count: 4, color: "blue" },
  { name: "Jira", count: 6, color: "green" },
  { name: "Slides", count: 3, color: "amber" },
]

//Reemplazar por datos provenientes del backend cuando estén dispo
const stats = [
  {
    title: "Actividades cargadas",
    value: "13",
    subtitle: "Desde todas las fuentes",
    icon: CalendarDays,
    color: "blue",
  },
  {
    title: "Reuniones de Meet",
    value: "0",
    subtitle: "No configurado",
    icon: Video,
    color: "green",
  },
  {
    title: "Total horas trabajadas",
    value: "7.50 hs",
    subtitle: "Del día seleccionado",
    icon: Clock3,
    color: "purple",
  },
]

//Reemplazar por datos provenientes del backend cuando estén dispo
const activities = [
  {
    id: 1,
    source: "calendar",
    type: "Daily Scrum",
    typeColor: "orange",
    description: "Reunión diaria equipo frontend",
    start: "09:00 AM",
    end: "09:30 AM",
    duration: "0.50",
  },

  {
    id: 2,
    source: "jira",
    type: "Bug Fix",
    typeColor: "violet",
    description: "AUTO-1234 - Corregir login",
    start: "09:30 AM",
    end: "11:00 AM",
    duration: "1.50",
  },

  {
    id: 3,
    source: "docs",
    type: "Documentación",
    typeColor: "blue",
    description: "Actualizar README onboarding",
    start: "11:00 AM",
    end: "11:45 AM",
    duration: "0.75",
  },

  {
    id: 4,
    source: "calendar",
    type: "Refinement",
    typeColor: "orange",
    description: "Refinamiento sprint Q4",
    start: "12:00 PM",
    end: "01:00 PM",
    duration: "1.00",
  },

  {
    id: 5,
    source: "slides",
    type: "Presentación",
    typeColor: "yellow",
    description: "Preparar demo para cliente",
    start: "01:00 PM",
    end: "02:00 PM",
    duration: "1.00",
  },

  {
    id: 6,
    source: "jira",
    type: "Feature",
    typeColor: "violet",
    description: "AUTO-1290 - UI filtros dashboard",
    start: "02:00 PM",
    end: "03:30 PM",
    duration: "1.50",
  },

  {
    id: 7,
    source: "sheets",
    type: "Estimaciones",
    typeColor: "green",
    description: "Carga horas sprint actual",
    start: "03:30 PM",
    end: "04:00 PM",
    duration: "0.50",
  },

  {
    id: 8,
    source: "calendar",
    type: "1:1",
    typeColor: "orange",
    description: "Seguimiento técnico semanal",
    start: "04:00 PM",
    end: "04:30 PM",
    duration: "0.50",
  },

  {
    id: 9,
    source: "jira",
    type: "Code Review",
    typeColor: "violet",
    description: "Revisión PR frontend dashboard",
    start: "04:30 PM",
    end: "05:15 PM",
    duration: "0.75",
  },

  {
    id: 10,
    source: "slides",
    type: "UX Review",
    typeColor: "yellow",
    description: "Correcciones visuales MVP",
    start: "05:15 PM",
    end: "06:00 PM",
    duration: "0.75",
  },

  {
    id: 11,
    source: "sheets",
    type: "Métricas",
    typeColor: "green",
    description: "Actualizar métricas semanales",
    start: "06:00 PM",
    end: "06:30 PM",
    duration: "0.50",
  },

  {
    id: 12,
    source: "jira",
    type: "Testing",
    typeColor: "violet",
    description: "QA flujo carga actividades",
    start: "06:30 PM",
    end: "07:30 PM",
    duration: "1.00",
  },
]

//Reemplazar por datos provenientes del backend cuando estén dispo
const sourceSummary = [
  {
    source: "calendar",
    activities: 4,
    hours: "3.00",
    progress: "w-[65%]",
  },
  {
    source: "jira",
    activities: 6,
    hours: "3.50",
    progress: "w-[75%]",
  },
  {
    source: "slides",
    activities: 3,
    hours: "1.00",
    progress: "w-[30%]",
  },
]

function Dashboard() {
  return (
    <AppLayout>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <TextInput
              type="date"
              defaultValue="2026-10-04"
              className="w-auto"
            />

            <Button>Sincronizar desde Google</Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">Historial</Button>
            <Button variant="success">Descargar Excel</Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Fuentes activas:</span>

          {sources.map((source) => (
            <Badge key={source.name} color={source.color}>
              {source.name} ({source.count})
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Actividades del día
        </h2>

        <p className="text-slate-500 mt-1 mb-5">
          13 actividades • 0 Meet • 4 Calendario • 6 Jira • 3 Slides
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="bg-blue-900 text-white text-sm sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Fuente</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Inicio</th>
                <th className="text-left px-4 py-3">Fin</th>
                <th className="text-left px-4 py-3">Duración hs</th>
                <th className="text-left px-4 py-3">Notas</th>
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => (
                <tr
                key={activity.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-500">{activity.id}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = SOURCES[activity.source].icon
                        return <Icon size={16} className="text-slate-500"/>
                      })()}
                      <Badge color={SOURCES[activity.source].badgeColor}>
                        {SOURCES[activity.source].label}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="max-w-[140px]">
                      <Badge color={activity.typeColor}>
                        {activity.type}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3">{activity.description}</td>
                  <td className="px-4 py-3">{activity.start}</td>
                  <td className="px-4 py-3">{activity.end}</td>
                  <td className="px-4 py-3 font-semibold">{activity.duration}</td>
                  <td className="px-4 py-3 text-slate-400 italic">Notas...</td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                      type="button"
                      className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
                      aria-label="Editar actividad">
                        <Pencil size={16} />
                      </button>
                      <button
                      type="button"
                      className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                      aria-label="Eliminar actividad">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

            <tfoot className="bg-blue-900 text-white">
              <tr>
                <td colSpan="9" className="px-4 py-3 text-right font-semibold">
                  Total horas trabajadas:
                  <span className="ml-2 font-bold">
                    7.50 hs
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-9 gap-2">
            <Button variant="outline" className="col-span-2">
              + Agregar actividad
            </Button>

            <TextInput placeholder="Fuente" />
            <TextInput placeholder="Tipo" />
            <TextInput className="col-span-2" placeholder="Descripción" />
            <TextInput placeholder="Inicio" />
            <TextInput placeholder="Fin" />
            <TextInput placeholder="Notas" />
          </div>
        </div>

      </Card>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Resumen por fuente
        </h3>

        <div className="grid grid-cols-4 gap-4">
          {sourceSummary.map((item) => {
            const source = SOURCES[item.source]
            const Icon = source.icon

            return (
              <Card key={item.source} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon size={20} className="text-slate-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {source.label}
                      </p>

                      <p className="text-sm text-slate-500">
                        {item.activities} actividades
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    {item.hours} hs
                  </p>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.progress} ${
                      item.source === "calendar"
                        ? "bg-blue-600"
                        : item.source === "jira"
                          ? "bg-green-600"
                          : "bg-amber-500"
                    }`}
                  />
                </div>
              </Card>
            )
          })}

          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-slate-800">
                  Total del día
                </p>

                <p className="text-sm text-slate-500">
                  13 actividades
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-800">
                7.50 hs
              </p>
            </div>

            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-900 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard