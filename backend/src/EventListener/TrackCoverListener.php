<?php

namespace App\EventListener;

use App\Entity\Track;
use App\Service\DeezerService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: Track::class)]
class TrackCoverListener
{
    public function __construct(
        private DeezerService $deezerService
    ) {
    }

    public function prePersist(Track $track): void
    {
        // Only fetch cover if not already set
        if ($track->getCoverUrl() !== null) {
            return;
        }

        $artist = $track->getArtist();
        if ($artist === null) {
            return;
        }

        $coverUrl = $this->deezerService->searchTrackCover(
            $artist->getName(),
            $track->getTitle()
        );

        if ($coverUrl !== null) {
            $track->setCoverUrl($coverUrl);
        }
    }
}
