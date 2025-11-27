export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

export function generatePassword(options: PasswordOptions): string {
  let characters = ""

  if (options.includeLowercase) characters += LOWERCASE
  if (options.includeUppercase) characters += UPPERCASE
  if (options.includeNumbers) characters += NUMBERS
  if (options.includeSymbols) characters += SYMBOLS

  if (!characters) characters = LOWERCASE

  let password = ""
  for (let i = 0; i < options.length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return password
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak"

  let score = 0
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (password.length >= 16 && score >= 3) return "strong"
  if (score >= 3) return "medium"
  return "weak"
}
