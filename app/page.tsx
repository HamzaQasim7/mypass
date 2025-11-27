"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthScreen } from "@/components/auth-screen"
import { PasswordForm } from "@/components/password-form"
import { PasswordItem } from "@/components/password-item"
import { CloudSyncModal } from "@/components/cloud-sync-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Moon, Sun, Shield, Cloud, CloudOff, RefreshCw, Loader2 } from "lucide-react"
import { hasMasterPasscode } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import {
  getLocalPasswords,
  saveLocalPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  searchPasswords,
  getCloudPasswords,
  addCloudPassword,
  updateCloudPassword,
  deleteCloudPassword,
  searchCloudPasswords,
  type PasswordEntry,
} from "@/lib/storage"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSetup, setIsSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState(false)

  // Cloud sync state
  const [cloudUser, setCloudUser] = useState<{ email?: string } | null>(null)
  const [isCloudEnabled, setIsCloudEnabled] = useState(false)

  // Check cloud sync status
  const checkCloudSync = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCloudUser({ email: user.email })
      setIsCloudEnabled(true)
      return true
    }
    return false
  }, [])

  // Load passwords (from cloud if enabled, otherwise local)
  const loadPasswords = useCallback(async () => {
    if (isCloudEnabled) {
      const data = await getCloudPasswords()
      setPasswords(data)
    } else {
      const data = getLocalPasswords()
      setPasswords(data)
    }
  }, [isCloudEnabled])

  useEffect(() => {
    const hasPasscode = hasMasterPasscode()
    setIsSetup(!hasPasscode)
    setLoading(false)

    const isDark =
      localStorage.getItem("safepass_dark") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches
    setDarkMode(isDark)
    applyDarkMode(isDark)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      checkCloudSync().then((hasCloud) => {
        if (hasCloud) {
          loadPasswords()
        } else {
          setPasswords(getLocalPasswords())
        }
      })
    }
  }, [isAuthenticated, checkCloudSync, loadPasswords])

  const handleSync = async () => {
    setSyncing(true)
    await loadPasswords()
    setSyncing(false)
  }

  const handleCloudSyncEnabled = async () => {
    // After user logs in via cloud sync modal
    const hasCloud = await checkCloudSync()
    if (hasCloud) {
      // Migrate local passwords to cloud
      const localPasswords = getLocalPasswords()
      if (localPasswords.length > 0) {
        for (const pwd of localPasswords) {
          await addCloudPassword({
            service: pwd.service,
            username: pwd.username,
            email: pwd.email,
            password: pwd.password,
            notes: pwd.notes,
          })
        }
        // Clear local after migration
        saveLocalPasswords([])
      }
      await loadPasswords()
    }
    setCloudSyncModalOpen(false)
  }

  const handleDisableCloudSync = async () => {
    if (
      confirm("Disable cloud sync? Your passwords will stay in the cloud but you'll use local storage going forward.")
    ) {
      const supabase = createClient()
      await supabase.auth.signOut()
      setCloudUser(null)
      setIsCloudEnabled(false)
      setPasswords(getLocalPasswords())
    }
  }

  const handleAddPassword = async (data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">) => {
    if (isCloudEnabled) {
      const newEntry = await addCloudPassword(data)
      if (newEntry) {
        setPasswords([newEntry, ...passwords])
      }
    } else {
      const newEntry = addPassword(data)
      setPasswords([newEntry, ...passwords])
    }
    setFormOpen(false)
  }

  const handleEditPassword = async (data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">) => {
    if (!editingEntry) return
    if (isCloudEnabled) {
      const updated = await updateCloudPassword(editingEntry.id, data)
      if (updated) {
        setPasswords(passwords.map((p) => (p.id === editingEntry.id ? updated : p)))
      }
    } else {
      const updated = updatePassword(editingEntry.id, data)
      if (updated) {
        setPasswords(passwords.map((p) => (p.id === editingEntry.id ? updated : p)))
      }
    }
    setEditingEntry(null)
    setFormOpen(false)
  }

  const handleDeletePassword = async (id: string) => {
    if (confirm("Are you sure you want to delete this password?")) {
      if (isCloudEnabled) {
        const success = await deleteCloudPassword(id)
        if (success) {
          setPasswords(passwords.filter((p) => p.id !== id))
        }
      } else {
        const success = deletePassword(id)
        if (success) {
          setPasswords(passwords.filter((p) => p.id !== id))
        }
      }
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      if (isCloudEnabled) {
        const results = await searchCloudPasswords(query)
        setPasswords(results)
      } else {
        const results = searchPasswords(query)
        setPasswords(results)
      }
    } else {
      loadPasswords()
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    applyDarkMode(newDarkMode)
    localStorage.setItem("safepass_dark", String(newDarkMode))
  }

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen onSuccess={() => setIsAuthenticated(true)} isSetup={isSetup} />
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">SafePass</h1>
                <button
                  onClick={() => (isCloudEnabled ? handleDisableCloudSync() : setCloudSyncModalOpen(true))}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  {isCloudEnabled ? (
                    <>
                      <Cloud className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400 truncate max-w-[100px]">
                        {cloudUser?.email}
                      </span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Local Only</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {isCloudEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSync}
                  disabled={syncing}
                  className="h-8 w-8 rounded-lg"
                >
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              )}
              {!isCloudEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCloudSyncModalOpen(true)}
                  className="h-8 w-8 rounded-lg"
                >
                  <Cloud className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 rounded-lg">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-9 rounded-xl bg-muted/50 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Button
          onClick={() => {
            setEditingEntry(null)
            setFormOpen(true)
          }}
          className="w-full mb-4 h-11 text-sm font-semibold rounded-xl shadow-md active:scale-[0.98] transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Password
        </Button>

        {passwords.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted mb-3">
              {searchQuery ? (
                <Search className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Shield className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground font-medium text-sm">
              {searchQuery ? "No passwords found" : "Your vault is empty"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {!searchQuery && "Add your first password to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {passwords.length} password{passwords.length !== 1 ? "s" : ""}
              {isCloudEnabled ? " (synced)" : " (local)"}
            </p>
            {passwords.map((entry) => (
              <PasswordItem
                key={entry.id}
                entry={entry}
                onEdit={(entry) => {
                  setEditingEntry(entry)
                  setFormOpen(true)
                }}
                onDelete={handleDeletePassword}
              />
            ))}
          </div>
        )}
      </div>

      <PasswordForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingEntry(null)
        }}
        onSubmit={editingEntry ? handleEditPassword : handleAddPassword}
        initialData={editingEntry || undefined}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        open={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
        onSuccess={handleCloudSyncEnabled}
        localPasswordCount={getLocalPasswords().length}
      />
    </div>
  )
}
