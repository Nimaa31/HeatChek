<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class UserProfileProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $processor,
        private Security $security
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof User) {
            return $this->processor->process($data, $operation, $uriVariables, $context);
        }

        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new BadRequestHttpException('Utilisateur non connecté');
        }

        // Ensure we're updating the current user
        if ($data->getId()?->toRfc4122() !== $currentUser->getId()?->toRfc4122()) {
            throw new BadRequestHttpException('Vous ne pouvez modifier que votre propre profil');
        }

        // Validate avatar URL if provided
        if ($data->getAvatarUrl() !== null && $data->getAvatarUrl() !== '') {
            if (!filter_var($data->getAvatarUrl(), FILTER_VALIDATE_URL)) {
                throw new BadRequestHttpException('URL d\'avatar invalide');
            }
        }

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }
}
