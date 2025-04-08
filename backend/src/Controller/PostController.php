<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Notification;

class PostController extends AbstractController
{
    private function getUserFromBearer(Request $request, UserRepository $userRepository): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && 0 === strpos($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            return $userRepository->findOneBy(['apiToken' => $token]);
        }
        return null;
    }
    #[Route('/api/posts', methods: ['GET'], defaults: ["_format" => "json"])]
    public function getPosts(Request $request, PostRepository $postRepository, UserRepository $userRepository): JsonResponse
    {
        $user = $this->getUserFromBearer($request, $userRepository);
        $posts = $postRepository->createQueryBuilder('p')
            ->leftJoin('p.parent', 'parent')
            ->addSelect('parent')
            ->where('p.parent IS NULL OR (p.parent IS NOT NULL AND p.content IS NOT NULL)')
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $formatReplies = function ($repliesCollection) use ($user) {
            return array_map(function (Post $replyPost) use ($user) {
                $replyAuthor = $replyPost->getAuthor();
                return [
                    'id' => $replyPost->getId(),
                    'content' => $replyPost->getContent(),
                    'created_at' => $replyPost->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($replyPost->getLikes()),
                    'isLiked' => $user ? $replyPost->getLikes()->contains($user) : false,
                    'authorId' => $replyAuthor->getId(),
                    'authorUsername' => $replyAuthor->getUsername(),
                    'media' => $replyPost->getMedia() ?? [],
                    'isCensored' => $replyPost->isCensored(),
                ];
            }, $repliesCollection->toArray());
        };

        $postsData = array_map(function (Post $post) use ($user, $formatReplies) {
            $author = $post->getAuthor();
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'isLiked' => $user ? $post->getLikes()->contains($user) : false,
                'authorId' => $author->getId(),
                'authorUsername' => $author->getUsername(),
                'media' => $post->getMedia() ?? [],
                'replies' => $post->isLocked() ? [] : $formatReplies($post->getReplies()),
                'isCensored' => $post->isCensored(),
                'isLocked' => $post->isLocked(),
            ];
        }, $posts);

        return new JsonResponse(['posts' => $postsData], JsonResponse::HTTP_OK);
    }

    #[Route('/api/posts', methods: ['POST'], defaults: ["_format" => "json"])]
    public function createPost(Request $request, EntityManagerInterface $entityManager, UserRepository $userRepository, PostRepository $postRepository): JsonResponse
    {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $parentId = $request->request->get('parent_id');
        $parentPost = $parentId ? $postRepository->find($parentId) : null;

        if ($parentId && !$parentPost) {
            return new JsonResponse(['error' => 'Parent post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 🔥 AJOUT : vérifier mode lecture seule
        if ($parentPost && $parentPost->getAuthor()->isReadOnlyMode()) {
            return new JsonResponse(['error' => 'Impossible de répondre à un post dont l\'auteur est en mode lecture seule.'], JsonResponse::HTTP_FORBIDDEN);
        }

        if ($user->isReadOnlyMode()) {
            return new JsonResponse(['error' => 'Votre profil est en mode lecture seule. Impossible de publier.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $content = $request->request->get('content');
        if (!$content) {
            return new JsonResponse(['error' => 'Content is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $post = new Post();
        $post->setContent($content);
        $post->setCreatedAt(new \DateTime());
        $post->setAuthor($user);

        if ($parentPost) {
            $post->setParent($parentPost);
        }
        if ($parentPost && $parentPost->getAuthor() !== $user) {
            $notification = new Notification();
            $notification->setRecipient($parentPost->getAuthor());
            $notification->setSender($user);
            $notification->setType('reply');
            $notification->setPostId($parentPost->getId());
            $entityManager->persist($notification);
        }

        $mediaFiles = $request->files->get('mediaFiles');
        $mediaPaths = [];

        if ($mediaFiles) {
            foreach ($mediaFiles as $file) {
                if ($file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile) {
                    $newFilename = uniqid() . '.' . $file->guessExtension();
                    $destination = $this->getParameter('media_directory');
                    $file->move($destination, $newFilename);
                    $mediaPaths[] = '/uploads/media/' . $newFilename;
                }
            }
        }

        if (!empty($mediaPaths)) {
            $post->setMedia($mediaPaths);
        }
        preg_match_all('/@(\w+)/', $content, $matches);
        $mentionedUsernames = $matches[1] ?? [];

        foreach ($mentionedUsernames as $mentionedUsername) {
            $mentionedUser = $userRepository->findOneBy(['username' => $mentionedUsername]);
            if ($mentionedUser && $mentionedUser !== $user) {
                $mentionNotification = new Notification();
                $mentionNotification->setRecipient($mentionedUser);
                $mentionNotification->setSender($user);
                $mentionNotification->setType('mention');
                $mentionNotification->setPostId($post->getId());
                $entityManager->persist($mentionNotification);
            }
        }
        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'message'  => 'Post created successfully',
            'media'    => $mediaPaths,
            'parentId' => $parentPost ? $parentPost->getId() : null,
        ], JsonResponse::HTTP_CREATED);

        $entityManager->persist($post);
        $entityManager->flush();
    }

    #[Route('/api/posts/{id}/like', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function likePost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager, Request $request, UserRepository $userRepository): JsonResponse
    {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 🔥 AJOUT : vérifier mode lecture seule auteur
        if ($post->getAuthor()->isReadOnlyMode()) {
            return new JsonResponse(['error' => 'Impossible de liker un post dont l\'auteur est en mode lecture seule.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $post->addLike($user);
        $entityManager->flush();

        if ($post->getAuthor() !== $user) {
            $notification = new Notification();
            $notification->setRecipient($post->getAuthor());
            $notification->setSender($user);
            $notification->setType('like');
            $notification->setPostId($post->getId());
            $entityManager->persist($notification);
            $entityManager->flush();
        }

        return new JsonResponse([
            'message' => 'Post liked successfully',
            'likes'   => count($post->getLikes()),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/api/posts/{id}/unlike', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function unlikePost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager, Request $request, UserRepository $userRepository): JsonResponse
    {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 🔥 AJOUT : vérifier mode lecture seule auteur
        if ($post->getAuthor()->isReadOnlyMode()) {
            return new JsonResponse(['error' => 'Impossible de retirer un like sur un post dont l\'auteur est en mode lecture seule.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $post->removeLike($user);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Post unliked successfully',
            'likes'   => count($post->getLikes()),
        ], JsonResponse::HTTP_OK);
    }

    /**
     * Supprime un post
     */
    #[Route('/api/posts/{id}', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function deletePost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Request $request,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifie si l'utilisateur est l'auteur du post
        if ($post->getAuthor() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post deleted successfully'], JsonResponse::HTTP_OK);
    }

    /**
     * Récupère un utilisateur par son ID
     */
    #[Route('/api/users/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getUserById(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id'             => $user->getId(),
            'email'          => $user->getEmail(),
            'roles'          => $user->getRoles(),
            'username'       => $user->getUsername(),
            'bio'            => $user->getBio(),
            'profilePicture' => $user->getProfilePicture(),
            'banner'         => $user->getBanner(),
            'location'       => $user->getLocation(),
            'website'        => $user->getWebsite(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/api/admin/posts', name: 'get_all_posts', methods: ['GET'])]
    public function getAllPosts(PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findAllWithUser();
        $data = [];

        foreach ($posts as $post) {
            $data[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'isCensored' => $post->isCensored(),
                'author' => [
                    'username' => $post->getUser()->getUsername(),
                ],
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/posts/search', name: 'api_posts_search', methods: ['GET'])]
    public function searchPosts(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $query = $request->query->get('q', '');

        $posts = $em->getRepository(Post::class)->createQueryBuilder('p')
            ->leftJoin('p.author', 'a')
            ->where('p.content LIKE :query OR a.username LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $data = array_map(function (Post $post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'isLiked' => false, // Tu peux améliorer plus tard avec le user connecté
                'authorId' => $post->getAuthor()?->getId(),
                'authorUsername' => $post->getAuthor()?->getUsername(),
                'media' => [], // Tu peux ajouter les médias si besoin
                'replies' => [], // Idem pour les replies
                'isCensored' => $post->isCensored(),
            ];
        }, $posts);

        return new JsonResponse(['posts' => $data]);
    }

    #[Route('/api/hashtag/{hashtag}', name: 'api_posts_by_hashtag', methods: ['GET'])]
    public function getPostsByHashtag(string $hashtag, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $posts = $em->getRepository(Post::class)->createQueryBuilder('p')
            ->where('p.content LIKE :hashtag')
            ->setParameter('hashtag', '%#' . $hashtag . '%')
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $user = $this->getUserFromBearer($request, $em->getRepository(User::class));
        $formatReplies = function ($repliesCollection) use ($user) {
            return array_map(function (Post $replyPost) use ($user) {
                $replyAuthor = $replyPost->getAuthor();
                return [
                    'id' => $replyPost->getId(),
                    'content' => $replyPost->getContent(),
                    'created_at' => $replyPost->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($replyPost->getLikes()),
                    'isLiked' => $user ? $replyPost->getLikes()->contains($user) : false,
                    'authorId' => $replyAuthor->getId(),
                    'authorUsername' => $replyAuthor->getUsername(),
                    'media' => $replyPost->getMedia() ?? [],
                    'isCensored' => $replyPost->isCensored(),
                ];
            }, $repliesCollection->toArray());
        };

        $data = array_map(function (Post $post) use ($user, $formatReplies) {
            $author = $post->getAuthor();
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'isLiked' => $user ? $post->getLikes()->contains($user) : false,
                'authorId' => $author->getId(),
                'authorUsername' => $author->getUsername(),
                'media' => $post->getMedia() ?? [],
                'replies' => $formatReplies($post->getReplies()),
                'isCensored' => $post->isCensored(),

                // 🔥 NOUVEAU pour afficher si c'est un retweet :
                'parent' => $post->getParent() ? [
                    'id' => $post->getParent()->getId(),
                    'content' => $post->getParent()->getContent(),
                    'authorUsername' => $post->getParent()->getAuthor()->getUsername(),
                    'media' => $post->getParent()->getMedia() ?? [],
                    'created_at' => $post->getParent()->getCreatedAt()->format('Y-m-d H:i:s'),
                ] : null,
            ];
        }, $posts);

        return new JsonResponse(['posts' => $data]);
    }

    #[Route('/api/posts/{id}/retweet', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function retweetPost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Request $request,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $originalPost = $postRepository->find($id);
        if (!$originalPost) {
            return new JsonResponse(['error' => 'Original post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 🔥 S'il veut ajouter un commentaire au retweet
        $comment = $request->request->get('comment');

        $retweet = new Post();
        $retweet->setContent($comment ?? ''); // Si commentaire vide, simple retweet
        $retweet->setCreatedAt(new \DateTime());
        $retweet->setAuthor($user);
        $retweet->setParent($originalPost);

        // Pour afficher plus facilement, on pourrait dupliquer les médias de l'original si tu veux (ici non)
        $entityManager->persist($retweet);
        $entityManager->flush();

        if ($originalPost->getAuthor() !== $user) {
            $notification = new Notification();
            $notification->setRecipient($originalPost->getAuthor());
            $notification->setSender($user);
            $notification->setType('retweet');
            $notification->setPostId($originalPost->getId());
            $entityManager->persist($notification);
            $entityManager->flush();
        }

        return new JsonResponse([
            'message' => $comment ? 'Post retweeted with comment' : 'Post retweeted successfully',
            'retweetId' => $retweet->getId(),
        ], JsonResponse::HTTP_CREATED);
    }
    #[Route('/api/posts/{id}/lock', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function lockPost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Request $request,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($post->getAuthor() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        $post->setLocked(true);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post locked successfully']);
    }

    #[Route('/api/posts/{id}/unlock', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function unlockPost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Request $request,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($post->getAuthor() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        $post->setLocked(false);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post unlocked successfully']);
    }

    #[Route('/api/profile/{username}/toggle-comment-privacy', methods: ['PUT'])]
    public function toggleCommentPrivacy(string $username, Request $request, UserRepository $userRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user || $user->getUsername() !== $username) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        $user->setOnlyFollowersCanComment(!$user->isOnlyFollowersCanComment());
        $em->flush();

        return new JsonResponse(['message' => 'Comment privacy toggled successfully']);
    }
}
