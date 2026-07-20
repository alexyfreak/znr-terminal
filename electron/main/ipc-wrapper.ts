import { ipcMain, type IpcMainInvokeEvent } from 'electron'

const IPC_TIMEOUT_MS = 30000

export function registerSafeHandler<T>(channel: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T>): void {
  ipcMain.handle(channel, async (event, ...args): Promise<{ success: boolean; data?: T; error?: string }> => {
    const timeout = new Promise<{ success: boolean; error: string }>((_, reject) =>
      setTimeout(() => reject(new Error('Handler timed out')), IPC_TIMEOUT_MS)
    )

    const execution = (async () => {
      try {
        const result = await handler(event, ...args)
        return { success: true as const, data: result }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false as const, error: message }
      }
    })()

    return await Promise.race([execution, timeout])
  })
}
