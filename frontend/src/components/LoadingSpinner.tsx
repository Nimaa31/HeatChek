import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`${sizeClasses[size]} fire-gradient rounded-xl flex items-center justify-center`}
      >
        <Flame className="w-2/3 h-2/3 text-white" />
      </motion.div>
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  )
}
