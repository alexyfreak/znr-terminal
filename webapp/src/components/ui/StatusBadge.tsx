const statusConfig = {
  pending: { label: 'Kutilmoqda', bg: 'bg-zn-warning-bg', text: 'text-zn-warning-text' },
  approved: { label: 'Tasdiqlangan', bg: 'bg-zn-success-bg', text: 'text-zn-success-text' },
  rejected: { label: 'Rad etilgan', bg: 'bg-zn-error-bg', text: 'text-zn-error-text' },
} as const

export default function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const c = statusConfig[status]
  return (
    <span className={`rounded-zn-btn px-3 py-1 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}
