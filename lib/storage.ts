import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "safepass_passwords"
const ENCRYPTION_KEY = "safepass_master"

export interface PasswordEntry {
  id: string
  service: string
  username: string
  email: string
  password: string
  notes: string
  createdAt: number
  updatedAt: number
}

// Simple XOR encryption for client-side protection
function simpleEncrypt(text: string, key: string): string {
  return btoa(
    String.fromCharCode(...text.split("").map((char, i) => char.charCodeAt(0) ^ key[i % key.length].charCodeAt(0))),
  )
}

function simpleDecrypt(encoded: string, key: string): string {
  try {
    const text = atob(encoded)
    return String.fromCharCode(
      ...text.split("").map((char, i) => char.charCodeAt(0) ^ key[i % key.length].charCodeAt(0)),
    )
  } catch {
    return ""
  }
}

// Local storage functions (fallback)
export function getLocalPasswords(): PasswordEntry[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const decrypted = simpleDecrypt(stored, ENCRYPTION_KEY)
    return JSON.parse(decrypted) || []
  } catch {
    return []
  }
}

export function saveLocalPasswords(passwords: PasswordEntry[]): void {
  if (typeof window === "undefined") return
  const encrypted = simpleEncrypt(JSON.stringify(passwords), ENCRYPTION_KEY)
  localStorage.setItem(STORAGE_KEY, encrypted)
}

// Supabase cloud sync functions
export async function getCloudPasswords(): Promise<PasswordEntry[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase.from("passwords").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching passwords:", error)
    return []
  }

  return data.map((p) => ({
    id: p.id,
    service: p.service,
    username: p.username || "",
    email: p.email || "",
    password: p.password,
    notes: p.notes || "",
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
  }))
}

export async function addCloudPassword(
  entry: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">,
): Promise<PasswordEntry | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("passwords")
    .insert({
      user_id: user.id,
      service: entry.service,
      username: entry.username,
      email: entry.email,
      password: entry.password,
      notes: entry.notes,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding password:", error)
    return null
  }

  return {
    id: data.id,
    service: data.service,
    username: data.username || "",
    email: data.email || "",
    password: data.password,
    notes: data.notes || "",
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

export async function updateCloudPassword(
  id: string,
  updates: Partial<Omit<PasswordEntry, "id" | "createdAt">>,
): Promise<PasswordEntry | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("passwords")
    .update({
      service: updates.service,
      username: updates.username,
      email: updates.email,
      password: updates.password,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating password:", error)
    return null
  }

  return {
    id: data.id,
    service: data.service,
    username: data.username || "",
    email: data.email || "",
    password: data.password,
    notes: data.notes || "",
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

export async function deleteCloudPassword(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("passwords").delete().eq("id", id)

  if (error) {
    console.error("Error deleting password:", error)
    return false
  }

  return true
}

export async function searchCloudPasswords(query: string): Promise<PasswordEntry[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("passwords")
    .select("*")
    .or(`service.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching passwords:", error)
    return []
  }

  return data.map((p) => ({
    id: p.id,
    service: p.service,
    username: p.username || "",
    email: p.email || "",
    password: p.password,
    notes: p.notes || "",
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
  }))
}

// Legacy functions for backward compatibility
export function getPasswords(): PasswordEntry[] {
  return getLocalPasswords()
}

export function savePasswords(passwords: PasswordEntry[]): void {
  saveLocalPasswords(passwords)
}

export function addPassword(entry: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">): PasswordEntry {
  const passwords = getLocalPasswords()
  const newEntry: PasswordEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  passwords.push(newEntry)
  saveLocalPasswords(passwords)
  return newEntry
}

export function updatePassword(
  id: string,
  updates: Partial<Omit<PasswordEntry, "id" | "createdAt">>,
): PasswordEntry | null {
  const passwords = getLocalPasswords()
  const index = passwords.findIndex((p) => p.id === id)
  if (index === -1) return null

  passwords[index] = {
    ...passwords[index],
    ...updates,
    updatedAt: Date.now(),
  }
  saveLocalPasswords(passwords)
  return passwords[index]
}

export function deletePassword(id: string): boolean {
  const passwords = getLocalPasswords()
  const index = passwords.findIndex((p) => p.id === id)
  if (index === -1) return false

  passwords.splice(index, 1)
  saveLocalPasswords(passwords)
  return true
}

export function searchPasswords(query: string): PasswordEntry[] {
  const passwords = getLocalPasswords()
  const lowerQuery = query.toLowerCase()
  return passwords.filter(
    (p) =>
      p.service.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      p.email.toLowerCase().includes(lowerQuery),
  )
}
