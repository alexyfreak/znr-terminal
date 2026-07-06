import { describe, it, expect, beforeEach } from 'vitest'
import { useAccountStore } from '../../src/renderer/src/store/useAccountStore'

describe('useAccountStore', () => {
  beforeEach(() => {
    useAccountStore.setState({
      isLoggedIn: false,
      userName: '',
      schoolName: '',
      role: '',
      avatar: '',
      classes: [],
      director: null,
      teachers: [],
    })
  })

  it('initial state is logged out', () => {
    const state = useAccountStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.userName).toBe('')
    expect(state.schoolName).toBe('')
  })

  it('login sets user data and isLoggedIn', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    const state = useAccountStore.getState()
    expect(state.isLoggedIn).toBe(true)
    expect(state.userName).toBe('Aliyev A.')
    expect(state.schoolName).toBe('1-Maktab')
    expect(state.role).toBe("O'qituvchi")
  })

  it('login with avatar works', () => {
    useAccountStore.getState().login('Valiyev V.', '2-Maktab', 'Direktor', 'avatar-url')
    expect(useAccountStore.getState().avatar).toBe('avatar-url')
  })

  it('logout clears all state', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    useAccountStore.getState().setContext({ classes: [{ id: '1', name: '9-A', school_id: null, form_teacher_id: null, academic_year: null }], director: null })
    useAccountStore.getState().setTeachers([{ id: '1', full_name: 'Test Teacher' }])
    useAccountStore.getState().logout()
    const state = useAccountStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.userName).toBe('')
    expect(state.schoolName).toBe('')
    expect(state.role).toBe('')
    expect(state.classes).toEqual([])
    expect(state.director).toBeNull()
    expect(state.teachers).toEqual([])
  })

  it('updateProfile partially updates fields', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    useAccountStore.getState().updateProfile({ role: 'Direktor' })
    expect(useAccountStore.getState().role).toBe('Direktor')
    expect(useAccountStore.getState().userName).toBe('Aliyev A.')
  })

  it('setContext updates classes and director', () => {
    useAccountStore.getState().login('Aliyev A.', '1-Maktab', "O'qituvchi")
    const classes = [{ id: '1', name: '9-A', school_id: 's1', form_teacher_id: 't1', academic_year: '2025-2026' }]
    const director = { id: 'd1', full_name: 'Karimov K.', position: 'Direktor' }
    useAccountStore.getState().setContext({ classes, director })
    const state = useAccountStore.getState()
    expect(state.classes).toEqual(classes)
    expect(state.director).toEqual(director)
  })

  it('setTeachers updates teachers list', () => {
    const teachers = [{ id: 't1', full_name: 'Aliyev A.' }, { id: 't2', full_name: 'Valiyev V.' }]
    useAccountStore.getState().setTeachers(teachers)
    expect(useAccountStore.getState().teachers).toEqual(teachers)
  })

  it('double login overwrites previous state', () => {
    useAccountStore.getState().login('First', 'School 1', 'Teacher')
    useAccountStore.getState().login('Second', 'School 2', 'Director')
    const state = useAccountStore.getState()
    expect(state.userName).toBe('Second')
    expect(state.schoolName).toBe('School 2')
  })
})
