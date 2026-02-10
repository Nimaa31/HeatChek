import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Mail, Lock, User, AlertCircle, Image, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import GoogleSignInButton from '../components/GoogleSignInButton'

// Avatar par défaut générés avec DiceBear
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=c1f4c5',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka&backgroundColor=c0aede',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [localError, setLocalError] = useState('')
  const [googleError, setGoogleError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError('')
    setGoogleError('')

    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      await register({ email, username, password, avatarUrl: avatarUrl || undefined })
      navigate('/')
    } catch {
      // Error is handled by the store
    }
  }

  const handleGoogleError = (errorMessage: string) => {
    clearError()
    setLocalError('')
    setGoogleError(errorMessage)
  }

  const selectAvatar = (url: string) => {
    setAvatarUrl(url)
    setShowAvatarPicker(false)
  }

  const displayError = googleError || localError || error

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
            <h1 className="text-2xl font-bold">Inscription</h1>
            <p className="text-dark-400 mt-2">Rejoins la communauté HeatCheck</p>
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
              <label htmlFor="username" className="block text-sm font-medium text-dark-300 mb-2">
                Pseudo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-12"
                  placeholder="TonPseudo"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>
            </div>

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
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Photo de profil (optionnel)
              </label>
              <div className="flex items-center gap-4">
                {/* Selected Avatar Preview */}
                <div className="w-16 h-16 rounded-full bg-dark-800 overflow-hidden flex-shrink-0 border-2 border-dark-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-dark-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="btn btn-secondary text-sm w-full"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Choisir un avatar
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-dark-400 hover:text-red-400 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Supprimer
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar Picker */}
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-dark-800 rounded-lg"
                >
                  <p className="text-sm text-dark-400 mb-3">Choisis un avatar :</p>
                  <div className="grid grid-cols-4 gap-3">
                    {DEFAULT_AVATARS.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAvatar(url)}
                        className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                          avatarUrl === url ? 'border-primary-500' : 'border-transparent hover:border-dark-600'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full" />
                      </button>
                    ))}
                  </div>

                  {/* Custom URL */}
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <p className="text-sm text-dark-400 mb-2">Ou entre une URL :</p>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="input text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {isLoading ? 'Inscription...' : "S'inscrire"}
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

          {/* Login Link */}
          <p className="text-center text-dark-400 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Connecte-toi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
