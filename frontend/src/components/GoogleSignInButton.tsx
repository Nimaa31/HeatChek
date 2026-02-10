import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface GoogleSignInButtonProps {
  onError?: (error: string) => void
}

export default function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const navigate = useNavigate()
  const { googleLogin, clearError } = useAuthStore()

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    clearError()
    if (!credentialResponse.credential) {
      onError?.('Erreur lors de la connexion Google')
      return
    }

    try {
      await googleLogin(credentialResponse.credential)
      navigate('/')
    } catch {
      onError?.('Erreur lors de la connexion Google')
    }
  }

  const handleError = () => {
    onError?.('Erreur lors de la connexion Google')
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_black"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="300"
      />
    </div>
  )
}
