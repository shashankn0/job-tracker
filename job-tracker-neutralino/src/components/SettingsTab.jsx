import { useState } from 'react'

function SettingsTab({ apiKey, onSaveConfig }) {
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await onSaveConfig(localApiKey)
      if (result.success) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage(result.error || 'Failed to save settings')
      }
    } catch (err) {
      console.error('Error saving config:', err)
      setMessage(err.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '15px' }}>Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>
            OpenRouter API Key
          </label>
          <input
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
            Get your API key from{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#e0344a' }}>
              openrouter.ai/keys
            </a>
          </div>
        </div>

        {message && (
          <div style={{ 
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: message.includes('success') ? '#4caf5020' : '#e0344a20',
            color: message.includes('success') ? '#4caf50' : '#e0344a'
          }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          className="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#333', borderRadius: '4px' }}>
        <h3 style={{ marginBottom: '10px', color: '#e0344a' }}>About</h3>
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong>Job Tracker</strong> v1.0.0
          <br /><br />
          A desktop application for tracking job applications with AI-powered job description cleaning.
          <br /><br />
          <strong>Features:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>AI-powered job description cleaning using Claude 3 Haiku</li>
            <li>Persistent SQL-based database using SQLite</li>
            <li>Clean, organized job descriptions</li>
            <li>Search and filter functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
