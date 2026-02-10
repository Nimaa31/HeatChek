import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Artist } from '../services/api'

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/artists/${artist.id}`}
        className="card block p-4 hover:border-dark-600 transition-all group"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-dark-800 overflow-hidden flex-shrink-0">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-dark-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              {artist.name}
            </h3>
            {artist.tracks && (
              <p className="text-sm text-dark-400">
                {artist.tracks.length} track{artist.tracks.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
