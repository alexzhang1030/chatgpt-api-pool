import type { ChatMessage } from 'chatgpt'
import { ChatGPTAPI } from 'chatgpt'
import Queue from 'p-queue'
import type { ApiKey, Options } from './types'

export class Request {
  private api: ChatGPTAPI
  private queue: Queue
  private queueCount: number

  constructor(private key: ApiKey) {
    this.api = new ChatGPTAPI({
      apiKey: this.key,
    })
    // ChatGPT (not plus) is limited to 1 request one time.
    this.queue = new Queue({ concurrency: 1 })
    this.queueCount = 0
  }

  async request(
    message: string,
    options: Options = {},
  ) {
    this.queueCount += 1
    let response: ChatMessage
    await this.queue.add(async () => {
      response = await this.api.sendMessage(message, {
        ...options,
      })
    })
    this.queueCount -= 1
    return response!
  }

  getQueueCount() {
    return this.queueCount
  }
}
