# ChatGPT API Pool

Build your own ChatGPT with a request pool.

## Usage

```ts
const API_KEYS = ['...', '...']
const requestPool = new RequestPool(API_KEYS)
const response: {
  success: boolean
  message: ChatMessage /* from chat-gpt */
  error: Enum
} = await requestPool.sendMessage(q)
```
