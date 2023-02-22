import type { ChatMessage, SendMessageOptions } from 'chatgpt'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

export type ApiKey = string

export type Options = SendMessageOptions

export type ErrorAction = 'error' | 'next'

export enum ErrorType {
  NO_VALID_KEYS = 'no_valid_keys',
}

export interface Response {
  success: boolean
  response: ChatMessage | null
  error: ErrorType | null
}

export interface EmailConfig {
  serverConfig: SMTPTransport
  targetEmail: string
}
