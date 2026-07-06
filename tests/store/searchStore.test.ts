import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from '../../src/renderer/src/store/useSearchStore'

describe('useSearchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: '',
      isFocused: false,
      isDocked: false,
      results: [],
    })
  })

  it('initial state is correct', () => {
    const state = useSearchStore.getState()
    expect(state.query).toBe('')
    expect(state.isFocused).toBe(false)
    expect(state.isDocked).toBe(false)
    expect(state.results).toEqual([])
  })

  it('setQuery updates query', () => {
    useSearchStore.getState().setQuery('yillik')
    expect(useSearchStore.getState().query).toBe('yillik')
  })

  it('setFocused updates focus', () => {
    useSearchStore.getState().setFocused(true)
    expect(useSearchStore.getState().isFocused).toBe(true)
  })

  it('setDocked updates docked state', () => {
    useSearchStore.getState().setDocked(true)
    expect(useSearchStore.getState().isDocked).toBe(true)
  })

  it('setResults updates results', () => {
    useSearchStore.getState().setResults(['buyruq_asosiy', 'tarif_malaka'])
    expect(useSearchStore.getState().results).toEqual(['buyruq_asosiy', 'tarif_malaka'])
  })

  it('clear resets all to initial', () => {
    useSearchStore.setState({ query: 'test', results: ['a'], isFocused: true })
    useSearchStore.getState().clear()
    const state = useSearchStore.getState()
    expect(state.query).toBe('')
    expect(state.results).toEqual([])
    expect(state.isFocused).toBe(false)
  })

  it('clear does not reset isDocked', () => {
    useSearchStore.setState({ query: 'test', isDocked: true })
    useSearchStore.getState().clear()
    expect(useSearchStore.getState().isDocked).toBe(true)
  })
})
