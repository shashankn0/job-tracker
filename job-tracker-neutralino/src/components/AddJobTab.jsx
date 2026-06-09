import { useState } from 'react'

function AddJobTab({ onSaveJob, hasApiKey }) {
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rawText.trim()) {
      setError('Please enter a job description')
      return
    }

    if (!hasApiKey) {
      setError('Please add your OpenRouter API key in Settings first')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await onSaveJob({ raw_text: rawText, company: '', title: '' })
      if (result.success) {
        setRawText('')
      } else {
        setError(result.error || 'Failed to save job')
      }
    } catch (err) {
      console.error('Error saving job:', err)
      setError(err.message || 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '15px' }}>Add New Job</h2>
      {!hasApiKey && (
        <div style={{ 
          backgroundColor: '#e0344a20', 
          border: '1px solid #e0344a', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px' 
        }}>
          ⚠️ AI cleaning requires an OpenRouter API key. Go to Settings to add your key.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>
            Job Description
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste job description here..."
            style={{
              width: '100%',
              minHeight: '300px',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            required
          />
        </div>

        {error && (
          <div style={{ 
            color: '#e0344a', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#e0344a10',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Cleaning with AI...' : 'Clean & Save'}
        </button>
      </form>
    </div>
  )
}

export default AddJobTab
