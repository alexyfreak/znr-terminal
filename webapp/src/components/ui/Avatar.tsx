import { type ReactNode } from 'react'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

const statusColors: Record<string, string> = {
  teacher: 'bg-zn-success-text text-black',
  parent: 'bg-zn-info-accent text-black',
  director: 'bg-zn-tag-blue text-black',
  admin: 'bg-zn-tag-green text-black',
}

export default function Avatar({
  name,
  role,
  size = 'md',
  className = '',
}: {
  name: string
  role?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const colorClass = role ? statusColors[role] : 'bg-zn-elevated text-zn-text-muted'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeMap[size]} ${colorClass} ${className}`}
    >
      {initials(name)}
    </div>
  )
}

export function AvatarGroup({ children }: { children: ReactNode }) {
  return <div className="flex -space-x-2">{children}</div>
}

AvatarGroup.displayName = 'AvatarGroup'
