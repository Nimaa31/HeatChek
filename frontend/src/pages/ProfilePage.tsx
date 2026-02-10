import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Calendar, Music, Settings, Save, X, Image, Check } from 'lucide-react'
import { authApi, parseApiError } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, cn } from '../lib/utils'

// Mêmes avatars que dans RegisterPage
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

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, fetchUser, setUser } = useAuthStore()

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Initialize edit fields when entering edit mode
  useEffect(() => {
    if (isEditing && user) {
      setEditUsername(user.username)
      setEditAvatarUrl(user.avatarUrl || '')
    }
  }, [isEditing, user])

  const { data: votes, isLoading } = useQuery({
    queryKey: ['myVotesWithTracks'],
    queryFn: authApi.myVotesWithTracks,
    enabled: !!user,
  })

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess('Profil mis à jour !')
      setTimeout(() => setSuccess(null), 3000)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err) => {
      setError(parseApiError(err))
    },
  })

  const handleSaveProfile = () => {
    setError(null)

    if (!editUsername.trim()) {
      setError('Le pseudo est requis')
      return
    }

    if (editUsername.length < 3) {
      setError('Le pseudo doit contenir au moins 3 caractères')
      return
    }

    updateProfileMutation.mutate({
      username: editUsername,
      avatarUrl: editAvatarUrl || undefined,
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError(null)
    setShowAvatarPicker(false)
  }

  if (!user) {
    return null
  }

  // Sort by most recent first
  const votesList = [...(votes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const upvotes = votesList.filter((v) => v.value === 1)
  const downvotes = votesList.filter((v) => v.value === -1)

  const userVotesMap = new Map(
    votesList.map((vote) => [vote.track.id, { id: vote.id, value: vote.value }])
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {!isEditing ? (
          /* View Mode */
          <>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-dark-800 overflow-hidden flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center fire-gradient">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-dark-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 text-dark-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Modifier mon profil</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Edit */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-dark-800 overflow-hidden border-2 border-dark-700">
                  {editAvatarUrl ? (
                    <img src={editAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center fire-gradient">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center"
                >
                  <Image className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="input"
                  placeholder="Ton pseudo"
                  minLength={3}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-dark-800 rounded-lg"
              >
                <p className="text-sm text-dark-400 mb-3">Choisis un avatar :</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {DEFAULT_AVATARS.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setEditAvatarUrl(url)
                        setShowAvatarPicker(false)
                      }}
                      className={cn(
                        'w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110',
                        editAvatarUrl === url ? 'border-primary-500' : 'border-transparent hover:border-dark-600'
                      )}
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
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="input text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Remove avatar */}
                {editAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setEditAvatarUrl('')}
                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Supprimer la photo de profil
                  </button>
                )}
              </motion.div>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {!isEditing && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-800">
            <div className="text-center">
              <p className="text-2xl font-bold">{votes?.length ?? 0}</p>
              <p className="text-dark-400 text-sm">Votes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{upvotes.length}</p>
              <p className="text-dark-400 text-sm flex items-center justify-center gap-1">
                <span>❤️</span> HOT
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{downvotes.length}</p>
              <p className="text-dark-400 text-sm flex items-center justify-center gap-1">
                <span>💔</span> FLOP
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Votes */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Mes votes récents</h2>
            <p className="text-dark-400 text-sm">Les derniers sons que tu as votés</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Chargement de tes votes..." />
        ) : votesList.length > 0 ? (
          <div className="grid gap-3">
            {votesList.slice(0, 20).map((vote) => (
              <div key={vote.id} className="relative">
                <div className="absolute -top-2 right-2 z-10 px-2 py-0.5 bg-dark-800 rounded text-xs text-dark-400">
                  {vote.value === 1 ? '👍' : '👎'} {formatDate(vote.createdAt)}
                </div>
                <TrackCard
                  track={vote.track}
                  userVote={userVotesMap.get(vote.track.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Music className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">Tu n'as pas encore voté</p>
            <p className="text-dark-500 text-sm mt-1">
              Explore les tracks et vote pour tes sons préférés !
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
