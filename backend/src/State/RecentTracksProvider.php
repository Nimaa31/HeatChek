<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\TrackRepository;

final class RecentTracksProvider implements ProviderInterface
{
    public function __construct(
        private TrackRepository $trackRepository
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        return $this->trackRepository->findRecentTracks(7); // Last 7 days
    }
}
