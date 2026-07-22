import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/hooks/types'
import { UserCheck, Users, Shield, School } from 'lucide-react'

const profileMeta: Record<Profile, { label: string; icon: typeof UserCheck }> = {
  teacher: { label: "O'qituvchi", icon: UserCheck },
  parent: { label: 'Ota-ona', icon: Users },
  director: { label: 'Direktor', icon: Shield },
  admin: { label: 'Admin', icon: School },
}

export default function ProfileSwitcher() {
  const { activeProfile, availableProfiles, setProfile } = useAuth()
  const [open, setOpen] = useState(false)

  if (!activeProfile || availableProfiles.length <= 1) return null

  const current = profileMeta[activeProfile]
  const CurrentIcon = current.icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-medium text-zn-text transition-colors hover:bg-white/6"
      >
        <CurrentIcon size={14} className="text-zn-info-accent" />
        {current.label}
        <div className="h-1.5 w-1.5 rounded-full bg-zn-info-accent" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-white/8 bg-[#0C0C0C] shadow-2xl">
            {availableProfiles.map((profile) => {
              const meta = profileMeta[profile]
              const Icon = meta.icon
              const isActive = profile === activeProfile
              return (
                <button
                  key={profile}
                  onClick={() => { setProfile(profile); setOpen(false) }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/4 ${
                    isActive ? 'bg-white/6 text-zn-text' : 'text-zn-text-muted'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-zn-info-accent' : 'text-zn-text-faint'} />
                  <span className="font-medium">{meta.label}</span>
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-zn-info-accent" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
