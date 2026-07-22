import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Auth from '@/pages/Auth'
import ParentDashboard from '@/pages/ParentDashboard'
import TeacherDashboard from '@/pages/TeacherDashboard'
import Chat from '@/pages/Chat'

function AppContent() {
  const { user, isLoading } = useAuth()
  const [inChat, setInChat] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zn-page">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zn-text-faint border-t-zn-text" />
      </div>
    )
  }

  if (inChat) {
    return <Chat onClose={() => setInChat(false)} />
  }

  if (!user) {
    return <Auth />
  }

  if (user.role === 'parent') {
    return <ParentDashboard onOpenChat={() => setInChat(true)} />
  }

  return <TeacherDashboard onOpenChat={() => setInChat(true)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
