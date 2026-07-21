import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users, School, Activity, TrendingUp, Search, ArrowUpDown,
  ChevronDown, Loader2, UserCheck, Building2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'

interface DashboardData {
  stats: {
    totalSchools: number
    totalUsers: number
    totalTeachers: number
    totalDirectors: number
    weeklyActive: number
    monthlyActive: number
    activeNow: number
  }
  schools: {
    id: string
    name: string
    address: string
    userCount: number
    teacherCount: number
    directorCount: number
    weeklyActive: number
    monthlyActive: number
  }[]
  recentActivity: {
    id: string
    name: string
    schoolId: string
    lastLogin: string
    schoolName: string
  }[]
}

type SortKey = 'name' | 'userCount' | 'weeklyActive' | 'monthlyActive'

export const AdminDashboard = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('userCount')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [schoolDetail, setSchoolDetail] = useState<Record<string, unknown> | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.electronAPI.getAdminDashboard().then(res => {
      if (res.success && res.data) {
        setData(res.data as unknown as DashboardData)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredSchools = useMemo(() => {
    if (!data) return []
    let list = [...data.schools]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      return (a[sortKey] - b[sortKey]) * dir
    })
    return list
  }, [data, search, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key === 'name') }
  }

  const handleSchoolClick = async (id: string) => {
    setSelectedSchool(id)
    setDetailLoading(true)
    setSchoolDetail(null)
    const res = await window.electronAPI.getAdminSchoolDetail(id)
    if (res.success && res.data) setSchoolDetail(res.data as Record<string, unknown>)
    setDetailLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-zn-text-muted" strokeWidth={1.5} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-zn-text-muted">{t('common.error')}</p>
      </div>
    )
  }

  const statCards = [
    { icon: Building2, label: t('admin.totalSchools'), value: data.stats.totalSchools, color: 'text-blue-400' },
    { icon: Users, label: t('admin.totalUsers'), value: data.stats.totalUsers, color: 'text-green-400' },
    { icon: UserCheck, label: t('admin.weeklyActive'), value: data.stats.weeklyActive, color: 'text-purple-400' },
    { icon: Activity, label: t('admin.monthlyActive'), value: data.stats.monthlyActive, color: 'text-orange-400' },
  ]

  const chartData = data.schools
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 15)
    .map(s => ({ name: s.name.length > 18 ? s.name.slice(0, 16) + '…' : s.name, users: s.userCount }))

  if (selectedSchool && schoolDetail) {
    const sd = schoolDetail as {
      school: { id: string; name: string; address: string | null; phone: string | null }
      teachers: { id: string; full_name: string; email: string | null; phone: string | null; subject: string | null; last_login: string | null }[]
      directors: { id: string; full_name: string; email: string | null; phone: string | null; last_login: string | null }[]
    }
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => { setSelectedSchool(null); setSchoolDetail(null) }}
          className="flex items-center gap-1.5 text-xs text-zn-text-muted hover:text-zn-text transition-colors"
        >
          ← {t('common.back')}
        </button>

        <div className="flex items-center gap-3">
          <School className="h-5 w-5 text-zn-text-muted" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-medium text-zn-text">{sd.school.name}</h1>
            {sd.school.address && <p className="text-xs text-zn-text-faint mt-0.5">{sd.school.address}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-zn-modal glass-strong">
            <p className="text-[10px] uppercase tracking-wider text-zn-text-faint mb-1">{t('admin.teachers')}</p>
            <p className="text-2xl font-semibold text-zn-text">{sd.teachers.length}</p>
          </div>
          <div className="p-4 rounded-zn-modal glass-strong">
            <p className="text-[10px] uppercase tracking-wider text-zn-text-faint mb-1">{t('admin.directors')}</p>
            <p className="text-2xl font-semibold text-zn-text">{sd.directors.length}</p>
          </div>
          <div className="p-4 rounded-zn-modal glass-strong">
            <p className="text-[10px] uppercase tracking-wider text-zn-text-faint mb-1">{t('admin.totalUsers')}</p>
            <p className="text-2xl font-semibold text-zn-text">{sd.teachers.length + sd.directors.length}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-zn-text mb-3">{t('admin.teachers')}</h3>
          <div className="overflow-x-auto rounded-zn-modal border border-zn-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zn-elevated text-zn-text-muted text-[10px] uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">{t('auth.fullName')}</th>
                  <th className="text-left px-4 py-2.5 font-medium">{t('auth.subject')}</th>
                  <th className="text-left px-4 py-2.5 font-medium">{t('auth.email')}</th>
                  <th className="text-left px-4 py-2.5 font-medium">{t('auth.phone')}</th>
                  <th className="text-left px-4 py-2.5 font-medium">{t('admin.lastLogin')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zn-border">
                {sd.teachers.map(t => (
                  <tr key={t.id} className="hover:bg-zn-elevated/30 transition-colors">
                    <td className="px-4 py-2.5 text-zn-text">{t.full_name}</td>
                    <td className="px-4 py-2.5 text-zn-text-muted">{t.subject || '—'}</td>
                    <td className="px-4 py-2.5 text-zn-text-muted">{t.email || '—'}</td>
                    <td className="px-4 py-2.5 text-zn-text-muted">{t.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-zn-text-faint">{t.last_login ? new Date(t.last_login).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="p-5 rounded-zn-modal glass-strong"
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`h-4 w-4 ${card.color}`} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-wider text-zn-text-faint">{card.label}</span>
            </div>
            <p className="text-2xl font-semibold text-zn-text tracking-tight">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="col-span-3 p-5 rounded-zn-modal glass-strong">
          <h3 className="text-xs font-medium text-zn-text mb-4">{t('admin.usersBySchool')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#222' }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#181818', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#EDEDED' }}
                />
                <Bar dataKey="users" fill="#EDEDED" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-2 p-5 rounded-zn-modal glass-strong">
          <h3 className="text-xs font-medium text-zn-text mb-4">{t('admin.recentActivity')}</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.recentActivity.slice(0, 20).map(a => (
              <div key={a.id + a.lastLogin!} className="flex items-center gap-2.5 py-1.5 border-b border-zn-border/40 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-zn-text-faint shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-zn-text truncate">{a.name}</p>
                  <p className="text-[9px] text-zn-text-faint truncate">{a.schoolName}</p>
                </div>
                <span className="text-[9px] text-zn-text-faint shrink-0">
                  {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* School Search */}
      <div className="p-5 rounded-zn-modal glass-strong">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-zn-text">{t('admin.schoolsOverview')}</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zn-text-faint" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-48 pl-8 pr-3 py-1.5 text-[11px] bg-zn-elevated rounded-zn-btn border border-zn-border text-zn-text placeholder:text-zn-text-faint outline-none focus:border-zn-text/30 transition-colors"
              />
            </div>
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-zn-btn transition-colors ${
                sortKey === 'name' ? 'bg-zn-elevated text-zn-text' : 'text-zn-text-faint hover:text-zn-text'
              }`}
            >
              {t('templates.order')} <ArrowUpDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-zn-modal border border-zn-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zn-elevated text-zn-text-muted text-[10px] uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">{t('admin.school')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('admin.address')}</th>
                <th className="text-center px-4 py-2.5 font-medium">{t('admin.users')}</th>
                <th className="text-center px-4 py-2.5 font-medium">{t('admin.weeklyActive')}</th>
                <th className="text-center px-4 py-2.5 font-medium">{t('admin.monthlyActive')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zn-border">
              {filteredSchools.map(s => (
                <tr
                  key={s.id}
                  onClick={() => handleSchoolClick(s.id)}
                  className="hover:bg-zn-elevated/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-zn-text font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zn-text-muted">{s.address || '—'}</td>
                  <td className="px-4 py-3 text-center text-zn-text">{s.userCount}</td>
                  <td className="px-4 py-3 text-center text-zn-text">{s.weeklyActive}</td>
                  <td className="px-4 py-3 text-center text-zn-text">{s.monthlyActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
