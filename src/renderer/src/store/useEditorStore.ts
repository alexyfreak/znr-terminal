import { create } from 'zustand'

export interface FieldMeta {
  type?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
}

interface EditorState {
  variables: Record<string, string>
  templateContent: string
  pendingVariableKeys: { key: string; label: string }[]
  fieldMeta: Record<string, FieldMeta>

  fontFamily: string
  fontSize: number
  textStyles: {
    bold: boolean
    italic: boolean
    underline: boolean
    strikethrough: boolean
  }

  focusedVariable: string | null
  setFocusedVariable: (key: string | null) => void
  setVariable: (key: string, value: string) => void
  setFontFamily: (font: string) => void
  setFontSize: (size: number) => void
  toggleStyle: (style: 'bold' | 'italic' | 'underline' | 'strikethrough') => void
  setTemplateContent: (content: string, keys: { key: string; label: string }[], meta?: Record<string, FieldMeta>) => void
  prefillVariables: (partial: Record<string, string>) => void
  addVariableKey: (key: string, label: string, meta?: FieldMeta) => void
  removeVariableKey: (key: string) => void
  appendToTemplate: (snippet: string) => void
  reset: () => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  variables: {},
  templateContent: '',
  pendingVariableKeys: [],
  fieldMeta: {},

  fontFamily: 'Times New Roman',
  fontSize: 14,
  textStyles: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  },

  focusedVariable: null,
  setFocusedVariable: (key) => set({ focusedVariable: key }),

  setVariable: (key, value) =>
    set((s) => ({ variables: { ...s.variables, [key]: value } })),

  setFontFamily: (font) => set({ fontFamily: font }),

  setFontSize: (size) => set({ fontSize: size }),

  toggleStyle: (style) =>
    set((s) => ({
      textStyles: { ...s.textStyles, [style]: !s.textStyles[style] },
    })),

  setTemplateContent: (content, keys, meta) =>
    set({
      templateContent: content,
      pendingVariableKeys: keys,
      fieldMeta: meta || {},
      variables: keys.reduce<Record<string, string>>((acc, k) => {
        acc[k.key] = ''
        return acc
      }, {}),
    }),

  prefillVariables: (partial) =>
    set((s) => ({
      variables: { ...s.variables, ...partial },
    })),

  addVariableKey: (key, label, meta) => {
    set((s) => ({
      pendingVariableKeys: [...s.pendingVariableKeys, { key, label }],
      variables: { ...s.variables, [key]: '' },
      fieldMeta: meta ? { ...s.fieldMeta, [key]: meta } : s.fieldMeta,
    }))
  },

  removeVariableKey: (key) => {
    set((s) => {
      const { [key]: _, ...rest } = s.variables
      const { [key]: __, ...restMeta } = s.fieldMeta
      return {
        pendingVariableKeys: s.pendingVariableKeys.filter((k) => k.key !== key),
        variables: rest,
        fieldMeta: restMeta,
      }
    })
  },

  appendToTemplate: (snippet) =>
    set((s) => ({
      templateContent: s.templateContent + '\n' + snippet,
    })),

  reset: () =>
    set({
      variables: {},
      templateContent: '',
      pendingVariableKeys: [],
      fieldMeta: {},
      fontFamily: 'Times New Roman',
      fontSize: 14,
      textStyles: { bold: false, italic: false, underline: false, strikethrough: false },
      focusedVariable: null,
    }),
}))
