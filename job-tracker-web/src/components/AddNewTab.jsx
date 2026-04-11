import { useState } from 'react'

function AddNewTab({ onSaveJob }) {
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rawText.trim()) {
      setError('Please enter a job description')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { supabase } = await import('../lib/supabase')

      const { data: { user } } = await supabase.auth.getUser()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/clean-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Edge function error: ${response.status}`)
      }

      const data = await response.json()
      const cleanedData = data.cleaned_data || {
        company: '',
        title: '',
        location: '',
        role_id: '',
        cleaned_text: rawText
      }

      const jobData = {
        user_id: user.id,
        company: cleanedData.company,
        title: cleanedData.title,
        role_id: cleanedData.role_id,
        location: cleanedData.location,
        raw_text: rawText,
        cleaned_text: cleanedData.cleaned_text,
        saved_date: new Date().toISOString()
      }

      const result = await onSaveJob(jobData)

      if (result.success) {
        setRawText('')
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('error saving job:', err)
      setError(err.message || 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 flex items-center justify-center" style={{ minHeight: '100%' }}>
      <div style={{ maxWidth: '660px', width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
              Job Description
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste job description here..."
              className="w-full outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px dashed rgba(224, 52, 74, 0.4)',
                borderRadius: '6px',
                padding: '16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minHeight: '260px',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)'
                e.target.style.backgroundColor = 'rgba(224, 52, 74, 0.04)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(224, 52, 74, 0.4)'
                e.target.style.backgroundColor = 'var(--bg-card)'
              }}
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-sm" style={{ color: 'var(--accent-primary)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              fontSize: '14px',
              height: '44px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--accent-primary)'
            }}
          >
            {loading ? 'Cleaning with AI...' : 'Clean & Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddNewTab
