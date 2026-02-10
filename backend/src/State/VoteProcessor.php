<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Vote;
use App\Entity\User;
use App\Entity\Track;
use App\Repository\VoteRepository;
use App\Repository\TrackRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Uid\Uuid;

final class VoteProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $processor,
        private Security $security,
        private VoteRepository $voteRepository,
        private TrackRepository $trackRepository,
        private RequestStack $requestStack,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Vote) {
            return $this->processor->process($data, $operation, $uriVariables, $context);
        }

        try {
            $user = $this->security->getUser();
            if (!$user instanceof User) {
                throw new BadRequestHttpException('Utilisateur non connecté');
            }

            // Validate vote value
            if (!in_array($data->getValue(), [-1, 1], true)) {
                throw new BadRequestHttpException('La valeur du vote doit être -1 ou 1');
            }

            // For PUT requests, fetch the existing vote and update it
            if ($operation instanceof Put) {
                $voteId = $uriVariables['id'] ?? null;
                if ($voteId === null) {
                    throw new BadRequestHttpException('Vote non trouvé');
                }

                // Fetch the original vote from database to preserve user and track
                $existingVote = $this->voteRepository->find($voteId);
                if ($existingVote === null) {
                    throw new BadRequestHttpException('Vote non trouvé');
                }

                // Security check: ensure the vote belongs to the current user
                if ($existingVote->getUser()?->getId()->toRfc4122() !== $user->getId()->toRfc4122()) {
                    throw new BadRequestHttpException('Vous ne pouvez pas modifier ce vote');
                }

                // Only update the value, keep user and track from existing vote
                $existingVote->setValue($data->getValue());

                return $this->processor->process($existingVote, $operation, $uriVariables, $context);
            }

            // For new votes (POST)
            if ($operation instanceof Post) {
                $track = $data->getTrack();

                // If track is null, try to resolve it from the request body
                if ($track === null) {
                    $track = $this->resolveTrackFromRequest();
                }

                if ($track === null) {
                    throw new BadRequestHttpException('Le track est requis');
                }

                // Set the track on the vote
                $data->setTrack($track);

                // Check if user already voted for this track - if so, update instead of creating new (upsert)
                $existingVote = $this->voteRepository->findUserVoteForTrack($user, $track);

                if ($existingVote !== null) {
                    // Upsert: update existing vote instead of creating new one
                    $existingVote->setValue($data->getValue());
                    return $this->processor->process($existingVote, $operation, $uriVariables, $context);
                }

                $data->setUser($user);
            }

            return $this->processor->process($data, $operation, $uriVariables, $context);

        } catch (BadRequestHttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            // Log the real error for debugging
            error_log('Vote processing error: ' . $e->getMessage());

            // Return user-friendly message
            throw new BadRequestHttpException('Impossible de traiter le vote, veuillez réessayer');
        }
    }

    private function resolveTrackFromRequest(): ?Track
    {
        $request = $this->requestStack->getCurrentRequest();
        if ($request === null) {
            return null;
        }

        $content = $request->getContent();
        $data = json_decode($content, true);

        if (!isset($data['track'])) {
            return null;
        }

        $trackIri = $data['track'];

        // Extract UUID from IRI like "/api/tracks/uuid"
        if (preg_match('#/api/tracks/([a-f0-9-]+)$#i', $trackIri, $matches)) {
            $trackId = $matches[1];
            try {
                $uuid = Uuid::fromString($trackId);
                return $this->trackRepository->find($uuid);
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }
}
