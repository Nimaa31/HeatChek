<?php

namespace App\Repository;

use App\Entity\Track;
use App\Entity\User;
use App\Entity\Vote;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Vote>
 */
class VoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vote::class);
    }

    public function findUserVoteForTrack(User $user, Track $track): ?Vote
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.user = :user')
            ->andWhere('v.track = :track')
            ->setParameter('user', $user)
            ->setParameter('track', $track)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findUserVotes(User $user): array
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->leftJoin('v.track', 't')
            ->addSelect('t')
            ->orderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
