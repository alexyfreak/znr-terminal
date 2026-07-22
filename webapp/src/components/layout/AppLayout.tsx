import { type ReactNode } from 'react'
import Sidebar, { type PageKey } from '@/components/ui/Sidebar'
import NavBar from '@/components/ui/NavBar'

interface AppLayoutProps {
  page: PageKey
  onNavigate: (page: PageKey) => void
  role: 'parent' | 'sinf_rahbar'
  children: ReactNode
}

export default function AppLayout({ page, onNavigate, role, children }: AppLayoutProps) {
  return (
    <div className="sidebar-layout min-h-dvh bg-zn-page">
      <Sidebar active={page} onNavigate={onNavigate} />

      <div className="relative flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
        <NavBar active={page} onNavigate={onNavigate} role={role} />
      </div>
    </div>
  )
}
