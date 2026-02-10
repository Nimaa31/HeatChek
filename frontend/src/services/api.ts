import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Error message translations
const errorTranslations: Record<string, string> = {
  'This email is already used': 'Cet email est déjà utilisé',
  'This value is too short. It should have 6 characters or more.': 'Mot de passe trop court (minimum 6 caractères)',
  'This value should not be blank.': 'Ce champ est requis',
  'This value is not a valid email address.': 'Adresse email invalide',
  'Invalid credentials.': 'Email ou mot de passe incorrect',
  'You have already voted for this track': 'Tu as déjà voté pour ce track',
  'Track is required': 'Le track est requis',
  'Vote value must be -1 or 1': 'La valeur du vote doit être -1 ou 1',
  'User not authenticated': 'Utilisateur non connecté',
}

// Parse API error and return French message
export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Une erreur est survenue'
  }

  const data = error.response?.data

  // Handle 401 login errors
  if (error.response?.status === 401) {
    return 'Email ou mot de passe incorrect'
  }

  // Handle validation errors (422)
  if (data?.violations && Array.isArray(data.violations)) {
    const messages = data.violations.map((v: { message: string }) => {
      return errorTranslations[v.message] || v.message
    })
    return messages.join('\n')
  }

  // Handle single message errors
  if (data?.message) {
    return errorTranslations[data.message] || data.message
  }

  if (data?.['hydra:description']) {
    return errorTranslations[data['hydra:description']] || data['hydra:description']
  }

  return 'Une erreur est survenue'
}

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  createdAt: string
}

export interface Artist {
  id: string
  name: string
  imageUrl?: string
  createdAt: string
  tracks?: Track[]
}

export interface Track {
  id: string
  title: string
  artist: Artist
  coverUrl?: string
  spotifyUrl?: string
  youtubeUrl?: string
  releaseDate?: string
  createdAt: string
  score?: number
  upvotes?: number
  downvotes?: number
}

export interface Vote {
  id: string
  track: Track
  value: number
  createdAt: string
}

export interface UserVote {
  id: string
  trackId: string
  value: number
}

export interface UserVoteWithTrack {
  id: string
  track: Track
  value: number
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  avatarUrl?: string
}

export interface UpdateProfileData {
  username?: string
  avatarUrl?: string
}

export interface PaginatedResponse<T> {
  'hydra:member': T[]
  'hydra:totalItems': number
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  googleLogin: async (credential: string) => {
    const response = await api.post('/auth/google', { credential })
    return response.data
  },
  me: async () => {
    const response = await api.get<User>('/users/me')
    return response.data
  },
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put<User>('/users/me', data)
    return response.data
  },
  myVotes: async (): Promise<UserVote[]> => {
    const response = await api.get<PaginatedResponse<{ id: string; track: { id: string }; value: number }>>('/users/me/votes')
    const votes = response.data['hydra:member'] || []
    return votes.map((vote) => ({
      id: vote.id,
      trackId: vote.track.id,
      value: vote.value,
    }))
  },
  myVotesWithTracks: async (): Promise<UserVoteWithTrack[]> => {
    const response = await api.get<PaginatedResponse<UserVoteWithTrack>>('/users/me/votes')
    return response.data['hydra:member'] || []
  },
}

// Tracks API
export const tracksApi = {
  getAll: async (page = 1, itemsPerPage = 20) => {
    const response = await api.get<PaginatedResponse<Track>>('/tracks', {
      params: { page, itemsPerPage },
    })
    return response.data
  },
  getOne: async (id: string) => {
    const response = await api.get<Track>(`/tracks/${id}`)
    return response.data
  },
  getRanking: async (period: 'week' | 'month' | 'all' = 'all') => {
    const response = await api.get<PaginatedResponse<Track>>('/tracks/ranking', {
      params: { period },
    })
    return response.data['hydra:member'] || []
  },
  getRecent: async () => {
    const response = await api.get<PaginatedResponse<Track>>('/tracks/recent')
    return response.data['hydra:member'] || []
  },
}

// Artists API
export const artistsApi = {
  getAll: async (page = 1, itemsPerPage = 20) => {
    const response = await api.get<PaginatedResponse<Artist>>('/artists', {
      params: { page, itemsPerPage },
    })
    return response.data
  },
  getOne: async (id: string) => {
    const response = await api.get<Artist>(`/artists/${id}`)
    return response.data
  },
}

// Votes API
export const votesApi = {
  create: async (trackId: string, value: 1 | -1) => {
    const response = await api.post<Vote>('/votes', {
      track: `/api/tracks/${trackId}`,
      value,
    })
    return response.data
  },
  update: async (id: string, value: 1 | -1) => {
    const response = await api.put<Vote>(`/votes/${id}`, { value })
    return response.data
  },
  delete: async (id: string) => {
    await api.delete(`/votes/${id}`)
  },
}
