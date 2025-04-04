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
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Common\Collections\Collection;

class PostController extends AbstractController
{
    /**
     * Récupère l'utilisateur à partir du Bearer Token
     */
    private function getUserFromBearer(Request $request, UserRepository $userRepository): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && 0 === strpos($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            return $userRepository->findOneBy(['apiToken' => $token]);
        }
        return null;
    }

    /**
     * Récupère tous les posts (avec leurs réponses directes)
     */
    #[Route('/api/posts', methods: ['GET'], defaults: ["_format" => "json"])]
    public function getPosts(
        Request $request,
        PostRepository $postRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);

        // ⚠️ Récupère uniquement les posts parents (ceux sans parent)
        $posts = $postRepository->findBy(['parent' => null], ['created_at' => 'DESC']);

        // Fonction pour formatter les réponses (replies) d’un post
        $formatReplies = function (Collection $repliesCollection) use ($user) {
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
                    'isCensored' => $replyPost->isCensored(), // ✅ Ajout ici
                ];
            }, $repliesCollection->toArray());
        };

        // Fonction pour formatter chaque post parent avec ses replies
        $postsData = array_map(function (Post $post) use ($user, $formatReplies) {
            $author = $post->getAuthor();
            $replies = $post->getReplies();

            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes' => count($post->getLikes()),
                'isLiked' => $user ? $post->getLikes()->contains($user) : false,
                'authorId' => $author->getId(),
                'authorUsername' => $author->getUsername(),
                'media' => $post->getMedia() ?? [],
                'replies' => $formatReplies($replies),
                'isCensored' => $post->isCensored(), // ✅ Ajout ici
            ];
        }, $posts);

        return new JsonResponse(['posts' => $postsData], JsonResponse::HTTP_OK);
    }

    /**
     * Crée un nouveau post ou une réponse si "parent_id" est fourni
     */
    #[Route('/api/posts', methods: ['POST'], defaults: ["_format" => "json"])]
    public function createPost(
        Request $request,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        PostRepository $postRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Récupère le contenu du post
        $content = $request->request->get('content');
        if (!$content) {
            return new JsonResponse(['error' => 'Content is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifie si un parent_id est fourni (pour faire une "réponse")
        $parentId = $request->request->get('parent_id'); // <-- CHAMP IMPORTANT
        $parentPost = null;

        if ($parentId) {
            $parentPost = $postRepository->find($parentId);
            if (!$parentPost) {
                return new JsonResponse(['error' => 'Parent post not found'], JsonResponse::HTTP_NOT_FOUND);
            }
        }

        // On crée un nouveau Post
        $post = new Post();
        $post->setContent($content);
        $post->setCreatedAt(new \DateTime());
        $post->setAuthor($user);

        // On rattache le parent si c’est un reply
        if ($parentPost) {
            $post->setParent($parentPost);
        }

        // Gestion des fichiers média
        $mediaFiles = $request->files->get('mediaFiles');
        $mediaPaths = [];

        if ($mediaFiles) {
            foreach ($mediaFiles as $file) {
                if ($file instanceof UploadedFile) {
                    $newFilename = uniqid() . '.' . $file->guessExtension();
                    // media_directory doit être configuré dans services.yaml ou parameters
                    $destination = $this->getParameter('media_directory');
                    $file->move($destination, $newFilename);
                    $mediaPaths[] = '/uploads/media/' . $newFilename;
                }
            }
        }

        if (!empty($mediaPaths)) {
            $post->setMedia($mediaPaths);
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'message'  => 'Post created successfully',
            'media'    => $mediaPaths,
            'parentId' => $parentPost ? $parentPost->getId() : null,
        ], JsonResponse::HTTP_CREATED);
    }

    /**
     * Like un post
     */
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

        return new JsonResponse([
            'message' => 'Post liked successfully',
            'likes'   => count($post->getLikes()),
        ], JsonResponse::HTTP_OK);
    }

    /**
     * Unlike un post
     */
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
}
