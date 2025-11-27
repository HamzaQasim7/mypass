"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, Trash2, Edit2, Check } from "lucide-react"
import { getServiceIconUrl, getServiceColor } from "@/lib/service-icons"
import type { PasswordEntry } from "@/lib/storage"

interface PasswordItemProps {
  entry: PasswordEntry
  onEdit: (entry: PasswordEntry) => void
  onDelete: (id: string) => void
}

export function PasswordItem({ entry, onEdit, onDelete }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  const iconUrl = getServiceIconUrl(entry.service)
  const bgColor = getServiceColor(entry.service)

  return (
    <div className="group flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      {/* Service Icon - smaller */}
      <div
        className={`relative flex-shrink-0 w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center overflow-hidden`}
      >
        {!imgError ? (
          <img
            src={iconUrl || "/placeholder.svg"}
            alt={entry.service}
            width={20}
            height={20}
            className="rounded object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xs font-bold text-primary uppercase">{entry.service.charAt(0)}</span>
        )}
      </div>

      {/* Content - tighter spacing */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-xs text-foreground truncate leading-tight">{entry.service}</h3>
        <p className="text-[11px] text-muted-foreground truncate">{entry.username || entry.email}</p>
      </div>

      {/* Password Display - more compact */}
      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/50">
        <span className="font-mono text-[10px] text-foreground w-14 truncate">
          {showPassword ? entry.password : "••••••••"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword(!showPassword)}
          className="h-5 w-5 hover:bg-transparent hover:text-primary"
        >
          {showPassword ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
        </Button>
      </div>

      {/* Actions - smaller buttons */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(entry.password, "password")}
          className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
        >
          {copied === "password" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(entry)}
          className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(entry.id)}
          className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
