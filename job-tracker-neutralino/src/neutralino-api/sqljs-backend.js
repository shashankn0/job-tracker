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

export class SqlJsBackend {
  constructor() {
    this.db = null
    this.dbPath = null
  }

  async init(dbPath) {
    this.dbPath = dbPath

    const SQL = await initSqlJs({
      locateFile: () => './js/sql-wasm.wasm',
    })

    try {
      const buffer = await Neutralino.filesystem.readBinaryFile(dbPath)
      this.db = new SQL.Database(new Uint8Array(buffer))
    } catch {
      this.db = new SQL.Database()
    }

    this.db.run(SCHEMA)
    await this.persist()
  }

  async persist() {
    const data = this.db.export()
    await Neutralino.filesystem.writeBinaryFile(this.dbPath, data.buffer)
  }

  async getAllJobs() {
    const stmt = this.db.prepare('SELECT * FROM jobs ORDER BY saved_date DESC')
    const jobs = []
    while (stmt.step()) {
      jobs.push(stmt.getAsObject())
    }
    stmt.free()
    return jobs
  }

  async getJob(id) {
    const stmt = this.db.prepare('SELECT * FROM jobs WHERE id = ?')
    stmt.bind([id])
    const job = stmt.step() ? stmt.getAsObject() : null
    stmt.free()
    return job
  }

  async insertJob(job) {
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
    await this.persist()
  }

  async deleteJob(id) {
    this.db.run('DELETE FROM jobs WHERE id = ?', [id])
    await this.persist()
  }

  async getConfigValue(key) {
    const stmt = this.db.prepare('SELECT value FROM config WHERE key = ?')
    stmt.bind([key])
    const value = stmt.step() ? stmt.getAsObject().value : null
    stmt.free()
    return value
  }

  async setConfigValue(key, value) {
    this.db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, value])
    await this.persist()
  }
}
