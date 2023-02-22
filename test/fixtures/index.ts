import { RequestPool } from '../../src'
import data from '../test.json'

export const requestPool = new RequestPool(data.keys || [], data.emailConfig as any)
