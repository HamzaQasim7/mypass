"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowRight } from "lucide-react"
import { verifyPasscode, setMasterPasscode } from "@/lib/auth"

interface AuthScreenProps {
  onSuccess: () => void
  isSetup?: boolean
}

export function AuthScreen({ onSuccess, isSetup = false }: AuthScreenProps) {
  const [passcode, setPasscode] = useState("")
  const [confirmPasscode, setConfirmPasscode] = useState("")
  const [error, setError] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.length < 4) {
      setError("Passcode must be at least 4 digits")
      return
    }
    if (!showConfirm) {
      setShowConfirm(true)
      setError("")
      return
    }
    if (passcode !== confirmPasscode) {
      setError("Passcodes do not match")
      setShowConfirm(false)
      setConfirmPasscode("")
      return
    }
    setMasterPasscode(passcode)
    onSuccess()
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyPasscode(passcode)) {
      setError("Invalid passcode")
      return
    }
    onSuccess()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 font-sans">SafePass</h1>
          <p className="text-muted-foreground text-lg">{isSetup ? "Secure your passwords" : "Welcome back"}</p>
        </div>

        <form onSubmit={isSetup ? handleSetup : handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              {showConfirm ? "Confirm Passcode" : "Master Passcode"}
            </label>
            <Input
              type="password"
              placeholder="Enter 4+ digits"
              value={showConfirm ? confirmPasscode : passcode}
              onChange={(e) => (showConfirm ? setConfirmPasscode(e.target.value) : setPasscode(e.target.value))}
              maxLength={8}
              className="text-center text-xl tracking-widest h-12 font-semibold border-2 focus:border-primary"
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300"
            size="lg"
          >
            {isSetup ? (showConfirm ? "Confirm & Continue" : "Continue") : "Unlock"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8 font-medium">
          ✓ End-to-end encrypted • ✓ Never stored online
        </p>
      </div>
    </div>
  )
}
