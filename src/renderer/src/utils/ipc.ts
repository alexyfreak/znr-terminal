const IPC_TIMEOUT_MS = 35000

export async function safeIpcCall<T>(
  call: () => Promise<{ success: boolean; data?: T; error?: string }>
): Promise<T | null> {
  const timeout = new Promise<null>((_, reject) =>
    setTimeout(() => reject(new Error('IPC call timed out')), IPC_TIMEOUT_MS)
  )

  try {
    const result = await Promise.race([call(), timeout])
    if (result.success && result.data !== undefined) return result.data
    return null
  } catch {
    return null
  }
}

export function registerRendererErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[RENDERER] Unhandled promise rejection:', event.reason)
  })

  window.addEventListener('error', (event) => {
    console.error('[RENDERER] Uncaught error:', event.error || event.message)
  })
}
