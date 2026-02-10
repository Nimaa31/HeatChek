<?php

namespace App\Repository;

use App\Entity\Track;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Track>
 */
class TrackRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Track::class);
    }

    public function findRankedTracks(string $period = 'all', int $limit = 50): array
    {
        $qb = $this->createQueryBuilder('t')
            ->select('t', 'a', 'SUM(v.value) as HIDDEN score')
            ->leftJoin('t.artist', 'a')
            ->leftJoin('t.votes', 'v');

        if ($period === 'week') {
            $qb->andWhere('v.createdAt >= :date OR v.createdAt IS NULL')
               ->setParameter('date', new \DateTimeImmutable('-7 days'));
        } elseif ($period === 'month') {
            $qb->andWhere('v.createdAt >= :date OR v.createdAt IS NULL')
               ->setParameter('date', new \DateTimeImmutable('-30 days'));
        }

        return $qb->groupBy('t.id', 'a.id')
            ->orderBy('score', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getTrackWithScore(Track $track): array
    {
        $result = $this->createQueryBuilder('t')
            ->select('t', 'a',
                'SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END) as upvotes',
                'SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END) as downvotes',
                'SUM(v.value) as score'
            )
            ->leftJoin('t.artist', 'a')
            ->leftJoin('t.votes', 'v')
            ->where('t.id = :id')
            ->setParameter('id', $track->getId(), 'uuid')
            ->groupBy('t.id', 'a.id')
            ->getQuery()
            ->getOneOrNullResult();

        return $result;
    }

    /**
     * Find tracks released in the last N days
     */
    public function findRecentTracks(int $days = 7, int $limit = 10): array
    {
        return $this->createQueryBuilder('t')
            ->select('t', 'a', 'SUM(v.value) as HIDDEN score')
            ->leftJoin('t.artist', 'a')
            ->leftJoin('t.votes', 'v')
            ->where('t.releaseDate >= :date')
            ->setParameter('date', new \DateTimeImmutable("-{$days} days"))
            ->groupBy('t.id', 'a.id')
            ->orderBy('t.releaseDate', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
