import type { ChatGPTError, ChatMessage } from 'chatgpt'
import * as nodemailer from 'nodemailer'
import consola from 'consola'
import { Request } from './request'
import type { ApiKey, EmailConfig, ErrorAction, Options, Response } from './types'
import { ErrorType } from './types'

const handleError = (error: ChatGPTError): ErrorAction => {
  let action: ErrorAction
  switch (error.statusCode) {
    case 429:
      action = 'next'
      break
    default:
      action = 'error'
  }
  return action
}

export class RequestPool {
  private pool: Map<ApiKey, Request> = new Map()
  private emailTransporter: nodemailer.Transporter | null = null
  private nsf_keys: string[] = []
  constructor(private keys: ApiKey[], private emailConfig?: EmailConfig) {
    for (const key of this.keys)
      this.pool.set(key, new Request(key))
    if (emailConfig)
      nodemailer.createTransport(emailConfig.serverConfig)
  }

  sendMessage = async (message: string, options?: Options): Promise<Response> => {
    if (!this.keys.length) {
      return {
        success: false,
        response: null,
        error: ErrorType.NO_VALID_KEYS,
      }
    }
    const key = this.keys[Math.floor(Math.random() * this.keys.length)]
    const request = this.pool.get(key)
    let response: ChatMessage
    if (!request)
      throw new Error('Request not found')
    try {
      response = await request.request(message, options)
    }
    catch (error) {
      const action = handleError((error as ChatGPTError))
      if (action === 'error') {
        consola.error((error as { message: string }).message)
      }
      else {
        this.processNsfKey(key)
        return await this.sendMessage(message, options)
      }
    }
    return {
      success: true,
      response: response!,
      error: null,
    }
  }

  processNsfKey(key: string) {
    this.keys = this.keys.filter(k => k !== key)
    this.nsf_keys.push(key)
    this.pool.delete(key)
    this.notifyNsfKeys(key)
  }

  notifyNsfKeys(key: string) {
    if (!this.emailConfig)
      return
    if (!this.emailTransporter)
      this.emailTransporter = nodemailer.createTransport(this.emailConfig.serverConfig)
    this.emailTransporter.sendMail({
      from: this.emailConfig.serverConfig.auth.user,
      to: this.emailConfig.targetEmail,
      subject: 'OpenAI Key 余额不足',
      text: `Key: ${key}`,
    })
  }
}

export type { EmailConfig, ErrorType, Response, Options } from './types'
