import '@testing-library/jest-dom'

window.electronAPI = {
  login: vi.fn(),
  loadTemplates: vi.fn(),
  renderAndGenerate: vi.fn(),
  showSaveDialog: vi.fn(),
  getStoreValue: vi.fn(),
  setStoreValue: vi.fn(),
  getContext: vi.fn(),
  getTeachers: vi.fn(),
}

Element.prototype.scrollIntoView = vi.fn()
