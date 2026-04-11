import { useState } from 'react'

function JobDetailDrawer({ job, onClose, onDelete, loadJobs }) {
  const [viewRaw, setViewRaw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleReprocess = async () => {
    setLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')

      const { data, error: edgeError } = await supabase.functions.invoke('clean-job', {
        body: { rawText: job.raw_text }
      })

      if (edgeError) {
        throw edgeError
      }

      const cleanedData = data.cleaned_data || {
        company: job.company,
        title: job.title,
        location: job.location,
        role_id: job.role_id,
        cleaned_text: job.raw_text
      }

      const { error } = await supabase
        .from('jobs')
        .update({
          company: cleanedData.company,
          title: cleanedData.title,
          location: cleanedData.location,
          role_id: cleanedData.role_id,
          cleaned_text: cleanedData.cleaned_text
        })
        .eq('id', job.id)

      if (error) throw error

      await loadJobs()
    } catch (err) {
      console.error('error reprocessing job:', err)
      alert('Failed to reprocess job')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const result = await onDelete(job.id)
    if (result.success) {
      onClose()
    }
  }

  if (!job) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
      <div
        className="fixed right-0 top-0 h-full w-full max-w-2xl z-50 flex flex-col"
        style={{ backgroundColor: 'var(--bg-content)', borderLeft: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {job.company}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {job.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--text-secondary)'
              e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--text-muted)'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {job.location && (
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
                Location
              </span>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {job.location}
              </p>
            </div>
          )}

          {job.role_id && (
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
                Role ID
              </span>
              <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                {job.role_id}
              </p>
            </div>
          )}

          <div className="mb-4">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
              Saved Date
            </span>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {new Date(job.saved_date).toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
              Job Description
            </span>
            <div className="mt-2 p-4 rounded whitespace-pre-wrap" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
              {viewRaw ? job.raw_text : job.cleaned_text}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setViewRaw(!viewRaw)}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--text-secondary)'
              e.target.style.color = 'var(--text-secondary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-color)'
              e.target.style.color = 'var(--text-muted)'
            }}
          >
            {viewRaw ? 'View Cleaned' : 'View Raw'}
          </button>

          <button
            onClick={handleReprocess}
            disabled={loading}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.borderColor = 'var(--text-secondary)'
                e.target.style.color = 'var(--text-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-color)'
              e.target.style.color = 'var(--text-muted)'
            }}
          >
            {loading ? 'Re-processing...' : 'Re-process'}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--accent-subtle)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            Delete
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Delete Job?
              </h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--text-secondary)'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border-color)'
                    e.target.style.color = 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--accent-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--accent-primary)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default JobDetailDrawer
