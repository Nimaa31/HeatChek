import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion'
import { tracksApi, authApi, votesApi, Track } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import CoverImage from '../components/CoverImage'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, formatNumber, cn } from '../lib/utils'

export default function SwipePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch all tracks
  const { data: tracksData, isLoading: tracksLoading } = useQuery({
    queryKey: ['tracks', 'all'],
    queryFn: () => tracksApi.getAll(1, 100),
  })

  // Fetch user votes
  const { data: userVotes, isLoading: votesLoading } = useQuery({
    queryKey: ['myVotes'],
    queryFn: authApi.myVotes,
    enabled: !!user,
  })

  // Filter tracks that user hasn't voted on
  const unvotedTracks = useMemo(() => {
    if (!tracksData?.['hydra:member']) return []
    if (!user) return tracksData['hydra:member']

    const votedTrackIds = new Set(userVotes?.map(v => v.trackId) || [])
    return tracksData['hydra:member'].filter(track => !votedTrackIds.has(track.id))
  }, [tracksData, userVotes, user])

  const currentTrack = unvotedTracks[currentIndex]

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (value: 1 | -1) => {
      if (!currentTrack) throw new Error('No track')
      return votesApi.create(currentTrack.id, value)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVotes'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
    },
  })

  const handleVote = async (value: 1 | -1) => {
    if (!user || !currentTrack || isAnimating) return

    setIsAnimating(true)
    setSwipeDirection(value === 1 ? 'right' : 'left')

    try {
      await voteMutation.mutateAsync(value)
    } catch (error) {
      console.error('Vote error:', error)
    }

    // Wait for animation to complete
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setSwipeDirection(null)
      setIsAnimating(false)
    }, 300)
  }

  // Require login
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-6">🔥</div>
        <h1 className="text-2xl font-bold mb-4">Connecte-toi pour swiper</h1>
        <p className="text-dark-400 mb-6">
          Découvre les derniers sons et vote HOT ou FLOP !
        </p>
        <Link to="/login" className="btn btn-primary">
          Se connecter
        </Link>
      </div>
    )
  }

  if (tracksLoading || votesLoading) {
    return <LoadingSpinner text="Chargement des sons..." />
  }

  // All tracks voted
  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-6">🔥</div>
        <h1 className="text-2xl font-bold mb-4">Tu as tout voté !</h1>
        <p className="text-dark-400 mb-6">
          Reviens plus tard pour découvrir de nouveaux sons
        </p>
        <Link to="/ranking" className="btn btn-primary">
          Voir le classement
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Progress */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between text-sm text-dark-400 mb-2">
          <span>{currentIndex + 1} / {unvotedTracks.length}</span>
          <span>{unvotedTracks.length - currentIndex - 1} restants</span>
        </div>
        <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-orange-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / unvotedTracks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipe Card */}
      <div className="relative w-full max-w-sm h-[500px]">
        <AnimatePresence mode="wait">
          <SwipeCard
            key={currentTrack.id}
            track={currentTrack}
            onVote={handleVote}
            swipeDirection={swipeDirection}
            isAnimating={isAnimating}
          />
        </AnimatePresence>
      </div>

      {/* Vote Buttons */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={() => handleVote(-1)}
          disabled={isAnimating}
          className={cn(
            'w-20 h-20 rounded-full bg-dark-800 border-4 border-red-500/50 flex items-center justify-center text-4xl',
            'hover:bg-red-500/20 hover:border-red-500 hover:scale-110 transition-all duration-200',
            'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          💔
        </button>

        <button
          onClick={() => handleVote(1)}
          disabled={isAnimating}
          className={cn(
            'w-20 h-20 rounded-full bg-dark-800 border-4 border-green-500/50 flex items-center justify-center text-4xl',
            'hover:bg-green-500/20 hover:border-green-500 hover:scale-110 transition-all duration-200',
            'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          ❤️
        </button>
      </div>

      {/* Instructions */}
      <p className="text-dark-500 text-sm mt-6">
        Swipe ou clique pour voter
      </p>
    </div>
  )
}

interface SwipeCardProps {
  track: Track
  onVote: (value: 1 | -1) => void
  swipeDirection: 'left' | 'right' | null
  isAnimating: boolean
}

function SwipeCard({ track, onVote, swipeDirection, isAnimating }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Overlay opacity based on swipe direction
  const hotOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const flopOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      onVote(1) // HOT
    } else if (info.offset.x < -threshold) {
      onVote(-1) // FLOP
    }
  }

  // Animation for when vote is triggered by button
  const exitAnimation = swipeDirection === 'right'
    ? { x: 500, rotate: 30, opacity: 0 }
    : swipeDirection === 'left'
    ? { x: -500, rotate: -30, opacity: 0 }
    : { x: 0, opacity: 0 }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={!isAnimating ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={exitAnimation}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="w-full h-full bg-dark-900 rounded-3xl border border-dark-700 overflow-hidden shadow-2xl">
        {/* HOT Overlay */}
        <motion.div
          className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none flex items-center justify-center"
          style={{ opacity: hotOpacity }}
        >
          <div className="text-6xl font-bold text-green-400 rotate-[-20deg] border-4 border-green-400 px-4 py-2 rounded-xl">
            HOT 🔥
          </div>
        </motion.div>

        {/* FLOP Overlay */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none flex items-center justify-center"
          style={{ opacity: flopOpacity }}
        >
          <div className="text-6xl font-bold text-red-400 rotate-[20deg] border-4 border-red-400 px-4 py-2 rounded-xl">
            FLOP 💀
          </div>
        </motion.div>

        {/* Cover Image */}
        <div className="relative h-[60%]">
          <CoverImage
            src={track.coverUrl}
            alt={track.title}
            fallbackText={track.artist?.name || track.title}
            className="w-full h-full object-cover"
          />
          {/* Score Badge */}
          <div className="absolute bottom-4 right-4 bg-dark-900/90 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className={cn(
              'font-bold text-lg',
              (track.score ?? 0) > 0 && 'text-green-400',
              (track.score ?? 0) < 0 && 'text-red-400',
              (track.score ?? 0) === 0 && 'text-dark-400'
            )}>
              {formatNumber(track.score ?? 0)} pts
            </span>
          </div>
        </div>

        {/* Track Info */}
        <div className="p-6 h-[40%] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 truncate">
              {track.title}
            </h2>
            <Link
              to={`/artists/${track.artist.id}`}
              className="text-lg text-dark-300 hover:text-primary-400 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {track.artist.name}
            </Link>
            {track.releaseDate && (
              <p className="text-dark-500 text-sm mt-2">
                {formatDate(track.releaseDate)}
              </p>
            )}
          </div>

          {/* Mini Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-green-400">❤️ {formatNumber(track.upvotes ?? 0)}</span>
              <span className="text-red-400">💔 {formatNumber(track.downvotes ?? 0)}</span>
            </div>
            <Link
              to={`/tracks/${track.id}`}
              className="text-primary-400 hover:text-primary-300 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              Voir détails →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
