// Utility to generate a UUID-like identifier with graceful fallbacks.
// Some browsers (or pages served over plain HTTP from a LAN IP) don't expose crypto.randomUUID.
// This helper avoids runtime errors by cascading through available strategies.

export function generateId(): string {
  // Native (secure contexts, modern browsers)
  if (
    typeof crypto !== 'undefined' &&
    typeof (crypto as Crypto & { randomUUID?: () => string }).randomUUID === 'function'
  ) {
    try {
      return (crypto as Crypto & { randomUUID: () => string }).randomUUID()
    } catch {
      /* ignore and fallback */
    }
  }
  // getRandomValues based v4 construction
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
    const hex: string[] = []
    for (let i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] + 0x100).toString(16).substring(1))
    }
    return (
      hex[0] +
      hex[1] +
      hex[2] +
      hex[3] +
      '-' +
      hex[4] +
      hex[5] +
      '-' +
      hex[6] +
      hex[7] +
      '-' +
      hex[8] +
      hex[9] +
      '-' +
      hex[10] +
      hex[11] +
      hex[12] +
      hex[13] +
      hex[14] +
      hex[15]
    )
  }
  // Non‑crypto fallback (acceptable for temporary client IDs)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
