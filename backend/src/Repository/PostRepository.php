<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    /**
     * Ajoute un post en base de données
     */
    public function add(Post $post, bool $flush = true): void
    {
        $this->getEntityManager()->persist($post);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Supprime un post de la base de données
     */
    public function remove(Post $post, bool $flush = true): void
    {
        $this->getEntityManager()->remove($post);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Récupère les derniers posts (triés du plus récent au plus ancien)
     */
    public function findLatestPosts(int $limit = 10): array
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
    /**
     * Paginate all posts ordered by the latest
     */
    public function paginateAllOrderedByLatest(int $offset, int $count): Paginator
    {
        $query = $this->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($count)
            ->getQuery();

        return new Paginator($query);
    }

    public function findPaginatedPosts(int $page, int $limit, ?User $user)
    {
        $qb = $this->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($user) {
            $qb->andWhere('p.author != :user')
                ->setParameter('user', $user->getId());
        }

        return $qb->getQuery()->getResult();
    }
    public function isTokenValid(string $token): bool
    {
        // Add your token validation logic here
        return $this->token === $token; // Example logic
    }
}
