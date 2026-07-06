import { describe, it, expect } from 'vitest'
import uz from '../../src/renderer/src/locales/uz.json'
import ru from '../../src/renderer/src/locales/ru.json'
import en from '../../src/renderer/src/locales/en.json'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flattenKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )
}

const locales = { uz, ru, en }

describe('i18n locale integrity', () => {
  it('all locales have the same keys', () => {
    const ref = new Set(flattenKeys(uz))
    for (const [lang, json] of Object.entries(locales)) {
      const keys = flattenKeys(json as Record<string, unknown>)
      const missing = [...ref].filter(k => !keys.includes(k))
      const extra = keys.filter(k => !ref.has(k))
      expect(missing, `${lang} missing keys`).toEqual([])
      expect(extra, `${lang} has extra keys`).toEqual([])
    }
  })

  it('every locale value is a non-empty string', () => {
    for (const [lang, json] of Object.entries(locales)) {
      const keys = flattenKeys(json as Record<string, unknown>)
      for (const key of keys) {
        const parts = key.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let val: any = json
        for (const p of parts) val = val?.[p]
        expect(typeof val, `${lang}.${key} is not a string`).toBe('string')
        expect(val?.trim(), `${lang}.${key} is empty`).toBeTruthy()
      }
    }
  })
})
