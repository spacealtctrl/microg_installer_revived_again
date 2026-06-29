import { describe, it, expect, vi } from 'vitest'

vi.mock('kernelsu', () => ({
  exec: vi.fn(async () => ({ errno: 0, stdout: '', stderr: '' })),
  toast: vi.fn(),
  spawn: vi.fn()
}))

import { shq } from './KernelSU.js'
import { getPackageName, filterAssetsForDevice, formatFileSize } from './MicroG.js'

describe('shq', () => {
  it('wraps plain values in single quotes', () => {
    expect(shq('abc')).toBe("'abc'")
  })
  it('escapes embedded single quotes', () => {
    expect(shq("a'b")).toBe("'a'\\''b'")
  })
  it('coerces non-strings', () => {
    expect(shq(123)).toBe("'123'")
  })
  it('neutralises shell metacharacters', () => {
    expect(shq('; rm -rf /')).toBe("'; rm -rf /'")
  })
})

describe('getPackageName', () => {
  it('extracts the gms package', () => {
    expect(getPackageName('com.google.android.gms-250932030.apk')).toBe('com.google.android.gms')
  })
  it('extracts the vending package from a -hw asset', () => {
    expect(getPackageName('com.android.vending-84022630-hw.apk')).toBe('com.android.vending')
  })
  it('returns empty for unparseable names', () => {
    expect(getPackageName('whatever')).toBe('')
  })
})

describe('filterAssetsForDevice', () => {
  const assets = [
    { name: 'com.google.android.gms-250932030.apk' },
    { name: 'com.google.android.gms-250932030.apk.asc' },
    { name: 'com.android.vending-84022630-hw.apk' },
    { name: 'org.microg.gms.foo-user.apk' }
  ]
  it('drops .asc and -user, keeps standard apks', () => {
    const out = filterAssetsForDevice(assets, 'standard').map(a => a.name)
    expect(out).toEqual(['com.google.android.gms-250932030.apk'])
  })
  it('keeps only -hw apks on huawei', () => {
    const out = filterAssetsForDevice(assets, 'huawei').map(a => a.name)
    expect(out).toEqual(['com.android.vending-84022630-hw.apk'])
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })
  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
  it('formats megabytes', () => {
    expect(formatFileSize(1572864)).toBe('1.5 MB')
  })
})
