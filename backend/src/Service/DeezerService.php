<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class DeezerService
{
    private const DEEZER_API_URL = 'https://api.deezer.com';

    public function __construct(
        private HttpClientInterface $httpClient
    ) {
    }

    /**
     * Search for a track on Deezer and return the cover URL
     */
    public function searchTrackCover(string $artist, string $title): ?string
    {
        try {
            $query = sprintf('%s %s', $artist, $title);
            $response = $this->httpClient->request('GET', self::DEEZER_API_URL . '/search', [
                'query' => [
                    'q' => $query,
                    'limit' => 1,
                ],
            ]);

            $data = $response->toArray();

            if (empty($data['data'])) {
                return null;
            }

            $track = $data['data'][0];

            // Return the album cover (big size)
            return $track['album']['cover_big'] ?? $track['album']['cover_medium'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Search for an artist on Deezer and return the image URL
     */
    public function searchArtistImage(string $artistName): ?string
    {
        try {
            $response = $this->httpClient->request('GET', self::DEEZER_API_URL . '/search/artist', [
                'query' => [
                    'q' => $artistName,
                    'limit' => 1,
                ],
            ]);

            $data = $response->toArray();

            if (empty($data['data'])) {
                return null;
            }

            $artist = $data['data'][0];

            // Return the artist picture (big size)
            return $artist['picture_big'] ?? $artist['picture_medium'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get specific track info by Deezer track ID
     */
    public function getTrackById(int $deezerId): ?array
    {
        try {
            $response = $this->httpClient->request('GET', self::DEEZER_API_URL . '/track/' . $deezerId);
            return $response->toArray();
        } catch (\Exception $e) {
            return null;
        }
    }
}
