import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { artistsApi } from '../services/api'
import ArtistCard from '../components/ArtistCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ArtistsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => artistsApi.getAll(1, 50),
  })

  const artists = data?.['hydra:member'] ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Artistes</h1>
          <p className="text-dark-400">Découvre tous les artistes rap FR</p>
        </div>
      </div>

      {/* Artists Grid */}
      {isLoading ? (
        <LoadingSpinner text="Chargement des artistes..." />
      ) : artists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-dark-400">Aucun artiste pour le moment</p>
        </div>
      )}
    </div>
  )
}
