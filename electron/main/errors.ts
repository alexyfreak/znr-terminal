import { app, dialog } from 'electron'

export function registerGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    console.error('[FATAL] Uncaught exception:', error.message)
    console.error(error.stack)

    dialog.showErrorBox(
      'Zunoora — Critical Error',
      `An unexpected error occurred:\n\n${error.message}\n\nThe application will restart.`
    )

    app.relaunch()
    app.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled rejection:', reason instanceof Error ? reason.message : String(reason))

    if (reason instanceof Error) {
      console.error(reason.stack)
    }
  })

  process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning') return
    console.warn('[WARN]', warning.message)
  })
}
