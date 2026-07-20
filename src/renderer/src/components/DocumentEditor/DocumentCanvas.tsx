import { useMemo, useCallback } from 'react'
import { useEditorStore } from '@renderer/store/useEditorStore'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPreviewHtml(template: string, variables: Record<string, string>): string {
  if (!template) return ''
  const regex = /\{\{(\w+)\}\}/g
  let lastIndex = 0
  const parts: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    const before = template.slice(lastIndex, match.index)
    if (before) parts.push(escapeHtml(before).replace(/\n/g, '<br>'))
    const key = match[1]
    const val = variables[key]
    if (val && val.trim()) {
      parts.push(`<span data-var="${key}" class="var-chip-filled">${escapeHtml(val)}</span>`)
    } else {
      parts.push(`<span data-var="${key}" class="var-chip-empty">${key}</span>`)
    }
    lastIndex = regex.lastIndex
  }
  const remaining = template.slice(lastIndex)
  if (remaining) parts.push(escapeHtml(remaining).replace(/\n/g, '<br>'))
  return parts.join('')
}

interface DocumentCanvasProps {
  onVariableClick?: (key: string) => void
}

export const DocumentCanvas = ({ onVariableClick }: DocumentCanvasProps) => {
  const templateContent = useEditorStore((s) => s.templateContent)
  const variables = useEditorStore((s) => s.variables)
  const fontFamily = useEditorStore((s) => s.fontFamily)
  const fontSize = useEditorStore((s) => s.fontSize)
  const textStyles = useEditorStore((s) => s.textStyles)
  const setFocusedVariable = useEditorStore((s) => s.setFocusedVariable)

  const html = useMemo(
    () => buildPreviewHtml(templateContent, variables),
    [templateContent, variables]
  )

  const decorations: string[] = []
  if (textStyles.underline) decorations.push('underline')
  if (textStyles.strikethrough) decorations.push('line-through')

  const handleClick = useCallback((e: React.MouseEvent) => {
    const span = (e.target as HTMLElement).closest('[data-var]') as HTMLSpanElement | null
    if (span) {
      const key = span.getAttribute('data-var')
      if (key) {
        setFocusedVariable(key)
        onVariableClick?.(key)
      }
    }
  }, [setFocusedVariable, onVariableClick])

  return (
    <div className="flex-1 flex justify-center overflow-y-auto document-scrollbar min-h-0">
      <div
        className="paper-noise w-full mx-8 my-6 document-canvas"
        style={{
          maxWidth: 720,
          backgroundColor: 'var(--paper-bg)',
          color: 'var(--paper-text)',
          padding: 48,
          borderRadius: 4,
          boxShadow: 'var(--shadow-card)',
          fontFamily: fontFamily || 'Times New Roman',
          fontSize: `${fontSize}pt`,
          fontWeight: textStyles.bold ? 700 : 400,
          fontStyle: textStyles.italic ? 'italic' : 'normal',
          textDecoration: decorations.length > 0 ? decorations.join(' ') : 'none',
          lineHeight: 1.5,
          minHeight: 400,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
