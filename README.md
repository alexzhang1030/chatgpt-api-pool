# ChatGPT API Pool

Build your own ChatGPT with a request pool.

## Usage

```ts
const API_KEYS = ['...', '...']
const EMAIL_CONFIG = {
  serverConfig: {
    emailConfig: {
      // 这有一份关于 QQ 邮箱的说明：https://www.ujcms.com/documentation/351.html
      serverConfig: {
        host: 'smtp.xx.com',
        port: 465,
        secure: true,
        auth: {
          user: 'xxx',
          pass: 'xxx'
        }
      },
      targetEmail: 'xxx@qq.com'
    }
  }
}
// EMAIL_CONFIG 非必填, 用于邮箱提醒余额不足的 key
const requestPool = new RequestPool(API_KEYS, EMAIL_CONFIG)
const response: {
  success: boolean
  message: ChatMessage /* from chat-gpt */
  error: Enum
} = await requestPool.sendMessage(q)
```
