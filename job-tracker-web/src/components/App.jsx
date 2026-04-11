import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

function App() {
  const { user, loading, signOut } = useAuth()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [activeTab, setActiveTab] = useState('add-new')

  useEffect(() => {
    if (user) {
      loadJobs()
    }
  }, [user])

  const loadJobs = async () => {
    const { supabase } = await import('../lib/supabase')
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('saved_date', { ascending: false })

    if (error) {
      console.error('error loading jobs:', error)
    } else {
      setJobs(data || [])
    }
  }

  const handleSaveJob = async (jobData) => {
    const { supabase } = await import('../lib/supabase')
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      console.error('error saving job:', error)
      return { success: false, error: error.message }
    }

    await loadJobs()
    return { success: true, job: data }
  }

  const handleDeleteJob = async (id) => {
    const { supabase } = await import('../lib/supabase')
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('error deleting job:', error)
      return { success: false, error: error.message }
    }

    await loadJobs()
    setSelectedJob(null)
    return { success: true }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Sidebar
        jobs={jobs}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        onNewJob={() => {
          setActiveTab('add-new')
          setSelectedJob(null)
        }}
        onSignOut={signOut}
      />
      <MainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        onSaveJob={handleSaveJob}
        onDeleteJob={handleDeleteJob}
        jobs={jobs}
        loadJobs={loadJobs}
      />
    </div>
  )
}

export default App
