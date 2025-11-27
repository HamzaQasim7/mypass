const AUTH_KEY = "safepass_auth"

export function setMasterPasscode(passcode: string): void {
  if (typeof window === "undefined") return
  // Hash the passcode (simple approach for demo)
  const hashed = btoa(passcode)
  localStorage.setItem(AUTH_KEY, hashed)
}

export function verifyPasscode(passcode: string): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(AUTH_KEY)
  if (!stored) return false
  return btoa(passcode) === stored
}

export function isAuthEnabled(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem(AUTH_KEY)
}

export function hasMasterPasscode(): boolean {
  return isAuthEnabled()
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_KEY)
}
