"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Copy, RefreshCw, Check } from "lucide-react"
import { generatePassword, getPasswordStrength } from "@/lib/password-generator"

interface PasswordGeneratorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (password: string) => void
}

export function PasswordGeneratorModal({ open, onClose, onSelect }: PasswordGeneratorModalProps) {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const generateNew = () => {
    const password = generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    })
    setGeneratedPassword(password)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = getPasswordStrength(generatedPassword)
  const strengthColor =
    strength === "strong" ? "text-secondary" : strength === "medium" ? "text-yellow-500" : "text-destructive"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Generate Strong Password</DialogTitle>
          <DialogDescription>Create a secure password with custom options</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Generated Password</label>
            <div className="flex gap-2">
              <Input
                value={generatedPassword}
                readOnly
                className="font-mono text-sm h-11 rounded-lg border-2 border-primary/30 bg-primary/5 text-center font-semibold tracking-wider"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="h-11 w-11 rounded-lg border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300 bg-transparent"
              >
                {copied ? <Check className="w-5 h-5 text-secondary" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
            {generatedPassword && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-muted-foreground font-medium">
                  Strength:{" "}
                  <span className={`font-bold capitalize ${strengthColor}`}>
                    {strength === "weak" && "🔴 Weak"}
                    {strength === "medium" && "🟡 Medium"}
                    {strength === "strong" && "🟢 Strong"}
                  </span>
                </span>
              </div>
            )}
            {copied && <p className="text-xs font-semibold text-secondary">✓ Copied to clipboard!</p>}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-foreground">Password Length</label>
              <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>8</span>
              <span>32</span>
            </div>
          </div>

          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/30">
            <label className="block text-sm font-semibold text-foreground">Include</label>
            <div className="space-y-2.5">
              {[
                { id: "uppercase", label: "Uppercase (A-Z)", state: includeUppercase, setState: setIncludeUppercase },
                { id: "lowercase", label: "Lowercase (a-z)", state: includeLowercase, setState: setIncludeLowercase },
                { id: "numbers", label: "Numbers (0-9)", state: includeNumbers, setState: setIncludeNumbers },
                { id: "symbols", label: "Symbols (!@#$%^&*)", state: includeSymbols, setState: setIncludeSymbols },
              ].map(({ id, label, state, setState }) => (
                <div key={id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    id={id}
                    checked={state}
                    onCheckedChange={(checked) => setState(checked === true)}
                    className="w-5 h-5 rounded border-2"
                  />
                  <label htmlFor={id} className="text-sm font-medium cursor-pointer flex-1">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-lg h-11 border-2 font-semibold bg-transparent"
              onClick={generateNew}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate
            </Button>
            <Button
              className="flex-1 rounded-lg h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                if (generatedPassword) {
                  onSelect(generatedPassword)
                  onClose()
                }
              }}
              disabled={!generatedPassword}
            >
              Use This
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
