import { type ReactNode } from 'react'

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="safe-bottom safe-x mx-auto flex min-h-dvh max-w-md flex-col bg-zn-page">
      {children}
    </main>
  )
}
