import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, ArrowRight, Calendar } from 'lucide-react'
import { tracksApi, authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HomePage() {
  const { user } = useAuthStore()

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', 'latest'],
    queryFn: () => tracksApi.getAll(1, 10),
  })

  const { data: ranking } = useQuery({
    queryKey: ['ranking', 'week'],
    queryFn: () => tracksApi.getRanking('week'),
  })

  const { data: recentTracks } = useQuery({
    queryKey: ['tracks', 'recent'],
    queryFn: () => tracksApi.getRecent(),
  })

  const { data: userVotes } = useQuery({
    queryKey: ['myVotes'],
    queryFn: authApi.myVotes,
    enabled: !!user,
  })

  const userVotesMap = new Map(
    (userVotes || []).map((vote) => [vote.trackId, { id: vote.id, value: vote.value }])
  )

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900 rounded-full border border-dark-800 mb-6"
        >
          <Flame className="w-4 h-4 text-primary-500" />
          <span className="text-sm text-dark-300">La communauté du rap FR vote</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold mb-4"
        >
          <span className="text-gradient">HeatCheck</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-dark-400 max-w-2xl mx-auto mb-8"
        >
          Vote pour tes sons rap FR préférés et découvre les tracks les plus chaudes du moment
        </motion.p>

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/register" className="btn btn-primary">
              Créer un compte
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Se connecter
            </Link>
          </motion.div>
        )}
      </section>

      {/* Recent Releases - This Week */}
      {recentTracks && recentTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sorties de la semaine</h2>
                <p className="text-sm text-dark-400">Les nouveaux sons des 7 derniers jours</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {recentTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                userVote={userVotesMap.get(track.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top 3 this week */}
      {ranking && ranking.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl fire-gradient flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Top de la semaine</h2>
                <p className="text-sm text-dark-400">Les sons les plus votés</p>
              </div>
            </div>
            <Link
              to="/ranking"
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {ranking.slice(0, 3).map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                rank={index + 1}
                userVote={userVotesMap.get(track.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest tracks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Dernières sorties</h2>
            <p className="text-sm text-dark-400">Les nouveaux sons ajoutés</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Chargement des tracks..." />
        ) : (
          <div className="grid gap-3">
            {tracks?.['hydra:member']?.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                userVote={userVotesMap.get(track.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
