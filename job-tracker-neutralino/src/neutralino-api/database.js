import initSqlJs from 'sql.js'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company TEXT,
  title TEXT,
  role_id TEXT,
  location TEXT,
  saved_date TEXT,
  cleaned_text TEXT,
  raw_text TEXT,
  source TEXT
);
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT
);
`

export class JobDatabase {
  constructor() {
    this.db = null
    this.dbPath = null
    this.SQL = null
  }

  async init() {
    const dataPath = await Neutralino.os.getPath('data')
    const dbDir = await Neutralino.filesystem.getJoinedPath(dataPath, 'job-tracker')
    await this.ensureDirectory(dbDir)
    this.dbPath = await Neutralino.filesystem.getJoinedPath(dbDir, 'jobs.db')

    this.SQL = await initSqlJs({
      locateFile: () => './js/sql-wasm.wasm',
    })

    try {
      const buffer = await Neutralino.filesystem.readBinaryFile(this.dbPath)
      this.db = new this.SQL.Database(new Uint8Array(buffer))
    } catch {
      this.db = new this.SQL.Database()
    }

    this.db.run(SCHEMA)
    await this.migrateFromStorage()
    await this.persist()
  }

  async ensureDirectory(path) {
    try {
      const stats = await Neutralino.filesystem.getStats(path)
      if (!stats.isDirectory) {
        throw new Error('path exists but is not a directory')
      }
    } catch {
      await Neutralino.filesystem.createDirectory(path)
    }
  }

  async persist() {
    const data = this.db.export()
    await Neutralino.filesystem.writeBinaryFile(this.dbPath, data.buffer)
  }

  async migrateFromStorage() {
    if (this.getConfigValue('storage_migrated') === 'true') {
      return
    }

    try {
      const jobsData = await Neutralino.storage.getData('jobs')
      if (jobsData) {
        const jobs = JSON.parse(jobsData)
        for (const job of jobs) {
          this.insertJob(job, false)
        }
        await Neutralino.storage.removeData('jobs')
      }
    } catch (error) {
      if (error.code !== 'NE_ST_NOSTKEX') {
        throw error
      }
    }

    try {
      const configData = await Neutralino.storage.getData('config')
      if (configData) {
        const config = JSON.parse(configData)
        if (config.openRouterApiKey) {
          this.setConfigValue('openRouterApiKey', config.openRouterApiKey)
        }
        await Neutralino.storage.removeData('config')
      }
    } catch (error) {
      if (error.code !== 'NE_ST_NOSTKEX') {
        throw error
      }
    }

    this.setConfigValue('storage_migrated', 'true')
  }

  getAllJobs() {
    const stmt = this.db.prepare('SELECT * FROM jobs ORDER BY saved_date DESC')
    const jobs = []
    while (stmt.step()) {
      jobs.push(stmt.getAsObject())
    }
    stmt.free()
    return jobs
  }

  getJob(id) {
    const stmt = this.db.prepare('SELECT * FROM jobs WHERE id = ?')
    stmt.bind([id])
    const job = stmt.step() ? stmt.getAsObject() : null
    stmt.free()
    return job
  }

  insertJob(job, shouldPersist = true) {
    this.db.run(
      `INSERT OR REPLACE INTO jobs
        (id, company, title, role_id, location, saved_date, cleaned_text, raw_text, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job.id,
        job.company || '',
        job.title || '',
        job.role_id || '',
        job.location || '',
        job.saved_date,
        job.cleaned_text || '',
        job.raw_text || '',
        job.source || 'none',
      ],
    )
    if (shouldPersist) {
      return this.persist()
    }
  }

  async deleteJob(id) {
    this.db.run('DELETE FROM jobs WHERE id = ?', [id])
    await this.persist()
  }

  getConfig() {
    return { openRouterApiKey: this.getConfigValue('openRouterApiKey') || '' }
  }

  getConfigValue(key) {
    const stmt = this.db.prepare('SELECT value FROM config WHERE key = ?')
    stmt.bind([key])
    const value = stmt.step() ? stmt.getAsObject().value : null
    stmt.free()
    return value
  }

  setConfigValue(key, value) {
    this.db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, value])
  }

  async saveConfig(config) {
    if (config.openRouterApiKey !== undefined) {
      this.setConfigValue('openRouterApiKey', config.openRouterApiKey)
    }
    await this.persist()
  }
}
