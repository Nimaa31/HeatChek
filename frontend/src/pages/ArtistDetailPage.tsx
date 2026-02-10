import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, User } from 'lucide-react'
import { artistsApi, authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../lib/utils'

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistsApi.getOne(id!),
    enabled: !!id,
  })

  const { data: userVotes } = useQuery({
    queryKey: ['myVotes'],
    queryFn: authApi.myVotes,
    enabled: !!user,
  })

  const userVotesMap = new Map(
    (userVotes || []).map((vote) => [vote.trackId, { id: vote.id, value: vote.value }])
  )

  if (isLoading) {
    return <LoadingSpinner text="Chargement de l'artiste..." />
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Artiste non trouvé</p>
        <Link to="/artists" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
          Retour aux artistes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/artists"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour</span>
      </Link>

      {/* Artist Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-800 overflow-hidden flex-shrink-0">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-dark-600" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-dark-400">
            Ajouté le {formatDate(artist.createdAt)}
          </p>
          {artist.tracks && (
            <p className="text-dark-300 mt-1">
              {artist.tracks.length} track{artist.tracks.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Tracks */}
      {artist.tracks && artist.tracks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Tracks</h2>
          <div className="grid gap-3">
            {artist.tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={{ ...track, artist }}
                userVote={userVotesMap.get(track.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
