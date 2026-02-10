import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Users, User, LogOut, Heart } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', label: 'Accueil', icon: Flame },
  { path: '/ranking', label: 'Classement', icon: TrendingUp },
  { path: '/swipe', label: 'Swipe', icon: Heart },
  { path: '/artists', label: 'Artistes', icon: Users },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl fire-gradient flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">HeatCheck</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                      isActive
                        ? 'bg-dark-800 text-white'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-all"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost text-sm">
                    Connexion
                  </Link>
                  <Link to="/register" className="btn btn-primary text-sm">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-dark-900/95 backdrop-blur-lg border-t border-dark-800 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
                  isActive ? 'text-primary-500' : 'text-dark-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link
            to={user ? '/profile' : '/login'}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
              location.pathname === '/profile' ? 'text-primary-500' : 'text-dark-400'
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">{user ? 'Profil' : 'Connexion'}</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
