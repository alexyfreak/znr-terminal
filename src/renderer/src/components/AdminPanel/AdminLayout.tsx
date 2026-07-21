import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AdminSidebar } from './AdminSidebar'
import { AdminDashboard } from './AdminDashboard'
import { AdminDatabase } from './AdminDatabase'
import { AdminReports } from './AdminReports'
import { AdminSettings } from './AdminSettings'
import { BugReportModal } from '@renderer/components/BugReport/BugReportModal'

type AdminView = 'dashboard' | 'database' | 'reports' | 'settings'

export const AdminLayout = () => {
  const { t } = useTranslation()
  const [view, setView] = useState<AdminView>('dashboard')

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <AdminDashboard />
      case 'database': return <AdminDatabase />
      case 'reports': return <AdminReports />
      case 'settings': return <AdminSettings />
    }
  }

  return (
    <div className="flex h-screen w-full bg-zn-page text-zn-text overflow-hidden">
      <AdminSidebar currentView={view} onNavigate={setView} />
      <motion.main
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex-1 overflow-y-auto"
      >
        {renderView()}
      </motion.main>
      <BugReportModal />
    </div>
  )
}
