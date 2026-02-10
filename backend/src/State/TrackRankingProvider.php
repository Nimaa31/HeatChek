<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\TrackRepository;
use Symfony\Component\HttpFoundation\RequestStack;

final class TrackRankingProvider implements ProviderInterface
{
    public function __construct(
        private TrackRepository $trackRepository,
        private RequestStack $requestStack
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $request = $this->requestStack->getCurrentRequest();
        $period = $request?->query->get('period', 'all') ?? 'all';

        if (!in_array($period, ['week', 'month', 'all'], true)) {
            $period = 'all';
        }

        return $this->trackRepository->findRankedTracks($period);
    }
}
