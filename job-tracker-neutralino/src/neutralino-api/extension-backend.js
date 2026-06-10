import { SqliteClient } from './sqlite-client.js'

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

export class ExtensionBackend {
  constructor() {
    this.sqlite = new SqliteClient()
  }

  async init() {
    await this.sqlite.waitForExtension(5000)
    await this.sqlite.exec(SCHEMA)
  }

  async getAllJobs() {
    return this.sqlite.query('SELECT * FROM jobs ORDER BY saved_date DESC')
  }

  async getJob(id) {
    const rows = await this.sqlite.query('SELECT * FROM jobs WHERE id = ?', [id])
    return rows[0] || null
  }

  async insertJob(job) {
    await this.sqlite.exec(
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
  }

  async deleteJob(id) {
    await this.sqlite.exec('DELETE FROM jobs WHERE id = ?', [id])
  }

  async getConfigValue(key) {
    const rows = await this.sqlite.query('SELECT value FROM config WHERE key = ?', [key])
    return rows[0]?.value ?? null
  }

  async setConfigValue(key, value) {
    await this.sqlite.exec('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, value])
  }
}
