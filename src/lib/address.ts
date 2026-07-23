/** Remembered delivery address so patients don't retype it on every order. */

export const EMPTY_ADDRESS = {
  name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
}

export type Address = typeof EMPTY_ADDRESS

export function loadSavedAddress(): Address {
  try {
    const raw = localStorage.getItem('halftablet-address')
    if (raw) return { ...EMPTY_ADDRESS, ...JSON.parse(raw) }
  } catch {}
  return EMPTY_ADDRESS
}

export function saveAddress(address: Address) {
  try { localStorage.setItem('halftablet-address', JSON.stringify(address)) } catch {}
}
