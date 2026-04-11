import { useState } from 'react'
import AddNewTab from './AddNewTab'
import DatabaseTab from './DatabaseTab'
import JobDetailDrawer from './JobDetailDrawer'

function MainContent({ activeTab, setActiveTab, selectedJob, setSelectedJob, onSaveJob, onDeleteJob, jobs, loadJobs }) {
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-content)' }}>
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('add-new')}
          className="px-6 py-4 text-sm transition-colors"
          style={{
            color: activeTab === 'add-new' ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'add-new' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'add-new' ? '500' : '400',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'add-new') e.target.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'add-new') e.target.style.color = 'var(--text-muted)'
          }}
        >
          Add New
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className="px-6 py-4 text-sm transition-colors"
          style={{
            color: activeTab === 'database' ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'database' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: activeTab === 'database' ? '500' : '400',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'database') e.target.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'database') e.target.style.color = 'var(--text-muted)'
          }}
        >
          Database
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'add-new' && <AddNewTab onSaveJob={onSaveJob} />}
        {activeTab === 'database' && (
          <DatabaseTab
            jobs={jobs}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            onDeleteJob={onDeleteJob}
            loadJobs={loadJobs}
          />
        )}
      </div>

      {selectedJob && (
        <JobDetailDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={onDeleteJob}
          loadJobs={loadJobs}
        />
      )}
    </div>
  )
}

export default MainContent
