import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, Plus, Pencil, Trash2, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, AlertCircle, Check, Loader2,
  Database, BookOpen, GraduationCap, Building2, FileType,
  ArrowUpDown, Save
} from 'lucide-react'

type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'json' | 'array' | 'fk'

interface ColumnDef {
  key: string
  type: ColumnType
  editable: boolean
  required?: boolean
  hidden?: boolean
  fkTable?: string
  width?: string
  multiline?: boolean
  placeholder?: string
}

interface TableConfig {
  key: string
  labelKey: string
  icon: React.ElementType
  columns: ColumnDef[]
}

type AdminTable = 'schools' | 'teachers' | 'directors' | 'classes' | 'shablons'

const TABLES: Record<AdminTable, TableConfig> = {
  schools: {
    key: 'schools', labelKey: 'admin.db.schools', icon: Building2,
    columns: [
      { key: 'id', type: 'text', editable: false, hidden: true },
      { key: 'name', type: 'text', editable: true, required: true },
      { key: 'address', type: 'text', editable: true, multiline: true },
      { key: 'phone', type: 'text', editable: true },
      { key: 'director_id', type: 'fk', fkTable: 'directors', editable: true },
      { key: 'created_at', type: 'date', editable: false },
    ],
  },
  teachers: {
    key: 'teachers', labelKey: 'admin.db.teachers', icon: GraduationCap,
    columns: [
      { key: 'id', type: 'text', editable: false, hidden: true },
      { key: 'login_id', type: 'text', editable: false },
      { key: 'full_name', type: 'text', editable: true, required: true },
      { key: 'position', type: 'text', editable: true },
      { key: 'subject', type: 'text', editable: true },
      { key: 'school_id', type: 'fk', fkTable: 'schools', editable: true },
      { key: 'email', type: 'text', editable: true },
      { key: 'phone', type: 'text', editable: true },
      { key: 'age', type: 'number', editable: true },
      { key: 'last_login', type: 'date', editable: false },
      { key: 'created_at', type: 'date', editable: false },
    ],
  },
  directors: {
    key: 'directors', labelKey: 'admin.db.directors', icon: BookOpen,
    columns: [
      { key: 'id', type: 'text', editable: false, hidden: true },
      { key: 'login_id', type: 'text', editable: false },
      { key: 'full_name', type: 'text', editable: true, required: true },
      { key: 'position', type: 'text', editable: true },
      { key: 'school_id', type: 'fk', fkTable: 'schools', editable: true },
      { key: 'email', type: 'text', editable: true },
      { key: 'phone', type: 'text', editable: true },
      { key: 'last_login', type: 'date', editable: false },
      { key: 'created_at', type: 'date', editable: false },
    ],
  },
  classes: {
    key: 'classes', labelKey: 'admin.db.classes', icon: Database,
    columns: [
      { key: 'id', type: 'text', editable: false, hidden: true },
      { key: 'name', type: 'text', editable: true, required: true },
      { key: 'school_id', type: 'fk', fkTable: 'schools', editable: true },
      { key: 'form_teacher_id', type: 'fk', fkTable: 'teachers', editable: true },
      { key: 'academic_year', type: 'text', editable: true },
    ],
  },
  shablons: {
    key: 'shablons', labelKey: 'admin.db.shablons', icon: FileType,
    columns: [
      { key: 'id', type: 'text', editable: false, hidden: true },
      { key: 'type', type: 'text', editable: true, required: true },
      { key: 'label', type: 'text', editable: true, required: true },
      { key: 'description', type: 'text', editable: true, multiline: true },
      { key: 'category', type: 'text', editable: true },
      { key: 'teacher_visible', type: 'boolean', editable: true },
      { key: 'published', type: 'boolean', editable: true },
      { key: 'version', type: 'number', editable: true },
      { key: 'keywords', type: 'array', editable: true },
      { key: 'fields', type: 'json', editable: true, multiline: true },
      { key: 'steps', type: 'json', editable: true, multiline: true },
      { key: 'schema', type: 'json', editable: true, multiline: true },
      { key: 'template', type: 'text', editable: true, multiline: true },
      { key: 'author_id', type: 'text', editable: true },
      { key: 'created_at', type: 'date', editable: false },
      { key: 'updated_at', type: 'date', editable: false },
    ],
  },
}

const PAGE_SIZES = [10, 25, 50, 100]

function formatCellValue(value: unknown, type: ColumnType): string {
  if (value === null || value === undefined) return '—'
  switch (type) {
    case 'date': {
      if (typeof value !== 'string') return String(value)
      try { return new Date(value).toLocaleString() } catch { return value }
    }
    case 'boolean':
      return value ? '✓' : '—'
    case 'json':
    case 'array':
      if (typeof value === 'string') {
        try { return JSON.stringify(JSON.parse(value), null, 1) } catch { return value }
      }
      return JSON.stringify(value, null, 1)
    default:
      return String(value)
  }
}

function isJsonType(t: ColumnType): boolean {
  return t === 'json' || t === 'array'
}

function getTableKey(t: string): AdminTable {
  if (TABLES[t as AdminTable]) return t as AdminTable
  return 'schools'
}

const REFERENCE_TABLES = ['schools', 'teachers', 'directors'] as const

export const AdminDatabase = () => {
  const { t } = useTranslation()

  const [activeTable, setActiveTable] = useState<AdminTable>('schools')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)

  const [refData, setRefData] = useState<Record<string, Record<string, unknown>[]>>({})

  const [modalMode, setModalMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const tableConfig = TABLES[activeTable]

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  useEffect(() => {
    setSearch('')
    setDebouncedSearch('')
    setSortColumn(null)
    setSortDir('desc')
    setPage(0)
    setError(null)
  }, [activeTable])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await window.electronAPI.adminListTable({
        table: activeTable,
        search: debouncedSearch || undefined,
        orderColumn: sortColumn || undefined,
        orderDirection: sortDir,
        limit: pageSize,
        offset: page * pageSize,
      })
      if (!res.success) throw new Error(res.error || 'Failed to fetch')
      setRows(res.data?.rows || [])
      setTotalCount(res.data?.count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setRows([])
    }
    setLoading(false)
  }, [activeTable, debouncedSearch, sortColumn, sortDir, page, pageSize])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const refLoaded = useRef<Set<string>>(new Set())
  useEffect(() => {
    const tablesNeeded = new Set<string>()
    tableConfig.columns.forEach(c => {
      if (c.type === 'fk' && c.fkTable && !refLoaded.current.has(c.fkTable)) {
        tablesNeeded.add(c.fkTable)
      }
    })
    if (tablesNeeded.size === 0) return

    const doFetch = async () => {
      for (const tbl of tablesNeeded) {
        try {
          const res = await window.electronAPI.adminListAll(tbl)
          if (res.success && res.data) {
            setRefData(prev => ({ ...prev, [tbl]: res.data! }))
            refLoaded.current.add(tbl)
          }
        } catch { /* ignore */ }
      }
    }
    doFetch()
  }, [activeTable, tableConfig.columns])

  const visibleColumns = useMemo(
    () => tableConfig.columns.filter(c => !c.hidden),
    [tableConfig],
  )

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const openCreate = () => {
    const data: Record<string, unknown> = {}
    tableConfig.columns.forEach(c => {
      if (c.required && c.editable) {
        data[c.key] = c.type === 'boolean' ? false : ''
      }
    })
    setFormData(data)
    setFormError(null)
    setEditingRow(null)
    setModalMode('create')
  }

  const openEdit = (row: Record<string, unknown>) => {
    setFormData({ ...row })
    setFormError(null)
    setEditingRow(row)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode('closed')
    setEditingRow(null)
    setFormError(null)
  }

  const handleFormChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const validateForm = (): boolean => {
    for (const col of tableConfig.columns) {
      if (!col.editable) continue
      if (col.required) {
        const v = formData[col.key]
        if (v === undefined || v === null || v === '') {
          setFormError(`"${t(`admin.db.fields.${col.key}`)}" is required`)
          return false
        }
      }
      if (isJsonType(col.type) && typeof formData[col.key] === 'string') {
        try {
          JSON.parse(formData[col.key] as string)
        } catch {
          setFormError(`${t(`admin.db.fields.${col.key}`)}: ${t('admin.db.errors.invalidJson')}`)
          return false
        }
      }
    }
    return true
  }

  const preparePayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {}
    for (const col of tableConfig.columns) {
      if (!col.editable) continue
      const val = formData[col.key]
      if (val === undefined || val === null) continue
      if (val === '' && !col.required) continue
      if (isJsonType(col.type) && typeof val === 'string') {
        payload[col.key] = JSON.parse(val)
      } else {
        payload[col.key] = val
      }
    }
    return payload
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    setFormError(null)
    try {
      const payload = preparePayload()
      if (modalMode === 'create') {
        const res = await window.electronAPI.adminCreateRow(activeTable, payload)
        if (!res.success) throw new Error(res.error || 'Create failed')
      } else {
        const id = editingRow?.id
        if (!id || typeof id !== 'string') throw new Error('No record ID')
        const res = await window.electronAPI.adminUpdateRow(activeTable, id, payload)
        if (!res.success) throw new Error(res.error || 'Update failed')
      }
      closeModal()
      fetchRows()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await window.electronAPI.adminDeleteRow(activeTable, id)
      if (!res.success) throw new Error(res.error || 'Delete failed')
      setDeleteConfirm(null)
      fetchRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
    setDeleting(false)
  }

  const getFkLabel = (table: string, id: unknown): string => {
    if (!id || typeof id !== 'string') return '—'
    const list = refData[table]
    if (!list) return id.slice(0, 8) + '…'
    const item = list.find(r => r.id === id)
    if (!item) return id.slice(0, 8) + '…'
    return String(item.full_name || item.name || '')
  }

  function renderCell(value: unknown, col: ColumnDef): React.ReactNode {
    if (col.type === 'boolean') {
      return (
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
          value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zn-elevated text-zn-text-faint'
        }`}>
          {value ? '✓' : '×'}
        </span>
      )
    }
    if (col.type === 'fk') {
      return (
        <span className="text-xs text-zn-text-muted truncate block" title={getFkLabel(col.fkTable!, value)}>
          {getFkLabel(col.fkTable!, value)}
        </span>
      )
    }
    if (isJsonType(col.type)) {
      const text = formatCellValue(value, col.type)
      return (
        <code className="text-[10px] text-zn-text-muted truncate block max-w-[200px] font-mono">
          {text.length > 40 ? text.slice(0, 40) + '…' : text}
        </code>
      )
    }
    if (col.type === 'date') {
      if (!value || typeof value !== 'string') return <span className="text-xs text-zn-text-faint">—</span>
      try {
        const d = new Date(value)
        return (
          <span className="text-xs text-zn-text-muted whitespace-nowrap" title={d.toLocaleString()}>
            {d.toLocaleDateString()}
          </span>
        )
      } catch {
        return <span className="text-xs text-zn-text-muted">—</span>
      }
    }
    return (
      <span className="text-xs text-zn-text truncate block">
        {formatCellValue(value, col.type)}
      </span>
    )
  }

  function renderFormField(col: ColumnDef): React.ReactNode {
    const value = formData[col.key] ?? ''
    const fieldKey = `admin.db.fields.${col.key}`
    const label = t(fieldKey).startsWith('admin.') ? col.key : t(fieldKey)

    if (col.type === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => handleFormChange(col.key, e.target.checked)}
            className="w-4 h-4 rounded border-zn-border bg-zn-elevated text-zn-accent focus:ring-zn-accent/30"
          />
          <span className="text-xs text-zn-text">{label}</span>
        </label>
      )
    }

    if (col.type === 'fk' && col.fkTable) {
      const options = refData[col.fkTable] || []
      return (
        <div>
          <label className="block text-[11px] text-zn-text-muted mb-1">{label}</label>
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={e => handleFormChange(col.key, e.target.value || null)}
            className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text appearance-none"
          >
            <option value="">—</option>
            {options.map(opt => (
              <option key={opt.id as string} value={opt.id as string}>
                {String(opt.full_name || opt.name || opt.id || '')}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (isJsonType(col.type)) {
      const strValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '')
      return (
        <div>
          <label className="block text-[11px] text-zn-text-muted mb-1">{label}</label>
          <textarea
            value={strValue}
            onChange={e => handleFormChange(col.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-xs font-mono bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text resize-y"
          />
        </div>
      )
    }

    if (col.multiline) {
      return (
        <div>
          <label className="block text-[11px] text-zn-text-muted mb-1">{label}</label>
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={e => handleFormChange(col.key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text resize-y"
          />
        </div>
      )
    }

    const inputType = col.type === 'number' ? 'number' : 'text'

    return (
      <div>
        <label className="block text-[11px] text-zn-text-muted mb-1">
          {label}
          {col.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <input
          type={inputType}
          value={typeof value === 'string' || typeof value === 'number' ? value : ''}
          onChange={e => handleFormChange(col.key, inputType === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
          placeholder={col.placeholder || ''}
          className="w-full h-9 px-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text placeholder:text-zn-text-faint"
        />
      </div>
    )
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 text-zn-text-faint opacity-30" strokeWidth={1.5} />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-zn-accent" strokeWidth={2} />
      : <ChevronDown className="h-3 w-3 text-zn-accent" strokeWidth={2} />
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Table tabs ── */}
      <div className="flex items-center gap-1 p-4 pb-2 border-b border-zn-border">
        {(Object.keys(TABLES) as AdminTable[]).map(key => {
          const cfg = TABLES[key]
          const Icon = cfg.icon
          const isActive = key === activeTable
          return (
            <button
              key={key}
              onClick={() => setActiveTable(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                isActive
                  ? 'bg-zn-elevated text-zn-text font-medium shadow-sm'
                  : 'text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t(cfg.labelKey)}
            </button>
          )
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zn-text-faint" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.db.search')}
            className="w-full h-9 pl-9 pr-3 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text placeholder:text-zn-text-faint"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zn-text-faint hover:text-zn-text-muted">
              <X className="h-3 w-3" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-zn-btn bg-zn-accent text-white hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {t('admin.db.addRecord')}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-4 pb-4 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2">
            <Loader2 className="h-4 w-4 text-zn-text-muted animate-spin" strokeWidth={1.5} />
            <span className="text-xs text-zn-text-muted">{t('admin.db.loading')}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.5} />
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={fetchRows} className="text-xs text-zn-accent hover:underline">{t('common.retry')}</button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-full bg-zn-elevated flex items-center justify-center">
              <Database className="h-5 w-5 text-zn-text-muted" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-zn-text-muted">{t('admin.db.noResults')}</p>
            <p className="text-xs text-zn-text-faint">{t('admin.db.noResultsHint')}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zn-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zn-border bg-zn-elevated/50">
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.editable && handleSort(col.key)}
                      className={`px-3 py-2.5 text-left text-[11px] font-medium text-zn-text-muted tracking-wider uppercase ${
                        col.editable ? 'cursor-pointer hover:text-zn-text select-none' : ''
                      }`}
                      style={{ width: col.width }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t(`admin.db.fields.${col.key}`)}</span>
                        {col.editable && <SortIcon column={col.key} />}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium text-zn-text-muted tracking-wider uppercase w-20">
                    {t('admin.db.fields.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={(row.id as string) || i}
                    className="border-b border-zn-border/50 last:border-0 hover:bg-zn-elevated/30 transition-colors"
                  >
                    {visibleColumns.map(col => (
                      <td key={col.key} className="px-3 py-2.5">
                        {renderCell(row[col.key], col)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-md text-zn-text-faint hover:text-zn-text hover:bg-zn-elevated transition-all"
                          title={t('admin.db.editRecord')}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(row.id as string)}
                          className="p-1.5 rounded-md text-zn-text-faint hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title={t('admin.db.deleteRecord')}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zn-border bg-zn-elevated/20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zn-text-muted">{t('admin.db.rowsPerPage')}:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="h-7 px-2 text-xs bg-zn-elevated border border-zn-border rounded-zn-input text-zn-text"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zn-text-muted">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} {t('admin.db.of')} {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md text-zn-text-faint hover:text-zn-text hover:bg-zn-elevated transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <span className="text-[11px] text-zn-text-muted px-1">{t('admin.db.page')} {page + 1}/{totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md text-zn-text-faint hover:text-zn-text hover:bg-zn-elevated transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit / Create Modal ── */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4 rounded-2xl border border-zn-border bg-zn-page shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zn-border">
              <h3 className="text-sm font-medium text-zn-text">
                {modalMode === 'create' ? t('admin.db.addRecord') : t('admin.db.editRecord')}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-md text-zn-text-faint hover:text-zn-text hover:bg-zn-elevated transition-all">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}

              {tableConfig.columns.filter(c => c.editable).map(col => (
                <div key={col.key}>
                  {renderFormField(col)}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zn-border">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs rounded-zn-btn text-zn-text-muted hover:text-zn-text hover:bg-zn-elevated transition-all"
              >
                {t('admin.db.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-zn-btn bg-zn-accent text-white hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                {t('admin.db.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !deleting && setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm mx-4 p-6 rounded-2xl border border-zn-border bg-zn-page shadow-2xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zn-text mb-1">{t('admin.db.deleteRecord')}</h3>
                <p className="text-xs text-zn-text-muted">{t('admin.db.deleteConfirm')}</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-xs rounded-zn-btn text-zn-text-muted hover:text-zn-text border border-zn-border hover:bg-zn-elevated transition-all"
                >
                  {t('admin.db.cancel')}
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-zn-btn bg-red-500 text-white hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                  {t('admin.db.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
