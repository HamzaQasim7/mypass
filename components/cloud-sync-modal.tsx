"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Cloud, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from "lucide-react"

interface CloudSyncModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  localPasswordCount: number
}

export function CloudSyncModal({ open, onClose, onSuccess, localPasswordCount }: CloudSyncModalProps) {
  const [mode, setMode] = useState<"choice" | "login" | "signup">("choice")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  const resetState = () => {
    setMode("choice")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-2">
            <Cloud className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center">Enable Cloud Sync</DialogTitle>
          <DialogDescription className="text-center">
            {mode === "choice" && "Sync your passwords across all your devices securely."}
            {mode === "login" && "Sign in to your SafePass cloud account."}
            {mode === "signup" && "Create a new SafePass cloud account."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to <strong>{email}</strong>. Click the link to activate cloud sync.
            </p>
            <Button onClick={handleClose} className="mt-4 w-full">
              Got it
            </Button>
          </div>
        ) : mode === "choice" ? (
          <div className="space-y-4 py-2">
            {localPasswordCount > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  You have <strong>{localPasswordCount}</strong> local password{localPasswordCount !== 1 ? "s" : ""}.
                  They will be automatically uploaded when you enable cloud sync.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={() => setMode("signup")} className="w-full h-11 justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => setMode("login")} variant="outline" className="w-full h-11 justify-between">
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />I already have an account
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your passwords are encrypted and only you can access them.
            </p>
          </div>
        ) : (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-10"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choice")} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
