<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class PostController extends AbstractController
{
    // Méthode utilitaire pour récupérer l'utilisateur via le Bearer token
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
    public function getPosts(
        Request $request,
        PostRepository $postRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = (int)$request->query->get('limit', 50);

        $posts = $postRepository->findPaginatedPosts($page, $limit, $user);

        $postsData = [];
        foreach ($posts as $post) {
            $author = $post->getAuthor();

            // Vérifie si l'auteur est banni
            if ($author->getIsBlocked()) {
                $postsData[] = [
                    'id' => $post->getId(),
                    'content' => 'Cet utilisateur est banni',
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($post->getLikes()),
                    'isLiked' => false,
                    'authorId' => $author->getId(),
                    'isFollowing' => false,
                ];
                continue; // Ignore le reste du traitement pour ce post
            }

            $isFollowing = $user ? $postRepository->isFollowing($user, $author) : false;

            $postsData[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'isLiked' => $user ? $post->isLikedByUser($user) : false,
                'authorId' => $author->getId(),
                'isFollowing' => $isFollowing,
            ];
        }

        return new JsonResponse(['posts' => $postsData], JsonResponse::HTTP_OK);
    }



    #[Route('/api/posts', methods: ['POST'], defaults: ["_format" => "json"])]
    public function createPost(
        Request $request,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content'])) {
            return new JsonResponse(['error' => 'Content is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $post = new Post();
        $post->setContent($data['content']);
        $post->setCreatedAt(new \DateTime());
        $post->setAuthor($user);

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post created successfully'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/api/posts/{id}/like', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function likePost(
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

        $post->addLike($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post liked successfully', 'likes' => count($post->getLikes())], JsonResponse::HTTP_OK);
    }

    #[Route('/api/posts/{id}/unlike', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function unlikePost(
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

        $post->removeLike($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post unliked successfully', 'likes' => count($post->getLikes())], JsonResponse::HTTP_OK);
    }

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

    #[Route('/api/users/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getUserById(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'username' => $user->getUsername(),
            'bio' => $user->getBio(),
            'profilePicture' => $user->getProfilePicture(),
            'banner' => $user->getBanner(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),


            // Ajoute d'autres champs si nécessaire
        ], JsonResponse::HTTP_OK);
    }
}
