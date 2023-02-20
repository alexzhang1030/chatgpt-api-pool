import type { ChatGPTError, ChatGPTErrorType, ChatMessage } from 'chatgpt'
import consola from 'consola'
import { Request } from './request'
import type { ApiKey, ErrorAction, Options } from './types'

const handleError = (type: ChatGPTErrorType): ErrorAction => {
  switch (type) {
    case 'chatgpt:pool:rate-limit':
    case 'chatgpt:pool:timeout':
    case 'chatgpt:pool:unavailable':
      return 'next'
    case 'chatgpt:pool:account-not-found':
    case 'chatgpt:pool:account-on-cooldown':
    case 'chatgpt:pool:no-accounts':
    default:
      return 'error'
  }
}

export class RequestPool {
  private pool: Map<ApiKey, Request> = new Map()
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
        consola.error(error)
      }
      else {
        consola.error(error)
        this.pool.delete(key)
        return await this.sendMessage(message, options)
      }
    }
    return response!
  }
}
