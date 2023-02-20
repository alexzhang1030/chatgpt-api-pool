import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const cwd = process.cwd()

export const writeKeysInfo = async (nsfKeys: string[], validKeys: string[]) => {
  await writeFile(resolve(cwd, './keys.json'), JSON.stringify({ nsfKeys, validKeys }, null, 2))
}
