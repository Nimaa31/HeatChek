import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { tracksApi, authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { cn } from '../lib/utils'

type Period = 'week' | 'month' | 'all'

const periods: { value: Period; label: string }[] = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'All-time' },
]

export default function RankingPage() {
  const [period, setPeriod] = useState<Period>('week')
  const { user } = useAuthStore()

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking', period],
    queryFn: () => tracksApi.getRanking(period),
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl fire-gradient flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Classement</h1>
            <p className="text-dark-400">Les sons les plus votés par la communauté</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-dark-900 p-1 rounded-lg">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                period === p.value
                  ? 'bg-dark-800 text-white'
                  : 'text-dark-400 hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking List */}
      {isLoading ? (
        <LoadingSpinner text="Chargement du classement..." />
      ) : ranking && ranking.length > 0 ? (
        <motion.div
          key={period}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {ranking.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              rank={index + 1}
              userVote={userVotesMap.get(track.id)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-dark-400">Aucun track pour cette période</p>
        </div>
      )}
    </div>
  )
}
