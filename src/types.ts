import type { ChatMessage, SendMessageOptions } from 'chatgpt'

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
