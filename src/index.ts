import type { ChatGPTError, ChatGPTErrorType, ChatMessage } from 'chatgpt'
import consola from 'consola'
import { Request } from './request'
import type { ApiKey, ErrorAction, Options } from './types'
import { writeKeysInfo } from './helper'

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
  // 余额不足的 key
  private nsf_keys: string[] = []
  constructor(private keys: ApiKey[]) {
    for (const key of this.keys)
      this.pool.set(key, new Request(key))
  }

  async sendMessage(message: string, options?: Options): Promise<ChatMessage> {
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
    return response!
  }

  processNsfKey(key: string) {
    this.keys = this.keys.filter(k => k !== key)
    this.nsf_keys.push(key)
    this.pool.delete(key)
    writeKeysInfo(this.nsf_keys, this.keys)
  }
}
