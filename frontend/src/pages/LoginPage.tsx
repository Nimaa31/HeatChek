import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [googleError, setGoogleError] = useState('')

  const displayError = googleError || error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setGoogleError('')

    try {
      await login({ email, password })
      navigate('/')
    } catch {
      // Error is handled by the store
    }
  }

  const handleGoogleError = (errorMessage: string) => {
    clearError()
    setGoogleError(errorMessage)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl fire-gradient mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Connexion</h1>
            <p className="text-dark-400 mt-2">Content de te revoir !</p>
          </div>

          {/* Error */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{displayError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="ton@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-dark-700"></div>
            <span className="text-dark-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-dark-700"></div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton onError={handleGoogleError} />

          {/* Register Link */}
          <p className="text-center text-dark-400 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Inscris-toi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
