import { ExtensionBackend } from './extension-backend.js'
import { SqlJsBackend } from './sqljs-backend.js'

const CONFIG_STORAGE_KEY = 'config'

export class JobDatabase {
  constructor() {
    this.backend = null
    this.backendType = null
    this.dbPath = null
  }

  async init() {
    const dataPath = await Neutralino.os.getPath('data')
    const dbDir = await Neutralino.filesystem.getJoinedPath(dataPath, 'job-tracker')
    await this.ensureDirectory(dbDir)
    this.dbPath = await Neutralino.filesystem.getJoinedPath(dbDir, 'jobs.db')

    const extensionBackend = new ExtensionBackend()
    try {
      await extensionBackend.init()
      this.backend = extensionBackend
      this.backendType = 'extension'
      console.log('Using native SQLite extension')
    } catch (error) {
      console.warn('SQLite extension unavailable, using sql.js fallback:', error.message)
      const sqlJsBackend = new SqlJsBackend()
      await sqlJsBackend.init(this.dbPath)
      this.backend = sqlJsBackend
      this.backendType = 'sqljs'
    }

    await this.migrateFromStorage()
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

  getDbPath() {
    return this.dbPath
  }

  getBackendType() {
    return this.backendType
  }

  async migrateFromStorage() {
    const migrated = await this.getConfigValue('storage_migrated')
    if (migrated === 'true') {
      return
    }

    try {
      const jobsData = await Neutralino.storage.getData('jobs')
      if (jobsData) {
        const jobs = JSON.parse(jobsData)
        for (const job of jobs) {
          await this.insertJob(job)
        }
        await Neutralino.storage.removeData('jobs')
      }
    } catch (error) {
      if (error.code !== 'NE_ST_NOSTKEX') {
        throw error
      }
    }

    try {
      const configData = await Neutralino.storage.getData(CONFIG_STORAGE_KEY)
      if (configData) {
        const config = JSON.parse(configData)
        if (config.openRouterApiKey) {
          await this.setConfigValue('openRouterApiKey', config.openRouterApiKey)
        }
        await Neutralino.storage.removeData(CONFIG_STORAGE_KEY)
      }
    } catch (error) {
      if (error.code !== 'NE_ST_NOSTKEX') {
        throw error
      }
    }

    await this.setConfigValue('storage_migrated', 'true')
  }

  async getAllJobs() {
    return this.backend.getAllJobs()
  }

  async getJob(id) {
    return this.backend.getJob(id)
  }

  async insertJob(job) {
    await this.backend.insertJob(job)
  }

  async deleteJob(id) {
    await this.backend.deleteJob(id)
  }

  async getConfig() {
    let openRouterApiKey = (await this.getConfigValue('openRouterApiKey')) || ''

    if (!openRouterApiKey) {
      openRouterApiKey = await this.readConfigFromStorage()
      if (openRouterApiKey) {
        await this.setConfigValue('openRouterApiKey', openRouterApiKey)
      }
    }

    return { openRouterApiKey }
  }

  async getConfigValue(key) {
    return this.backend.getConfigValue(key)
  }

  async setConfigValue(key, value) {
    await this.backend.setConfigValue(key, value)
  }

  async saveConfig(config) {
    if (config.openRouterApiKey !== undefined) {
      await this.setConfigValue('openRouterApiKey', config.openRouterApiKey)
      await this.writeConfigToStorage(config)
    }
  }

  async readConfigFromStorage() {
    try {
      const data = await Neutralino.storage.getData(CONFIG_STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        return parsed.openRouterApiKey || ''
      }
    } catch (error) {
      if (error.code !== 'NE_ST_NOSTKEX') {
        console.error('Error reading config from storage:', error)
      }
    }
    return ''
  }

  async writeConfigToStorage(config) {
    try {
      await Neutralino.storage.setData(CONFIG_STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('Error writing config to storage:', error)
      throw error
    }
  }
}
