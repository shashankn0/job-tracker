function Sidebar({ jobs, selectedJob, setSelectedJob, onNewJob, onSignOut }) {
  return (
    <div className="w-64 flex flex-col" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)' }}>
      <div className="p-4">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Job Tracker
        </h1>
      </div>

      <div className="px-4 mb-4">
        <button
          onClick={onNewJob}
          className="w-full py-2 rounded font-medium transition-colors"
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
          New Job
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="p-3 rounded mb-2 cursor-pointer transition-colors"
            style={{
              backgroundColor: selectedJob?.id === job.id ? 'var(--accent-subtle)' : 'transparent',
              borderLeft: selectedJob?.id === job.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedJob?.id !== job.id) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedJob?.id !== job.id) {
                e.target.style.backgroundColor = 'transparent'
              }
            }}
          >
            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {job.company}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {job.title}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {new Date(job.saved_date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onSignOut}
          className="w-full py-2 rounded font-medium transition-colors"
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
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
