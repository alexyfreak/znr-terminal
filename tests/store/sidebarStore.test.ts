import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from '../../src/renderer/src/store/useSidebarStore'

describe('useSidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: false, isAnimating: false })
    localStorage.clear()
  })

  it('defaults to collapsed', () => {
    const state = useSidebarStore.getState()
    expect(state.isExpanded).toBe(false)
    expect(state.isAnimating).toBe(false)
  })

  it('toggle expands when collapsed', () => {
    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().isExpanded).toBe(true)
  })

  it('toggle collapses when expanded', () => {
    useSidebarStore.getState().setExpanded(true)
    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().isExpanded).toBe(false)
  })

  it('setExpanded sets expanded state', () => {
    useSidebarStore.getState().setExpanded(true)
    expect(useSidebarStore.getState().isExpanded).toBe(true)
  })

  it('setAnimating sets animating state', () => {
    useSidebarStore.getState().setAnimating(true)
    expect(useSidebarStore.getState().isAnimating).toBe(true)
  })

  it('persists to localStorage', () => {
    useSidebarStore.getState().setExpanded(true)
    const stored = JSON.parse(localStorage.getItem('zunoora-sidebar') || '{}')
    expect(stored.state.isExpanded).toBe(true)
  })
})
