import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { tracksApi, authApi, votesApi, parseApiError } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import CoverImage from '../components/CoverImage'
import { formatDate, formatNumber, cn } from '../lib/utils'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', id],
    queryFn: () => tracksApi.getOne(id!),
    enabled: !!id,
  })

  const { data: userVotes } = useQuery({
    queryKey: ['myVotes'],
    queryFn: authApi.myVotes,
    enabled: !!user,
  })

  const userVote = userVotes?.find((v) => v.trackId === id)
  const [localVote, setLocalVote] = useState<number | null>(null)
  const [voteId, setVoteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sync local state with userVote when it changes
  useEffect(() => {
    setLocalVote(userVote?.value ?? null)
    setVoteId(userVote?.id ?? null)
  }, [userVote])

  const voteMutation = useMutation({
    mutationFn: async ({ value, isDelete }: { value: 1 | -1; isDelete: boolean }) => {
      const hadVote = voteId !== null
      if (voteId) {
        if (isDelete) {
          await votesApi.delete(voteId)
          return { deleted: true, wasUpdate: false }
        }
        const result = await votesApi.update(voteId, value)
        return { ...result, wasUpdate: true }
      }
      const result = await votesApi.create(id!, value)
      return { ...result, wasUpdate: hadVote }
    },
    onSuccess: (result) => {
      if (result && 'deleted' in result && result.deleted) {
        setVoteId(null)
        setLocalVote(null)
        setSuccess('Vote supprimé !')
      } else if (result && 'id' in result) {
        setVoteId(result.id)
        setLocalVote(result.value)
        setSuccess(result.wasUpdate ? 'Vote mis à jour !' : 'Vote enregistré !')
      }
      setError(null)
      setTimeout(() => setSuccess(null), 2000)
      queryClient.invalidateQueries({ queryKey: ['track', id] })
      queryClient.invalidateQueries({ queryKey: ['myVotes'] })
      queryClient.invalidateQueries({ queryKey: ['myVotesWithTracks'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
    },
    onError: (err) => {
      setLocalVote(userVote?.value ?? null)
      setError(parseApiError(err))
      setTimeout(() => setError(null), 3000)
    },
  })

  const handleVote = async (value: 1 | -1) => {
    if (!user) return
    setError(null)

    const isDelete = localVote === value
    const newVote = isDelete ? null : value

    setLocalVote(newVote)
    voteMutation.mutate({ value, isDelete })
  }

  if (isLoading) {
    return <LoadingSpinner text="Chargement du track..." />
  }

  if (!track) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Track non trouvé</p>
        <Link to="/" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const score = track.score ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour</span>
      </Link>

      {/* Track Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover */}
          <CoverImage
            src={track.coverUrl}
            alt={track.title}
            fallbackText={track.artist?.name || track.title}
            className="w-48 h-48 rounded-xl flex-shrink-0 mx-auto md:mx-0"
          />

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{track.title}</h1>
            <Link
              to={`/artists/${track.artist.id}`}
              className="text-lg text-dark-300 hover:text-primary-400 transition-colors"
            >
              {track.artist.name}
            </Link>

            {track.releaseDate && (
              <p className="text-dark-500 mt-2">
                Sorti le {formatDate(track.releaseDate)}
              </p>
            )}

            {/* Links */}
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              {track.spotifyUrl && (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Spotify
                </a>
              )}
              {track.youtubeUrl && (
                <a
                  href={track.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Vote Section */}
        <div className="mt-8 pt-6 border-t border-dark-800">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              {success}
            </div>
          )}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => handleVote(1)}
              disabled={!user || voteMutation.isPending}
              className={cn(
                'flex flex-col items-center gap-2 p-6 rounded-2xl transition-all',
                localVote === 1 ? 'bg-green-500/20 scale-110' : 'hover:bg-dark-800 hover:scale-105',
                !user && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-4xl">❤️</span>
              <span className="text-sm font-medium text-green-400">HOT</span>
              {track.upvotes !== undefined && (
                <span className="text-lg font-bold text-green-400">{formatNumber(track.upvotes)}</span>
              )}
            </button>

            <div className="text-center">
              <p className="text-dark-500 text-sm mb-1">Score</p>
              <span
                className={cn(
                  'text-4xl font-bold',
                  score > 0 && 'text-green-400',
                  score < 0 && 'text-red-400',
                  score === 0 && 'text-dark-400'
                )}
              >
                {formatNumber(score)}
              </span>
            </div>

            <button
              onClick={() => handleVote(-1)}
              disabled={!user || voteMutation.isPending}
              className={cn(
                'flex flex-col items-center gap-2 p-6 rounded-2xl transition-all',
                localVote === -1 ? 'bg-red-500/20 scale-110' : 'hover:bg-dark-800 hover:scale-105',
                !user && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-4xl">💔</span>
              <span className="text-sm font-medium text-red-400">FLOP</span>
              {track.downvotes !== undefined && (
                <span className="text-lg font-bold text-red-400">{formatNumber(track.downvotes)}</span>
              )}
            </button>
          </div>

          {!user && (
            <p className="text-center text-dark-500 mt-4">
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Connecte-toi
              </Link>{' '}
              pour voter
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
