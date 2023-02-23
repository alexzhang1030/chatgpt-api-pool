# ChatGPT API Pool

Build your own ChatGPT with a request pool.

> NOTICE: due to `chatgpt` dependency does not support `CJS`, so this library does not work properly in `CJS` environment, use it on your own risk, recommend to use `ESM`.

## Usage

```ts
const API_KEYS = ['...', '...']
const EMAIL_CONFIG = {
  // Here is a documentation about QQ email：https://www.ujcms.com/documentation/351.html
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
// EMAIL_CONFIG is optional, to provide email notification when key is exhausted
const requestPool = new RequestPool(API_KEYS, EMAIL_CONFIG)
const response: {
  success: boolean
  message: ChatMessage /* from chatgpt library */
  error: ErrorType
} = await requestPool.sendMessage(q, options) // options, see https://github.com/transitive-bullshit/chatgpt-api/blob/main/src/types.ts#L5-L15
```

## ErrorType

```ts
enum ErrorType {
  NO_VALID_KEYS = 'no_valid_keys',
}
```