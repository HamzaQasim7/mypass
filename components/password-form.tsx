"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Zap, ArrowRight } from "lucide-react"
import { PasswordGeneratorModal } from "./password-generator-modal"
import type { PasswordEntry } from "@/lib/storage"

interface PasswordFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">) => void
  initialData?: PasswordEntry
}

export function PasswordForm({ open, onClose, onSubmit, initialData }: PasswordFormProps) {
  const [service, setService] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [notes, setNotes] = useState("")
  const [generatorOpen, setGeneratorOpen] = useState(false)

  useEffect(() => {
    if (initialData) {
      setService(initialData.service)
      setUsername(initialData.username)
      setEmail(initialData.email)
      setPassword(initialData.password)
      setNotes(initialData.notes)
    } else {
      resetForm()
    }
  }, [initialData, open])

  const resetForm = () => {
    setService("")
    setUsername("")
    setEmail("")
    setPassword("")
    setNotes("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !password || (!username && !email)) {
      alert("Please fill in service, password, and at least username or email")
      return
    }

    onSubmit({
      service: service.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      notes: notes.trim(),
    })
    resetForm()
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{initialData ? "Edit Password" : "Add New Password"}</DialogTitle>
            <DialogDescription>
              {initialData ? "Update your saved credentials" : "Save a new password securely"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Service/Website *</label>
              <Input
                placeholder="e.g., Gmail, Netflix, Bank"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="h-11 rounded-lg border-2 border-border focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Username</label>
              <Input
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-lg border-2 border-border focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-2 border-border focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Password *</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter or generate password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-2 border-border focus:border-primary transition-all duration-300 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setGeneratorOpen(true)}
                  title="Generate password"
                  className="h-11 w-11 rounded-lg border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <Zap className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Notes (Optional)</label>
              <textarea
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-300"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg h-11 border-2 bg-transparent"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-lg h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {initialData ? "Update" : "Save"} Password
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onSelect={(pwd) => setPassword(pwd)}
      />
    </>
  )
}
