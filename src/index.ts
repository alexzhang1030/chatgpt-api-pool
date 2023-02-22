import type { ChatGPTError, ChatGPTErrorType, ChatMessage } from 'chatgpt'
import consola from 'consola'
import * as nodemailer from 'nodemailer'
import { Request } from './request'
import type { ApiKey, EmailConfig, ErrorAction, Options, Response } from './types'
import { ErrorType } from './types'

const handleError = (type: ChatGPTErrorType | /* 余额不足 */'insufficient_quota'): ErrorAction => {
  let action: ErrorAction
  switch (type) {
    case 'chatgpt:pool:rate-limit':
    case 'chatgpt:pool:timeout':
    case 'chatgpt:pool:unavailable':
    case 'insufficient_quota':
      action = 'next'
      break
    case 'chatgpt:pool:account-not-found':
    case 'chatgpt:pool:account-on-cooldown':
    case 'chatgpt:pool:no-accounts':
    default:
      action = 'next'
  }
  return action
}

export class RequestPool {
  private pool: Map<ApiKey, Request> = new Map()
  private emailTransporter: nodemailer.Transporter | null = null
  // 余额不足的 key
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
      const action = handleError((error as ChatGPTError).type!)
      if (action === 'error') {
        consola.error((error as ChatGPTError).message)
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
      subject: 'Open AI Key 余额不足',
      text: `Key: ${key}`,
    })
  }
}

export type { EmailConfig, ErrorType, Response, Options } from './types'
