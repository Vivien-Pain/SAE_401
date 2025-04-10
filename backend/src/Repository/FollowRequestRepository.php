<?php
// src/Repository/FollowRequestRepository.php

namespace App\Repository;

use App\Entity\FollowRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FollowRequest>
 */
class FollowRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FollowRequest::class);
    }

    // Si besoin de récupérer toutes les demandes d'un utilisateur
    public function findPendingRequestsForUser(int $userId)
    {
        return $this->createQueryBuilder('f')
            ->where('f.requested = :userId')
            ->andWhere('f.isAccepted = false')
            ->setParameter('userId', $userId)
            ->orderBy('f.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
