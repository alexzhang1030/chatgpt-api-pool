# ChatGPT API Pool

Build your own ChatGPT with a request pool.

## Usage

```ts
const API_KEYS = ['...', '...']
const EMAIL_CONFIG = {
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
// EMAIL_CONFIG 非必填, 用于邮箱提醒余额不足的 key
const requestPool = new RequestPool(API_KEYS, EMAIL_CONFIG)
const response: {
  success: boolean
  message: ChatMessage /* from chatgpt library */
  error: ErrorType
} = await requestPool.sendMessage(q)
```

## ErrorType

```ts
enum ErrorType {
  // 无可用 key
  NO_VALID_KEYS = 'no_valid_keys',
}
```