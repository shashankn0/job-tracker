import { useState } from 'react'

function DatabaseTab({ jobs, selectedJob, onSelectJob, onDeleteJob }) {
  const [filter, setFilter] = useState('')

  const filteredJobs = jobs.filter(job => 
    job.company?.toLowerCase().includes(filter.toLowerCase()) ||
    job.title?.toLowerCase().includes(filter.toLowerCase()) ||
    job.raw_text?.toLowerCase().includes(filter.toLowerCase())
  )

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this job?')) {
      await onDeleteJob(id)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '15px' }}>Database</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''}
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
          No jobs found. Add your first job in the Add Job tab.
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {filteredJobs.map(job => (
            <div 
              key={job.id}
              className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
              onClick={() => onSelectJob(job)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {job.company || 'Unknown Company'} - {job.title || 'Unknown Title'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                    {job.location || 'Unknown Location'}
                  </div>
                  {job.role_id && (
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Ref: {job.role_id}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {new Date(job.saved_date).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="secondary"
                  onClick={(e) => handleDelete(job.id, e)}
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#333', 
          borderRadius: '4px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginBottom: '10px' }}>Job Details</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Company:</strong> {selectedJob.company || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Title:</strong> {selectedJob.title || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Location:</strong> {selectedJob.location || 'N/A'}
          </div>
          {selectedJob.role_id && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Role ID:</strong> {selectedJob.role_id}
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <strong>Saved:</strong> {new Date(selectedJob.saved_date).toLocaleString()}
          </div>
          <div style={{ marginTop: '15px' }}>
            <strong>Cleaned Description:</strong>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              marginTop: '10px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {selectedJob.cleaned_text || selectedJob.raw_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatabaseTab
