<?php

namespace App\DataFixtures;

use App\Entity\Artist;
use App\Entity\Track;
use App\Entity\User;
use App\Entity\Vote;
use App\Service\DeezerService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private DeezerService $deezerService
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Create test user
        $user = new User();
        $user->setEmail('test@heatcheck.fr');
        $user->setUsername('TestUser');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password123'));
        $manager->persist($user);

        // Create 20 demo users with rap FR style usernames
        $demoUsernames = [
            'KingZo', 'DamsoFan', 'NinhoVibe', 'PLKGang', 'GazoLover',
            'SDMCrew', 'JulMarseil', 'TiakoFlow', 'WerenoiBoss', 'ZiakDrill',
            'SCHArmy', 'LaylowWave', 'DinosFan', 'NiskaLove', 'CentralG',
            'RapFRKing', 'TrapBoy93', 'DrillQueen', 'StreetVibe', 'BeatMaker75'
        ];

        $demoUsers = [];
        foreach ($demoUsernames as $index => $username) {
            $demoUser = new User();
            $demoUser->setEmail('user' . ($index + 1) . '@heatcheck.fr');
            $demoUser->setUsername($username);
            $demoUser->setPassword($this->passwordHasher->hashPassword($demoUser, 'password123'));
            $manager->persist($demoUser);
            $demoUsers[] = $demoUser;
        }

        // Create artists - artistes actuels du rap FR
        $artistNames = [
            'Ninho',
            'Jul',
            'SDM',
            'Gazo',
            'Tiakola',
            'Werenoi',
            'Niska',
            'PLK',
            'Guy2Bezbar',
            'Central Cee',
            'Damso',
            'SCH',
            'Laylow',
            'Dinos',
            'Ziak',
            // Nouveaux artistes
            'Gambi',
            'Gradur',
            'R2',
            'KLN',
            'Alkpote',
            'La Fouine',
            'Sofiane',
            'DJ Vielo',
            'Bilouki',
            'Le Crime',
            'Leto',
            'Kulturr',
            'P.L.L',
            'RnBoi',
            'Nono La Grinta',
            'Keblack',
            'Meryl',
            'Yorssy',
            'Gims',
            'L2B',
            'TDB',
            'VEN1',
            'Maes',
            'Lacrim',
        ];

        $artistEntities = [];
        foreach ($artistNames as $name) {
            $artist = new Artist();
            $artist->setName($name);

            // Fetch artist image from Deezer
            $imageUrl = $this->deezerService->searchArtistImage($name);
            if ($imageUrl !== null) {
                $artist->setImageUrl($imageUrl);
            }

            $manager->persist($artist);
            $artistEntities[$name] = $artist;
        }

        // Tracks récents 2024-2025 avec dates de sortie réalistes
        $tracks = [
            // Ninho - 2024/2025
            ['title' => 'Tout en Gucci', 'artist' => 'Ninho', 'days' => 15],
            ['title' => 'Zipette', 'artist' => 'Ninho', 'days' => 45],

            // Jul - 2024/2025
            ['title' => 'Coup de foudre', 'artist' => 'Jul', 'days' => 10],
            ['title' => 'Lova', 'artist' => 'Jul', 'days' => 60],

            // SDM - 2024
            ['title' => 'Bolide Allemand', 'artist' => 'SDM', 'days' => 30],
            ['title' => 'Laisse-moi', 'artist' => 'SDM', 'days' => 90],

            // Gazo - 2024
            ['title' => 'MAUVAIS', 'artist' => 'Gazo', 'days' => 20],
            ['title' => 'K.M.T', 'artist' => 'Gazo', 'days' => 120],

            // Tiakola - 2024
            ['title' => 'Méchant', 'artist' => 'Tiakola', 'days' => 25],
            ['title' => 'La Débauche', 'artist' => 'Tiakola', 'days' => 100],

            // Werenoi - 2024
            ['title' => 'Pyramide', 'artist' => 'Werenoi', 'days' => 35],
            ['title' => 'Carré VIP', 'artist' => 'Werenoi', 'days' => 80],

            // Niska - 2024
            ['title' => 'Médicament', 'artist' => 'Niska', 'days' => 40],
            ['title' => 'Du lundi au lundi', 'artist' => 'Niska', 'days' => 110],

            // PLK - 2024
            ['title' => 'Pilote', 'artist' => 'PLK', 'days' => 50],
            ['title' => 'Pas les mêmes', 'artist' => 'PLK', 'days' => 130],

            // Guy2Bezbar - 2024
            ['title' => 'Moon', 'artist' => 'Guy2Bezbar', 'days' => 55],
            ['title' => 'Vénus', 'artist' => 'Guy2Bezbar', 'days' => 95],

            // Central Cee - 2024
            ['title' => 'Band4Band', 'artist' => 'Central Cee', 'days' => 12],
            ['title' => 'Doja', 'artist' => 'Central Cee', 'days' => 70],

            // Damso - 2024
            ['title' => 'ICHAM', 'artist' => 'Damso', 'days' => 75],
            ['title' => 'VIERGE', 'artist' => 'Damso', 'days' => 140],

            // SCH - 2024
            ['title' => 'Marché noir', 'artist' => 'SCH', 'days' => 85],
            ['title' => 'Mode Akimbo', 'artist' => 'SCH', 'days' => 150],

            // Laylow - 2024
            ['title' => 'SPECIAL', 'artist' => 'Laylow', 'days' => 65],
            ['title' => 'POIZON', 'artist' => 'Laylow', 'days' => 160],

            // Dinos - 2024
            ['title' => 'Mayday', 'artist' => 'Dinos', 'days' => 105],
            ['title' => '93 Mesures', 'artist' => 'Dinos', 'days' => 180],

            // Ziak - 2024
            ['title' => 'Fixette', 'artist' => 'Ziak', 'days' => 8],
            ['title' => 'Chrome', 'artist' => 'Ziak', 'days' => 115],

            // ========== 30 NOUVEAUX SONS - Janvier/Février 2026 ==========

            // 1. +971 – Ninho
            ['title' => '+971', 'artist' => 'Ninho', 'days' => 3],

            // 2. King Von – Ninho
            ['title' => 'King Von', 'artist' => 'Ninho', 'days' => 7],

            // 3. Boîte Noire – Gambi
            ['title' => 'Boîte Noire', 'artist' => 'Gambi', 'days' => 5],

            // 4. Pas Solo – Gradur & SDM (on met Gradur comme artiste principal)
            ['title' => 'Pas Solo', 'artist' => 'Gradur', 'days' => 10],

            // 5. QUE DES FAITS – Gazo
            ['title' => 'QUE DES FAITS', 'artist' => 'Gazo', 'days' => 4],

            // 6. Ohmygod (feat. KLN) – R2
            ['title' => 'Ohmygod', 'artist' => 'R2', 'days' => 12],

            // 7. Billets Mauves (feat. SDM) – Ninho
            ['title' => 'Billets Mauves', 'artist' => 'Ninho', 'days' => 6],

            // 8. PING PONG (feat. Gazo) – Alkpote
            ['title' => 'PING PONG', 'artist' => 'Alkpote', 'days' => 14],

            // 9. Van Dijk – La Fouine & Sofiane
            ['title' => 'Van Dijk', 'artist' => 'La Fouine', 'days' => 18],

            // 10. TikiTaka – DJ Vielo
            ['title' => 'TikiTaka', 'artist' => 'DJ Vielo', 'days' => 9],

            // 11. Peur Bleue – Bilouki
            ['title' => 'Peur Bleue', 'artist' => 'Bilouki', 'days' => 22],

            // 12. Ballon d'Or – Le Crime & Leto
            ['title' => "Ballon d'Or", 'artist' => 'Leto', 'days' => 11],

            // 13. Les diamants de Bokassa – Ninho & Tiakola
            ['title' => 'Les diamants de Bokassa', 'artist' => 'Ninho', 'days' => 2],

            // 14. Busy – Kulturr & Leto
            ['title' => 'Busy', 'artist' => 'Leto', 'days' => 16],

            // 15. Paola – P.L.L
            ['title' => 'Paola', 'artist' => 'P.L.L', 'days' => 25],

            // 16. Avec Moi – RnBoi & Nono La Grinta
            ['title' => 'Avec Moi', 'artist' => 'RnBoi', 'days' => 19],

            // 17. Hypocrite – Keblack
            ['title' => 'Hypocrite', 'artist' => 'Keblack', 'days' => 28],

            // 18. C'est bon – Meryl & Yorssy
            ['title' => "C'est bon", 'artist' => 'Meryl', 'days' => 13],

            // 19. Bloqué – Gims & L2B
            ['title' => 'Bloqué', 'artist' => 'Gims', 'days' => 21],

            // 20. Mon Ex – TDB
            ['title' => 'Mon Ex', 'artist' => 'TDB', 'days' => 17],

            // 21. Ruinart – R2
            ['title' => 'Ruinart', 'artist' => 'R2', 'days' => 8],

            // 22. MON BÉBÉ – RnBoi
            ['title' => 'MON BÉBÉ', 'artist' => 'RnBoi', 'days' => 23],

            // 23. BOLIDE ALLEMAND 1/2 – SDM
            ['title' => 'BOLIDE ALLEMAND', 'artist' => 'SDM', 'days' => 1],

            // 24. Adriano – Niska
            ['title' => 'Adriano', 'artist' => 'Niska', 'days' => 6],

            // 25. Phénoménal – JuL
            ['title' => 'Phénoménal', 'artist' => 'Jul', 'days' => 4],

            // 26. Hakayet – VEN1
            ['title' => 'Hakayet', 'artist' => 'VEN1', 'days' => 15],

            // 27. CARTIER SANTOS – SDM
            ['title' => 'CARTIER SANTOS', 'artist' => 'SDM', 'days' => 9],

            // 28. MAGIE – Maes
            ['title' => 'MAGIE', 'artist' => 'Maes', 'days' => 20],

            // 29. NO LO SÉ – Lacrim
            ['title' => 'NO LO SÉ', 'artist' => 'Lacrim', 'days' => 26],

            // 30. Poney – PLK
            ['title' => 'Poney', 'artist' => 'PLK', 'days' => 11],
        ];

        $trackEntities = [];
        foreach ($tracks as $trackData) {
            $artistName = $trackData['artist'];
            if (!isset($artistEntities[$artistName])) {
                continue;
            }

            $track = new Track();
            $track->setTitle($trackData['title']);
            $track->setArtist($artistEntities[$artistName]);
            $track->setReleaseDate(new \DateTime('-' . $trackData['days'] . ' days'));

            // Fetch cover from Deezer
            $coverUrl = $this->deezerService->searchTrackCover($artistName, $trackData['title']);
            if ($coverUrl !== null) {
                $track->setCoverUrl($coverUrl);
            }

            $manager->persist($track);
            $trackEntities[] = $track;
        }

        // Build track index by title for vote distribution
        $tracksByTitle = [];
        foreach ($trackEntities as $track) {
            $tracksByTitle[$track->getTitle()] = $track;
        }

        // Define vote distribution for realistic ranking
        // Top tracks: mostly positive votes (score +15 to +30)
        $topTracks = ['MAGIE', 'Phénoménal', 'CARTIER SANTOS', 'Adriano', '+971'];

        // Mid tracks: positive but fewer votes (score +5 to +15)
        $midTracks = ['QUE DES FAITS', 'Boîte Noire', 'King Von', 'BOLIDE ALLEMAND', 'Les diamants de Bokassa', 'Billets Mauves'];

        // Controversial tracks: mixed votes (score close to 0)
        $controversialTracks = ['Poney', 'Van Dijk', 'PING PONG', 'Bloqué'];

        // All demo users + test user
        $allUsers = array_merge([$user], $demoUsers);

        // Generate votes for each user (10-25 votes per user)
        foreach ($allUsers as $currentUser) {
            $numVotes = rand(10, 25);
            $votedTracks = [];

            for ($i = 0; $i < $numVotes; $i++) {
                // Pick a random track that hasn't been voted by this user
                $randomIndex = rand(0, count($trackEntities) - 1);
                if (isset($votedTracks[$randomIndex])) {
                    continue;
                }
                $votedTracks[$randomIndex] = true;

                $track = $trackEntities[$randomIndex];
                $trackTitle = $track->getTitle();

                // Determine vote value based on track category
                if (in_array($trackTitle, $topTracks)) {
                    // Top tracks: 90% positive
                    $value = (rand(1, 100) <= 90) ? 1 : -1;
                } elseif (in_array($trackTitle, $midTracks)) {
                    // Mid tracks: 75% positive
                    $value = (rand(1, 100) <= 75) ? 1 : -1;
                } elseif (in_array($trackTitle, $controversialTracks)) {
                    // Controversial: 50/50
                    $value = (rand(0, 1) === 1) ? 1 : -1;
                } else {
                    // Other tracks: 60% positive
                    $value = (rand(1, 100) <= 60) ? 1 : -1;
                }

                $vote = new Vote();
                $vote->setUser($currentUser);
                $vote->setTrack($track);
                $vote->setValue($value);
                $manager->persist($vote);
            }
        }

        $manager->flush();
    }
}
