<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Repository\VoteRepository;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserVotesProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private VoteRepository $voteRepository
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return [];
        }

        return $this->voteRepository->findUserVotes($user);
    }
}
