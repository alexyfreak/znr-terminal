import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '../../src/renderer/src/store/useHistoryStore'

const mockItem = {
  id: 'doc-1',
  title: 'Buyruq asosiy',
  type: 'buyruq_asosiy',
  date: new Date().toISOString(),
  docCount: 1,
}

const mockItem2 = {
  id: 'doc-2',
  title: 'Tarif malaka',
  type: 'tarif_malaka',
  date: new Date().toISOString(),
  docCount: 1,
}

describe('useHistoryStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({ items: [], sortOrder: 'newest', activeId: null })
  })

  it('initial state is empty', () => {
    const state = useHistoryStore.getState()
    expect(state.items).toEqual([])
    expect(state.sortOrder).toBe('newest')
    expect(state.activeId).toBeNull()
  })

  it('addItem adds to front of list', () => {
    useHistoryStore.getState().addItem(mockItem)
    useHistoryStore.getState().addItem(mockItem2)
    expect(useHistoryStore.getState().items).toHaveLength(2)
    expect(useHistoryStore.getState().items[0].id).toBe('doc-2')
  })

  it('addItem deduplicates by id', () => {
    useHistoryStore.getState().addItem(mockItem)
    useHistoryStore.getState().addItem(mockItem)
    expect(useHistoryStore.getState().items).toHaveLength(1)
  })

  it('removeItem removes by id', () => {
    useHistoryStore.getState().addItem(mockItem)
    useHistoryStore.getState().addItem(mockItem2)
    useHistoryStore.getState().removeItem('doc-1')
    expect(useHistoryStore.getState().items).toHaveLength(1)
    expect(useHistoryStore.getState().items[0].id).toBe('doc-2')
  })

  it('removeItem on non-existent id does nothing', () => {
    useHistoryStore.getState().addItem(mockItem)
    useHistoryStore.getState().removeItem('nonexistent')
    expect(useHistoryStore.getState().items).toHaveLength(1)
  })

  it('setSortOrder toggles sort order', () => {
    useHistoryStore.getState().setSortOrder('oldest')
    expect(useHistoryStore.getState().sortOrder).toBe('oldest')
  })

  it('setActiveId tracks active document', () => {
    useHistoryStore.getState().setActiveId('doc-1')
    expect(useHistoryStore.getState().activeId).toBe('doc-1')
  })

  it('setActiveId can clear with null', () => {
    useHistoryStore.getState().setActiveId('doc-1')
    useHistoryStore.getState().setActiveId(null)
    expect(useHistoryStore.getState().activeId).toBeNull()
  })

  it('setItems replaces all items', () => {
    useHistoryStore.getState().setItems([mockItem, mockItem2])
    expect(useHistoryStore.getState().items).toHaveLength(2)
  })

  it('clear empties items and activeId', () => {
    useHistoryStore.getState().addItem(mockItem)
    useHistoryStore.getState().setActiveId('doc-1')
    useHistoryStore.getState().clear()
    expect(useHistoryStore.getState().items).toEqual([])
    expect(useHistoryStore.getState().activeId).toBeNull()
  })
})
