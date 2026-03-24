import { useState, useEffect, useCallback } from 'react'
import './App.css'

interface SymptomEntry {
  id: string
  date: string
  painLevel: number
  fatigueLevel: number
  jointInstability: number
  subluxations: string
  brainFog: number
  gi: number
  pots: boolean
  notes: string
}

interface HealthSnapshot {
  heartRate: { bpm: number; time: string }[]
  sleep: { date: string; hours: number; quality: number }[]
}

function generateMockHealth(): HealthSnapshot {
  const now = new Date()
  const heartRate = Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now)
    time.setHours(now.getHours() - 23 + i, Math.floor(Math.random() * 60))
    const base = i < 6 || i > 20 ? 62 : 78
    return { bpm: base + Math.floor(Math.random() * 20), time: time.toISOString() }
  })
  const sleep = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - 6 + i)
    return {
      date: d.toISOString().split('T')[0],
      hours: 4.5 + Math.random() * 4,
      quality: Math.floor(1 + Math.random() * 5),
    }
  })
  return { heartRate, sleep }
}

function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue]
}

const SYMPTOM_LABELS: Record<string, string> = {
  painLevel: 'Pain',
  fatigueLevel: 'Fatigue',
  jointInstability: 'Joint Instability',
  brainFog: 'Brain Fog',
  gi: 'GI Symptoms',
}

function App() {
  const [entries, setEntries] = useLocalStorage<SymptomEntry[]>('eds-entries', [])
  const [health] = useState(() => generateMockHealth())
  const [view, setView] = useState<'log' | 'history' | 'health'>('log')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const [form, setForm] = useState({
    painLevel: 3, fatigueLevel: 3, jointInstability: 2, brainFog: 2, gi: 1,
    subluxations: '', pots: false, notes: '',
  })

  const handleSubmit = useCallback(() => {
    const entry: SymptomEntry = {
      ...form,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      date: new Date().toISOString(),
    }
    setEntries(prev => [entry, ...prev])
    setForm({ painLevel: 3, fatigueLevel: 3, jointInstability: 2, brainFog: 2, gi: 1, subluxations: '', pots: false, notes: '' })
    setView('history')
  }, [form, setEntries])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [setEntries])

  const severityColor = (level: number) => {
    if (level <= 2) return 'var(--green)'
    if (level <= 4) return 'var(--yellow)'
    if (level <= 6) return 'var(--orange)'
    return 'var(--red)'
  }

  return (
    <div className="app">
      <header>
        <h1>EDS Health Tracker</h1>
        <div className="header-actions">
          <button className="theme-toggle" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <nav className="tabs">
        {(['log', 'history', 'health'] as const).map(tab => (
          <button key={tab} className={view === tab ? 'active' : ''} onClick={() => setView(tab)}>
            {tab === 'log' ? 'Log Symptoms' : tab === 'history' ? 'History' : 'Health Data'}
          </button>
        ))}
      </nav>

      <main>
        {view === 'log' && (
          <section className="log-form">
            <h2>Log Today's Symptoms</h2>
            {Object.entries(SYMPTOM_LABELS).map(([key, label]) => (
              <div className="slider-group" key={key}>
                <label>
                  {label}: <strong style={{ color: severityColor(form[key as keyof typeof form] as number) }}>
                    {form[key as keyof typeof form] as number}/10
                  </strong>
                </label>
                <input
                  type="range" min={0} max={10} step={1}
                  value={form[key as keyof typeof form] as number}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
            <div className="field">
              <label>Subluxations / dislocations today</label>
              <input type="text" value={form.subluxations}
                onChange={e => setForm(f => ({ ...f, subluxations: e.target.value }))}
                placeholder="e.g. left shoulder, right knee" />
            </div>
            <div className="field checkbox-field">
              <label>
                <input type="checkbox" checked={form.pots}
                  onChange={e => setForm(f => ({ ...f, pots: e.target.checked }))} />
                POTS symptoms present
              </label>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Weather, triggers, what helped..." rows={3} />
            </div>
            <button className="submit-btn" onClick={handleSubmit}>Save Entry</button>
          </section>
        )}

        {view === 'history' && (
          <section className="history">
            <h2>Symptom History</h2>
            {entries.length === 0 && <p className="empty">No entries yet. Log your first symptoms above.</p>}
            {entries.map(entry => (
              <div className="entry-card" key={entry.id}>
                <div className="entry-header">
                  <span className="entry-date">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <button className="delete-btn" onClick={() => deleteEntry(entry.id)} aria-label="Delete entry">x</button>
                </div>
                <div className="entry-bars">
                  {Object.entries(SYMPTOM_LABELS).map(([key, label]) => {
                    const val = entry[key as keyof SymptomEntry] as number
                    return (
                      <div className="bar-row" key={key}>
                        <span className="bar-label">{label}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${val * 10}%`, background: severityColor(val) }} />
                        </div>
                        <span className="bar-value">{val}</span>
                      </div>
                    )
                  })}
                </div>
                {entry.subluxations && <div className="entry-detail">Subluxations: {entry.subluxations}</div>}
                {entry.pots && <div className="entry-detail">POTS symptoms present</div>}
                {entry.notes && <div className="entry-detail entry-notes">{entry.notes}</div>}
              </div>
            ))}
          </section>
        )}

        {view === 'health' && (
          <section className="health-data">
            <h2>Health Data</h2>
            <p className="mock-notice">Sample data shown -- connect Google Health or Apple Health for real readings</p>
            <h3>Heart Rate (last 24h)</h3>
            <div className="hr-grid">
              {health.heartRate.map((r, i) => (
                <div className="hr-reading" key={i}>
                  <span className="hr-bpm" style={{ color: r.bpm > 100 ? 'var(--red)' : r.bpm > 85 ? 'var(--orange)' : 'var(--green)' }}>
                    {r.bpm}
                  </span>
                  <span className="hr-time">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
            <h3>Sleep (last 7 days)</h3>
            <div className="sleep-grid">
              {health.sleep.map((s, i) => (
                <div className="sleep-card" key={i}>
                  <div className="sleep-date">{new Date(s.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div className="sleep-hours">{s.hours.toFixed(1)}h</div>
                  <div className="sleep-quality">Quality: {s.quality}/5</div>
                  <div className="sleep-bar-track">
                    <div className="sleep-bar-fill" style={{ width: `${Math.min(s.hours / 9 * 100, 100)}%`, background: s.hours >= 7 ? 'var(--green)' : s.hours >= 5 ? 'var(--yellow)' : 'var(--red)' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>EDS Health Tracker -- all data stored locally in your browser</span>
      </footer>
    </div>
  )
}

export default App
