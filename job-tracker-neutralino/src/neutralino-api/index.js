import { JobDatabase } from './database.js'
import { cleanJobDescription } from './ai-cleaner.js'

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

class NeutralinoAPI {
  constructor() {
    this.ready = false
    this.database = new JobDatabase()
  }

  async waitReady() {
    if (this.ready) return
    await Neutralino.init()
    await this.database.init()
    this.ready = true
  }

  async getAllJobs() {
    await this.waitReady()
    try {
      return { success: true, jobs: this.database.getAllJobs() }
    } catch (error) {
      console.error('Error getting jobs:', error)
      return { success: false, error: error.message }
    }
  }

  async saveJob(rawText, company, title) {
    await this.waitReady()
    try {
      const config = this.database.getConfig()
      const cleanedData = await cleanJobDescription(
        rawText,
        company,
        title,
        config.openRouterApiKey,
      )

      const newJob = {
        id: generateId(),
        company: cleanedData.company,
        title: cleanedData.title,
        location: cleanedData.location,
        role_id: cleanedData.role_id,
        raw_text: rawText,
        cleaned_text: cleanedData.cleaned_text,
        saved_date: new Date().toISOString(),
        source: config.openRouterApiKey ? 'openrouter' : 'none',
      }

      await this.database.insertJob(newJob)
      return { success: true, job: newJob }
    } catch (error) {
      console.error('Error saving job:', error)
      return { success: false, error: error.message }
    }
  }

  async getJob(id) {
    await this.waitReady()
    try {
      return { success: true, job: this.database.getJob(id) }
    } catch (error) {
      console.error('Error getting job:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteJob(id) {
    await this.waitReady()
    try {
      await this.database.deleteJob(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      return { success: false, error: error.message }
    }
  }

  async reprocessJob(id) {
    await this.waitReady()
    try {
      const job = this.database.getJob(id)
      if (!job) {
        return { success: false, error: 'Job not found' }
      }

      const config = this.database.getConfig()
      const cleanedData = await cleanJobDescription(
        job.raw_text,
        job.company,
        job.title,
        config.openRouterApiKey,
      )

      const updatedJob = {
        ...job,
        company: cleanedData.company,
        title: cleanedData.title,
        location: cleanedData.location,
        role_id: cleanedData.role_id,
        cleaned_text: cleanedData.cleaned_text,
        source: config.openRouterApiKey ? 'openrouter' : 'none',
      }

      await this.database.insertJob(updatedJob)
      return { success: true, job: updatedJob }
    } catch (error) {
      console.error('Error reprocessing job:', error)
      return { success: false, error: error.message }
    }
  }

  async getConfig() {
    await this.waitReady()
    try {
      return { success: true, config: this.database.getConfig() }
    } catch (error) {
      console.error('Error getting config:', error)
      return { success: false, error: error.message }
    }
  }

  async saveConfig(config) {
    await this.waitReady()
    try {
      await this.database.saveConfig(config)
      return { success: true }
    } catch (error) {
      console.error('Error saving config:', error)
      return { success: false, error: error.message }
    }
  }

  async closeWindow() {
    await this.waitReady()
    try {
      await Neutralino.app.exit()
    } catch (error) {
      console.error('Error closing window:', error)
    }
  }

  async minimizeWindow() {
    await this.waitReady()
    try {
      await Neutralino.window.minimize()
    } catch (error) {
      console.error('Error minimizing window:', error)
    }
  }

  async maximizeWindow() {
    await this.waitReady()
    try {
      await Neutralino.window.maximize()
    } catch (error) {
      console.error('Error maximizing window:', error)
    }
  }
}

window.electronAPI = new NeutralinoAPI()
