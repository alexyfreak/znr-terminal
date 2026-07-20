import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useBugReportStore } from '@renderer/store/useBugReportStore'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    useBugReportStore.getState().open('auto', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 bg-zn-page text-zn-text">
          <p className="text-sm text-zn-text-muted">Something went wrong</p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              useBugReportStore.getState().open('manual')
            }}
            className="px-4 py-2 text-xs font-medium rounded-zn-btn bg-zn-text text-zn-page hover:opacity-90 transition-opacity"
          >
            Report Bug
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
