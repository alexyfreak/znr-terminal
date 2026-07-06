import React from 'react'

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--carbon)] text-foreground">
      <aside
        className="flex h-screen flex-col bg-[var(--sidebar)] border-r border-[var(--hairline)]"
        style={{ width: 60 }}
      >
        <div className="flex items-center justify-center p-3">
          <span className="text-warm text-sm font-medium tracking-[0.2em]">◆</span>
        </div>
      </aside>
      <main className="relative flex min-h-0 flex-1 flex-col desk-vignette items-center justify-center">
        <div className="text-center">
          <h1 className="serif-italic text-3xl text-warm mb-2">Zunoora</h1>
          <p className="text-lg text-foreground">What shall we draft today?</p>
          <p className="text-sm text-muted-foreground mt-1">A lesson plan, a quiz...</p>
        </div>
      </main>
    </div>
  )
}

export default App
