<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private JWTTokenManagerInterface $jwtManager,
        private HttpClientInterface $httpClient,
        #[Autowire('%google_client_id%')]
        private string $googleClientId,
    ) {}

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // This method is handled by the JWT authentication
        // The actual login logic is in security.yaml
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        return $this->json([
            'message' => 'Login successful',
            'user' => [
                'email' => $user->getUserIdentifier(),
            ]
        ]);
    }

    #[Route('/google', name: 'api_auth_google', methods: ['POST'])]
    public function googleLogin(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $credential = $data['credential'] ?? null;

        if (!$credential) {
            return $this->json(['message' => 'Missing credential'], 400);
        }

        // Verify the token with Google
        try {
            $response = $this->httpClient->request('GET', 'https://oauth2.googleapis.com/tokeninfo', [
                'query' => ['id_token' => $credential],
            ]);

            $tokenInfo = $response->toArray();
        } catch (\Exception $e) {
            return $this->json(['message' => 'Invalid Google token'], 401);
        }

        // Verify the audience (client ID) matches
        if (($tokenInfo['aud'] ?? '') !== $this->googleClientId) {
            return $this->json(['message' => 'Invalid token audience'], 401);
        }

        $googleId = $tokenInfo['sub'] ?? null;
        $email = $tokenInfo['email'] ?? null;
        $name = $tokenInfo['name'] ?? $tokenInfo['email'] ?? 'User';
        $picture = $tokenInfo['picture'] ?? null;

        if (!$googleId || !$email) {
            return $this->json(['message' => 'Invalid token data'], 401);
        }

        // Find user by Google ID or email
        $user = $this->userRepository->findByGoogleId($googleId);

        if (!$user) {
            // Try to find by email
            $user = $this->userRepository->findByEmail($email);

            if ($user) {
                // Link existing account with Google
                $user->setGoogleId($googleId);
                if ($picture && !$user->getAvatarUrl()) {
                    $user->setAvatarUrl($picture);
                }
            } else {
                // Create new user
                $user = new User();
                $user->setEmail($email);
                $user->setGoogleId($googleId);
                $user->setUsername($this->generateUniqueUsername($name));
                if ($picture) {
                    $user->setAvatarUrl($picture);
                }
            }

            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }

        // Generate JWT token
        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
                'avatarUrl' => $user->getAvatarUrl(),
            ],
        ]);
    }

    private function generateUniqueUsername(string $baseName): string
    {
        // Clean the name
        $username = preg_replace('/[^a-zA-Z0-9]/', '', $baseName);
        if (strlen($username) < 3) {
            $username = 'User';
        }
        $username = substr($username, 0, 40);

        // Check if username exists
        $existingUser = $this->userRepository->findOneBy(['username' => $username]);
        if (!$existingUser) {
            return $username;
        }

        // Add random suffix
        $suffix = random_int(100, 9999);
        return substr($username, 0, 45) . $suffix;
    }
}
