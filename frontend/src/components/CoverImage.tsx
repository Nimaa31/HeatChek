import { useState } from 'react'
import { Music } from 'lucide-react'
import { cn } from '../lib/utils'

interface CoverImageProps {
  src?: string | null
  alt: string
  className?: string
  fallbackText?: string
}

// Generate a consistent color based on the text
function getColorFromText(text: string): string {
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-green-500',
    'from-amber-500 to-orange-500',
  ]

  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CoverImage({ src, alt, className, fallbackText }: CoverImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const displayText = fallbackText || alt
  const colorClass = getColorFromText(displayText)
  const initials = getInitials(displayText)

  // If no src or error occurred, show placeholder
  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br',
          colorClass,
          className
        )}
      >
        {initials ? (
          <span className="text-white font-bold text-lg drop-shadow-lg">
            {initials}
          </span>
        ) : (
          <Music className="w-1/3 h-1/3 text-white/80" />
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-dark-800', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 animate-pulse">
          <Music className="w-1/3 h-1/3 text-dark-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
