import { useState } from 'react'

function DatabaseTab({ jobs, selectedJob, setSelectedJob, onDeleteJob, loadJobs }) {
  const [filterCompany, setFilterCompany] = useState('')
  const [filterTitle, setFilterTitle] = useState('')
  const [filterRoleId, setFilterRoleId] = useState('')

  const filteredJobs = jobs.filter(job => {
    const matchesCompany = !filterCompany || job.company?.toLowerCase().includes(filterCompany.toLowerCase())
    const matchesTitle = !filterTitle || job.title?.toLowerCase().includes(filterTitle.toLowerCase())
    const matchesRoleId = !filterRoleId || job.role_id?.toLowerCase().includes(filterRoleId.toLowerCase())
    return matchesCompany && matchesTitle && matchesRoleId
  })

  const handleClearFilters = () => {
    setFilterCompany('')
    setFilterTitle('')
    setFilterRoleId('')
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Filter by company"
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="flex-1 outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)'
            e.target.style.boxShadow = '0 0 0 3px rgba(224,52,74,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <input
          type="text"
          placeholder="Filter by title"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
          className="flex-1 outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)'
            e.target.style.boxShadow = '0 0 0 3px rgba(224,52,74,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <input
          type="text"
          placeholder="Filter by role ID"
          value={filterRoleId}
          onChange={(e) => setFilterRoleId(e.target.value)}
          className="flex-1 outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)'
            e.target.style.boxShadow = '0 0 0 3px rgba(224,52,74,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={handleClearFilters}
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
          Clear
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Role ID
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid var(--border-color)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.02)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
              >
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {job.company}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {job.title}
                </td>
                <td className="px-4 py-3">
                  {job.role_id && (
                    <span className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                      {job.role_id}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(job.saved_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} displayed
      </div>
    </div>
  )
}

export default DatabaseTab
