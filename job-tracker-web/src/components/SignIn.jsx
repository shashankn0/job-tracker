import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function SignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h1 className="text-2xl font-semibold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
          Job Tracker
        </h1>
        <p className="text-center mb-8" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Track your job applications with AI-powered cleaning
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded font-medium mb-4 transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            fontSize: '14px',
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
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1" style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span className="px-4 text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1" style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px 16px',
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
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px 16px',
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
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              fontSize: '14px',
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="/signup" style={{ color: 'var(--accent-primary)' }}>Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default SignIn
