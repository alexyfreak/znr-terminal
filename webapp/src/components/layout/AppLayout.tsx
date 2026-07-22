import { type ReactNode } from 'react'
import Sidebar, { type PageKey } from '@/components/ui/Sidebar'
import NavBar from '@/components/ui/NavBar'
import ProfileSwitcher from '@/components/ui/ProfileSwitcher'

interface AppLayoutProps {
  page: PageKey
  onNavigate: (page: PageKey) => void
  children: ReactNode
}

export default function AppLayout({ page, onNavigate, children }: AppLayoutProps) {
  return (
    <div className="sidebar-layout min-h-dvh bg-zn-page">
      <Sidebar active={page} onNavigate={onNavigate} />

      <div className="relative flex flex-col overflow-hidden">
        <header className="flex items-center justify-end border-b border-zn-border bg-[#0C0C0C] px-4 py-2 lg:px-6 lg:py-3">
          <ProfileSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
        <NavBar active={page} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
