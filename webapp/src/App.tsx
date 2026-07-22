import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Auth from '@/pages/Auth'
import { ParentHome, ParentArizas } from '@/pages/ParentDashboard'
import { TeacherHome, TeacherArizas } from '@/pages/TeacherDashboard'
import DirectorDashboard from '@/pages/DirectorDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Chat from '@/pages/Chat'
import Settings from '@/pages/Settings'
import AppLayout from '@/components/layout/AppLayout'
import type { PageKey } from '@/components/ui/Sidebar'

function AppContent() {
  const { user, activeProfile, isLoading } = useAuth()
  const [page, setPage] = useState<PageKey>('home')

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zn-page">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zn-text-faint border-t-zn-info-accent" />
          <p className="text-xs text-zn-text-faint">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const profile = activeProfile || user.role

  const renderContent = () => {
    switch (page) {
      case 'home':
        switch (profile) {
          case 'parent':
            return <ParentHome onNavigate={setPage} />
          case 'teacher':
            return <TeacherHome onNavigate={setPage} />
          case 'director':
            return <DirectorDashboard onNavigate={setPage} />
          case 'admin':
            return <AdminDashboard />
          default:
            return <TeacherHome onNavigate={setPage} />
        }
      case 'arizas':
        switch (profile) {
          case 'parent':
            return <ParentArizas />
          default:
            return <TeacherArizas />
        }
      case 'chat':
        return <Chat />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <AppLayout page={page} onNavigate={setPage}>
      {renderContent()}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
