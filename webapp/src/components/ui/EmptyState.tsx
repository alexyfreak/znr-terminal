import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center animate-fadeIn">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/4">
        {icon || <Inbox size={28} className="text-zn-text-faint" />}
      </div>
      <p className="text-base font-semibold text-zn-text">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-zn-text-muted">{description}</p>}
      {action && (
        <div className="mt-5">
          <Button variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
