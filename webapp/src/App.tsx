import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Auth from '@/pages/Auth'
import { ParentHome, ParentArizas } from '@/pages/ParentDashboard'
import { TeacherHome, TeacherArizas } from '@/pages/TeacherDashboard'
import Chat from '@/pages/Chat'
import Settings from '@/pages/Settings'
import AppLayout from '@/components/layout/AppLayout'
import type { PageKey } from '@/components/ui/Sidebar'

function AppContent() {
  const { user, isLoading } = useAuth()
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

  const isParent = user.role === 'parent'

  const renderContent = () => {
    switch (page) {
      case 'home':
        return isParent
          ? <ParentHome onNavigate={setPage} />
          : <TeacherHome onNavigate={setPage} />
      case 'arizas':
        return isParent
          ? <ParentArizas />
          : <TeacherArizas />
      case 'chat':
        return <Chat />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <AppLayout page={page} onNavigate={setPage} role={user.role as 'parent' | 'sinf_rahbar'}>
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
