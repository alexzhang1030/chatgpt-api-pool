import type { ChatMessage } from 'chatgpt'
import { ChatGPTAPI } from 'chatgpt'
import Keyv from 'keyv'
import Queue from 'p-queue'
import type { ApiKey, Options } from './types'

const messageStore = new Keyv()

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
    let endFlag = false
    let response: ChatMessage
    await this.queue.add(async () => {
      try {
        response = await this.api.sendMessage(message, {
          ...options,
          onProgress: options.messageId
            ? async (partialResponse) => {
              await messageStore.set(options.messageId!, {
                ...partialResponse,
                status: endFlag ? 'done' : 'pending',
              }, /* 30 mins */ 30 * 60 * 1000)
              options.onProgress ? options.onProgress(partialResponse) : (() => {})()
            }
            : undefined,
        })
      }
      catch (err) {
        if (options.messageId) {
          await messageStore.set(options.messageId!, {
            status: 'error',
            error: err,
          }, /* 30 mins */ 30 * 60 * 1000)
        }
        throw err
      }
    })
    this.queueCount -= 1
    endFlag = true
    return response!
  }

  getQueueCount() {
    return this.queueCount
  }
}
