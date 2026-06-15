import {
  CalendarDays,
  HardDrive,
  HelpCircle,
  ListTodo,
} from "lucide-react"

export const UNKNOWN_SOURCE = {
  label: "Desconocida",
  icon: HelpCircle,
  badgeColor: "slate",
  sidebarColor: "bg-slate-400",
  chartColor: "#94a3b8",
}

export function getSource(sourceKey) {
  return SOURCES[sourceKey] || UNKNOWN_SOURCE
}

export const SOURCES = {
  calendar: {
    label: "Calendar",
    icon: CalendarDays,
    badgeColor: "orange",
    sidebarColor: "bg-orange-500",
    chartColor: "#f97316",
  },

  jira: {
    label: "Jira",
    icon: ListTodo,
    badgeColor: "violet",
    sidebarColor: "bg-violet-600",
    chartColor: "#7c3aed",
  },

  drive: {
    label: "Drive",
    icon: HardDrive,
    badgeColor: "blue",
    sidebarColor: "bg-blue-600",
    chartColor: "#2563eb",
  },

  otro: {
    label: "Other",
    icon: HelpCircle,
    badgeColor: "slate",
    sidebarColor: "bg-slate-400",
    chartColor: "#94a3b8",
  },
}
