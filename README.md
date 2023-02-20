# ChatGPT API Pool

Build your own ChatGPT with a request pool.

## Usage

```ts
const API_KEYS = ['...', '...']
const requestPool = new RequestPool(API_KEYS)
const response = await requestPool.sendMessage(q)
```
