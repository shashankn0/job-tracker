import { useState, useEffect } from 'react'
import AddJobTab from './components/AddJobTab'
import DatabaseTab from './components/DatabaseTab'
import SettingsTab from './components/SettingsTab'

function App() {
  const [activeTab, setActiveTab] = useState('add')
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    loadJobs()
    loadConfig()
  }, [])

  const loadJobs = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.getAllJobs()
        if (result.success) {
          setJobs(result.jobs)
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.getConfig()
        if (result.success) {
          setApiKey(result.config.openRouterApiKey || '')
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleSaveJob = async (jobData) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.saveJob(jobData.raw_text, jobData.company, jobData.title)
        if (result.success) {
          await loadJobs()
          return { success: true }
        }
        return { success: false, error: result.error }
      }
      return { success: false, error: 'API not available' }
    } catch (error) {
      console.error('Error saving job:', error)
      return { success: false, error: error.message }
    }
  }

  const handleDeleteJob = async (id) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.deleteJob(id)
        if (result.success) {
          await loadJobs()
          setSelectedJob(null)
          return { success: true }
        }
        return { success: false, error: result.error }
      }
      return { success: false, error: 'API not available' }
    } catch (error) {
      console.error('Error deleting job:', error)
      return { success: false, error: error.message }
    }
  }

  const handleSaveConfig = async (newApiKey) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.saveConfig({ openRouterApiKey: newApiKey })
        if (result.success) {
          setApiKey(newApiKey)
          return { success: true }
        }
        return { success: false, error: result.error }
      }
      return { success: false, error: 'API not available' }
    } catch (error) {
      console.error('Error saving config:', error)
      return { success: false, error: error.message }
    }
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px', color: '#e0344a' }}>Job Tracker</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Job
        </button>
        <button 
          className={`tab ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          Database
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'add' && (
        <AddJobTab 
          onSaveJob={handleSaveJob}
          hasApiKey={!!apiKey}
        />
      )}

      {activeTab === 'database' && (
        <DatabaseTab 
          jobs={jobs}
          selectedJob={selectedJob}
          onSelectJob={setSelectedJob}
          onDeleteJob={handleDeleteJob}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab 
          apiKey={apiKey}
          onSaveConfig={handleSaveConfig}
        />
      )}
    </div>
  )
}

export default App
