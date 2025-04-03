<?php
// src/Repository/BlockRepository.php
namespace App\Repository;

use App\Entity\Block;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BlockRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Block::class);
    }

    public function isBlocked(User $blocker, User $blocked): bool
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.blocker = :blocker')
            ->andWhere('b.blocked = :blocked')
            ->setParameter('blocker', $blocker)
            ->setParameter('blocked', $blocked)
            ->getQuery()
            ->getOneOrNullResult() !== null;
    }

    public function findBlockedByUser(User $user): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.blocker = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
