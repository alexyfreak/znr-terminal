import { useState, useRef } from 'react'
import { FileText, Printer } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

type Template = 'spravka' | 'xarakteristika' | 'buyruq'

const templates: { key: Template; label: string }[] = [
  { key: 'spravka', label: "Ma'lumotnoma" },
  { key: 'xarakteristika', label: 'Xarakteristika' },
  { key: 'buyruq', label: 'Buyruq' },
]

interface SpravkaData {
  childName: string
  className: string
  reason: string
  date: string
}

interface XarakteristikaData {
  childName: string
  className: string
  behavior: string
  academic: string
  conclusion: string
  date: string
}

interface BuyruqData {
  title: string
  preamble: string
  points: string[]
  basis: string
  date: string
  number: string
}

export default function NoteGenerator() {
  const { user } = useAuth()
  const [template, setTemplate] = useState<Template>('spravka')
  const [preview, setPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [spravka, setSpravka] = useState<SpravkaData>({
    childName: '',
    className: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [xarakteristika, setXarakteristika] = useState<XarakteristikaData>({
    childName: '',
    className: '',
    behavior: '',
    academic: '',
    conclusion: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [buyruq, setBuyruq] = useState<BuyruqData>({
    title: '',
    preamble: '',
    points: [''],
    basis: '',
    date: new Date().toISOString().split('T')[0],
    number: `№___`,
  })

  const handlePrint = () => {
    window.print()
  }

  if (!user) return null

  const renderForm = () => {
    switch (template) {
      case 'spravka':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">O'quvchi F.I.O</label>
              <input value={spravka.childName} onChange={(e) => setSpravka({ ...spravka, childName: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="Familiya I. O." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sinf</label>
              <input value={spravka.className} onChange={(e) => setSpravka({ ...spravka, className: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="9-A" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sabab</label>
              <textarea value={spravka.reason} onChange={(e) => setSpravka({ ...spravka, reason: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" rows={3} placeholder="Ma'lumotnoma sababi..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sana</label>
              <input type="date" value={spravka.date} onChange={(e) => setSpravka({ ...spravka, date: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" />
            </div>
          </div>
        )
      case 'xarakteristika':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">O'quvchi F.I.O</label>
              <input value={xarakteristika.childName} onChange={(e) => setXarakteristika({ ...xarakteristika, childName: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="Familiya I. O." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sinf</label>
              <input value={xarakteristika.className} onChange={(e) => setXarakteristika({ ...xarakteristika, className: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="9-A" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Xulq-atvori</label>
              <textarea value={xarakteristika.behavior} onChange={(e) => setXarakteristika({ ...xarakteristika, behavior: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" rows={3} placeholder="O'quvchining xulq-atvori haqida..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">O'zlashtirishi</label>
              <textarea value={xarakteristika.academic} onChange={(e) => setXarakteristika({ ...xarakteristika, academic: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" rows={3} placeholder="O'quvchining o'zlashtirishi haqida..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Xulosa</label>
              <textarea value={xarakteristika.conclusion} onChange={(e) => setXarakteristika({ ...xarakteristika, conclusion: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" rows={2} placeholder="Xulosa..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sana</label>
              <input type="date" value={xarakteristika.date} onChange={(e) => setXarakteristika({ ...xarakteristika, date: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" />
            </div>
          </div>
        )
      case 'buyruq':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Buyruq raqami</label>
              <input value={buyruq.number} onChange={(e) => setBuyruq({ ...buyruq, number: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sarlavha</label>
              <input value={buyruq.title} onChange={(e) => setBuyruq({ ...buyruq, title: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="Buyruq sarlavhasi" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Preambula</label>
              <textarea value={buyruq.preamble} onChange={(e) => setBuyruq({ ...buyruq, preamble: e.target.value })}
                className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" rows={3} placeholder="Buyruqning asosiy matni..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Bandlar</label>
              {buyruq.points.map((point, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-zn-text-faint shrink-0">{i + 1}.</span>
                  <input value={point} onChange={(e) => {
                    const next = [...buyruq.points]
                    next[i] = e.target.value
                    setBuyruq({ ...buyruq, points: next })
                  }}
                    className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm text-zn-text" placeholder={`Band ${i + 1}`} />
                  {buyruq.points.length > 1 && (
                    <button onClick={() => setBuyruq({ ...buyruq, points: buyruq.points.filter((_, j) => j !== i) })}
                      className="text-xs text-zn-error-text">O'chirish</button>
                  )}
                </div>
              ))}
              <button onClick={() => setBuyruq({ ...buyruq, points: [...buyruq.points, ''] })}
                className="text-xs text-zn-info-accent">+ Band qo'shish</button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Asos</label>
              <input value={buyruq.basis} onChange={(e) => setBuyruq({ ...buyruq, basis: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" placeholder="Buyruq asosi..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zn-text-muted">Sana</label>
              <input type="date" value={buyruq.date} onChange={(e) => setBuyruq({ ...buyruq, date: e.target.value })}
                className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-zn-text" />
            </div>
          </div>
        )
    }
  }

  const renderPreview = () => {
    switch (template) {
      case 'spravka':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-black">
            <p className="text-center font-bold text-base">MA'LUMOTNOMA</p>
            <p className="text-right">{spravka.date}</p>
            <p>Berildi <strong>{spravka.childName || '___________________'}</strong>ga,</p>
            <p>{spravka.className || '______'}-sinf o'quvchisi ekanligi haqida.</p>
            <p>Sabab: {spravka.reason || '___________________'}</p>
            <br />
            <div className="flex justify-between">
              <p>Direktor: _______________</p>
              <p>Sinf rahbari: _______________</p>
            </div>
          </div>
        )
      case 'xarakteristika':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-black">
            <p className="text-center font-bold text-base">XARAKTERISTIKA</p>
            <p className="text-right">{xarakteristika.date}</p>
            <p><strong>{xarakteristika.childName || '___________________'}</strong>,</p>
            <p>{xarakteristika.className || '______'}-sinf o'quvchisiga.</p>
            <p><strong>Xulq-atvori:</strong> {xarakteristika.behavior || '___________________'}</p>
            <p><strong>O'zlashtirishi:</strong> {xarakteristika.academic || '___________________'}</p>
            <p><strong>Xulosa:</strong> {xarakteristika.conclusion || '___________________'}</p>
            <br />
            <div className="flex justify-between">
              <p>Direktor: _______________</p>
              <p>Sinf rahbari: _______________</p>
            </div>
          </div>
        )
      case 'buyruq':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-black">
            <p className="text-center font-bold text-base">B U Y R U Q</p>
            <p className="text-right">{buyruq.date} &nbsp;&nbsp; {buyruq.number}</p>
            <p className="text-center font-semibold">{buyruq.title || '___________________'}</p>
            <p>{buyruq.preamble || '___________________'}</p>
            <p className="font-semibold">B U Y U R A M A N:</p>
            <ol className="list-decimal pl-5 space-y-1">
              {buyruq.points.map((p, i) => (
                <li key={i}>{p || '___________________'}</li>
              ))}
            </ol>
            {buyruq.basis && <p><strong>Asos:</strong> {buyruq.basis}</p>}
            <br />
            <div className="flex justify-between">
              <p>Direktor: _______________</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-zn-info-accent" />
          <h3 className="text-sm font-semibold text-zn-text">Hujjat generatori</h3>
        </div>
        {preview && (
          <button onClick={() => setPreview(false)}
            className="text-xs text-zn-text-muted hover:text-zn-text">Tahrirlash</button>
        )}
      </div>

      {!preview ? (
        <>
          <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {templates.map((t) => (
              <button key={t.key} onClick={() => setTemplate(t.key)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  template === t.key
                    ? 'bg-white/10 text-zn-text'
                    : 'bg-white/4 text-zn-text-muted hover:bg-white/7'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {renderForm()}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setPreview(true)} fullWidth>
              Ko'rib chiqish
            </Button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-white/8 px-4 py-2.5 text-sm font-medium text-zn-text transition-colors hover:bg-white/10">
              <Printer size={16} />
            </button>
          </div>
        </>
      ) : (
        <div ref={printRef} className="rounded-2xl bg-white p-6 shadow-xl print:p-0 print:shadow-none" id="note-print-area">
          {renderPreview()}
          <div className="mt-4 flex gap-2 print:hidden">
            <Button onClick={handlePrint} fullWidth>
              <Printer size={16} className="mr-1" />
              Chop etish
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
