import Sidebar from './Sidebar'
import Header from './Header'

function AppLayout({
  children,
  user,
  onLogout,
  sourceCounts = {},
  selectedDate,
  onDateChange,
  onExportExcel,
  generatingFrom = null,
  workdayHours,
  defaultActivityHours,
  onWorkdayHoursChange,
  onDefaultActivityHoursChange,
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        sourceCounts={sourceCounts}
        onExportExcel={() => onExportExcel('sidebar')}
        generatingFrom={generatingFrom}
      />

      <div className="min-h-screen flex flex-col md:ml-64">
        <Header
          user={user}
          onLogout={onLogout}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onExportExcel={() => onExportExcel('header')}
          generatingFrom={generatingFrom}
          workdayHours={workdayHours}
          defaultActivityHours={defaultActivityHours}
          onWorkdayHoursChange={onWorkdayHoursChange}
          onDefaultActivityHoursChange={onDefaultActivityHoursChange}
        />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
