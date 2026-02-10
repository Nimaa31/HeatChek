import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Track, votesApi, parseApiError } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { cn, formatNumber } from '../lib/utils'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CoverImage from './CoverImage'

interface TrackCardProps {
  track: Track
  rank?: number
  userVote?: { id: string; value: number } | null
}

export default function TrackCard({ track, rank, userVote }: TrackCardProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [localVote, setLocalVote] = useState<number | null>(userVote?.value ?? null)
  const [voteId, setVoteId] = useState<string | null>(userVote?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sync local state with prop when userVote changes
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
      const result = await votesApi.create(track.id, value)
      // Backend does upsert, so if we get back the same track, it was an update
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
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      queryClient.invalidateQueries({ queryKey: ['myVotes'] })
      queryClient.invalidateQueries({ queryKey: ['myVotesWithTracks'] })
      queryClient.invalidateQueries({ queryKey: ['track', track.id] })
    },
    onError: (err) => {
      // Revert optimistic update
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

    // Optimistic update
    setLocalVote(newVote)
    voteMutation.mutate({ value, isDelete })
  }

  const score = track.score ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group hover:border-dark-700 transition-all"
    >
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}
      <div className="flex items-center gap-4 p-4">
        {/* Rank */}
        {rank !== undefined && (
          <div className="flex-shrink-0 w-8 text-center">
            <span
              className={cn(
                'text-lg font-bold',
                rank <= 3 ? 'text-gradient' : 'text-dark-500'
              )}
            >
              {rank}
            </span>
          </div>
        )}

        {/* Cover */}
        <Link to={`/tracks/${track.id}`} className="flex-shrink-0">
          <CoverImage
            src={track.coverUrl}
            alt={track.title}
            fallbackText={track.artist?.name || track.title}
            className="w-16 h-16 rounded-lg group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/tracks/${track.id}`}
            className="block font-semibold text-white truncate hover:text-primary-400 transition-colors"
          >
            {track.title}
          </Link>
          <Link
            to={`/artists/${track.artist.id}`}
            className="text-sm text-dark-400 hover:text-white transition-colors"
          >
            {track.artist.name}
          </Link>
        </div>

        {/* External Links */}
        <div className="hidden sm:flex items-center gap-2">
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-dark-400 hover:text-green-400 transition-colors"
              title="Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Vote */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(1)}
            disabled={!user || voteMutation.isPending}
            className={cn(
              'vote-btn vote-btn-up text-xl',
              localVote === 1 && 'vote-btn-active-up scale-110',
              !user && 'opacity-50 cursor-not-allowed'
            )}
            title={user ? 'HOT 🔥' : 'Connectez-vous pour voter'}
          >
            ❤️
          </button>

          <span
            className={cn(
              'min-w-[3rem] text-center font-bold text-lg',
              score > 0 && 'text-green-400',
              score < 0 && 'text-red-400',
              score === 0 && 'text-dark-400'
            )}
          >
            {formatNumber(score)}
          </span>

          <button
            onClick={() => handleVote(-1)}
            disabled={!user || voteMutation.isPending}
            className={cn(
              'vote-btn vote-btn-down text-xl',
              localVote === -1 && 'vote-btn-active-down scale-110',
              !user && 'opacity-50 cursor-not-allowed'
            )}
            title={user ? 'FLOP 💀' : 'Connectez-vous pour voter'}
          >
            💔
          </button>
        </div>
      </div>
    </motion.div>
  )
}
