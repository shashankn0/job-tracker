const EXTENSION_ID = 'com.jobtracker.sqlite'
const RESPONSE_EVENT = 'jobtracker.sqlite.response'

export class SqliteClient {
  constructor() {
    this.callId = 0
  }

  async waitForExtension(timeoutMs = 15000) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const stats = await Neutralino.extensions.getStats()
      if (stats.connected.includes(EXTENSION_ID)) {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error('SQLite extension not connected. Rebuild with: npm run build:extension')
  }

  async call(event, data) {
    await this.waitForExtension()
    const callId = this.callId++

    return new Promise((resolve, reject) => {
      const listener = (ev) => {
        if (ev.detail._respId !== callId) {
          return
        }
        Neutralino.events.off(RESPONSE_EVENT, listener)
        if (ev.detail.error) {
          reject(new Error(ev.detail.error))
        } else {
          resolve(ev.detail)
        }
      }

      Neutralino.events.on(RESPONSE_EVENT, listener)

      Neutralino.extensions
        .dispatch(EXTENSION_ID, event, {
          ...data,
          _respId: callId,
          _respEvent: RESPONSE_EVENT,
        })
        .catch((error) => {
          Neutralino.events.off(RESPONSE_EVENT, listener)
          reject(error)
        })
    })
  }

  async query(sql, params = []) {
    const result = await this.call('query', { sql, params })
    return result.rows || []
  }

  async exec(sql, params = []) {
    await this.call('exec', { sql, params })
  }
}
