import { useTranslation } from 'react-i18next'
import { FileText, Construction } from 'lucide-react'

export const AdminReports = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-zn-elevated">
        <Construction className="h-6 w-6 text-zn-text-muted" strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-medium text-zn-text">{t('admin.reports')}</h2>
      <p className="text-xs text-zn-text-muted text-center max-w-xs">{t('admin.comingSoon')}</p>
    </div>
  )
}
