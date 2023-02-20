import { requestPool } from './fixtures'

const questions = [
  'What\'s your name?',
  'Give me a number',
  // 'Write a love letter by Chinese',
]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('RequestPool', () => {
  it('should be defined', () => {
    expect(requestPool).toBeDefined()
  })
  it('request', async () => {
    for (const q of questions) {
      await sleep(100)
      const response = await requestPool.sendMessage(q)
      // eslint-disable-next-line no-console
      console.log({
        response,
      })
    }
  })
})
