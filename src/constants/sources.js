import {
  CalendarDays,
  FileText,
  ListTodo,
  PanelsTopLeft,
  Table2,
} from "lucide-react"

export const SOURCES = {
  calendar: {
    label: "Calendar",
    icon: CalendarDays,
    badgeColor: "orange",
    sidebarColor: "bg-orange-500",
  },

  jira: {
    label: "Jira",
    icon: ListTodo,
    badgeColor: "violet",
    sidebarColor: "bg-violet-600",
  },

  slides: {
    label: "Slides",
    icon: PanelsTopLeft,
    badgeColor: "yellow",
    sidebarColor: "bg-yellow-400",
  },

  docs: {
    label: "Docs",
    icon: FileText,
    badgeColor: "blue",
    sidebarColor: "bg-blue-600",
  },

  sheets: {
    label: "Sheets",
    icon: Table2,
    badgeColor: "green",
    sidebarColor: "bg-green-600",
  },
}