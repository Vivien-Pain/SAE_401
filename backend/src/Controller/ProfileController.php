<?php
// src/Controller/ProfileController.php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\User;
use App\Entity\Block;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;


class ProfileController extends AbstractController
{
    #[Route('/api/current_user', name: 'api_current_user', methods: ['GET'])]
    public function getCurrentUser(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'bio' => $user->getBio(),
            'profilePicture' => $user->getProfilePicture(),
            'banner' => $user->getBanner(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
            'readOnlyMode' => $user->isReadOnlyMode(), // 🔥 ajout lecture seule
        ]);
    }
    #[Route('/api/profile/{username}', name: 'api_profile', methods: ['GET'])]
    public function getProfile(string $username, EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            return new JsonResponse(['message' => 'Profil non trouvé'], 404);
        }

        try {
            $posts = $entityManager->getRepository(Post::class)
                ->findBy(['author' => $user], ['created_at' => 'DESC']);

            $postsData = array_map(function ($post) {
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($post->getLikes()),
                    'authorId' => $post->getAuthor()->getId(),
                    'authorUsername' => $post->getAuthor()->getUsername(),
                    'media' => $post->getMedia() ?? [],
                ];
            }, $posts);

            return $this->json([
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'bio' => $user->getBio(),
                'profilePicture' => $user->getProfilePicture(),
                'banner' => $user->getBanner(),
                'location' => $user->getLocation(),
                'website' => $user->getWebsite(),
                'readOnlyMode' => $user->isReadOnlyMode(), // 🔥 ajout lecture seule
                'posts' => $postsData,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/api/profile/{username}/follow', name: 'api_follow_user', methods: ['POST'])]
    public function followUser(string $username, EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $token]);
        $userToFollow = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['username' => $username]);

        if (!$currentUser || !$userToFollow) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous suivre vous-même'], 400);
        }

        // 🔐 Vérifie si tu es bloqué par la personne que tu veux suivre
        $blockRepo = $entityManager->getRepository(\App\Entity\Block::class);
        $isBlocked = $blockRepo->findOneBy([
            'blocker' => $userToFollow,
            'blocked' => $currentUser,
        ]);

        if ($isBlocked) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas suivre cet utilisateur.'], 403);
        }

        try {
            $subscription = new \App\Entity\Subscription();
            $subscription->setFollower($currentUser);
            $subscription->setFollowed($userToFollow);

            $entityManager->persist($subscription);
            $entityManager->flush();

            return new JsonResponse(['message' => 'Utilisateur suivi avec succès']);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }
    #[Route('/api/profile/{username}/unfollow', name: 'api_unfollow_user', methods: ['DELETE'])]
    public function unfollowUser(string $username, EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $token]);

        if (!$currentUser) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], 401);
        }

        $userToUnfollow = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['username' => $username]);

        if (!$userToUnfollow) {
            return new JsonResponse(['message' => 'Utilisateur à ne plus suivre non trouvé'], 404);
        }

        if ($currentUser === $userToUnfollow) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous désabonner de vous-même'], 400);
        }

        try {
            $subscription = $entityManager->getRepository(\App\Entity\Subscription::class)
                ->findOneBy(['follower' => $currentUser, 'followed' => $userToUnfollow]);

            if (!$subscription) {
                return new JsonResponse(['message' => 'Vous ne suivez pas cet utilisateur'], 400);
            }

            $entityManager->remove($subscription);
            $entityManager->flush();

            return new JsonResponse(['message' => 'Utilisateur désabonné avec succès']);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors du désabonnement de l\'utilisateur: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/api/profile/{username}/edit', name: 'api_edit_profile', methods: ['PUT'])]
    public function editProfile(string $username, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $token]);

        if (!$currentUser || $currentUser->getUsername() !== $username) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);

        $currentUser->setBio($data['bio'] ?? $currentUser->getBio());
        $currentUser->setProfilePicture($data['profilePicture'] ?? $currentUser->getProfilePicture());
        $currentUser->setBanner($data['banner'] ?? $currentUser->getBanner());
        $currentUser->setLocation($data['location'] ?? $currentUser->getLocation());
        $currentUser->setWebsite($data['website'] ?? $currentUser->getWebsite());

        $entityManager->persist($currentUser);
        $entityManager->flush();

        return new JsonResponse([
            'username' => $currentUser->getUsername(),
            'bio' => $currentUser->getBio(),
            'profilePicture' => $currentUser->getProfilePicture(),
            'banner' => $currentUser->getBanner(),
            'location' => $currentUser->getLocation(),
            'website' => $currentUser->getWebsite(),
        ]);
    }
    #[Route('/api/posts/{id}', name: 'api_edit_post', methods: ['PUT'])]
    public function editPost(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupération du token
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);
        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        // Identification de l'utilisateur courant
        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        if (!$currentUser) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], 401);
        }

        // Récupération du post à éditer
        $post = $entityManager->getRepository(Post::class)->find($id);
        if (!$post) {
            return new JsonResponse(['message' => 'Post non trouvé'], 404);
        }

        // Vérifier que l'utilisateur courant est bien l'auteur du post
        if ($post->getAuthor()->getId() !== $currentUser->getId()) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $newContent = $data['content'] ?? null;
        $newMedia = $data['media'] ?? null;

        if ($newContent !== null) {
            $post->setContent($newContent);
        }
        if ($newMedia !== null) {
            // On suppose que $newMedia est un tableau de chemins de médias
            $post->setMedia($newMedia);
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'likes' => count($post->getLikes()),
            'authorId' => $post->getAuthor()->getId(),
            'authorUsername' => $post->getAuthor()->getUsername(),
            'media' => $post->getMedia() ?? [],
        ]);
    }
    #[Route('/api/profile/{username}/readonly', name: 'api_toggle_readonly', methods: ['PUT'])]
    public function toggleReadOnly(string $username, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        if (!$currentUser || $currentUser->getUsername() !== $username) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $readOnlyMode = $data['readOnlyMode'] ?? false;

        $currentUser->setReadOnlyMode($readOnlyMode);
        $entityManager->persist($currentUser);
        $entityManager->flush();

        return $this->json([
            'username' => $currentUser->getUsername(),
            'readOnlyMode' => $currentUser->isReadOnlyMode(),
        ]);
    }

    #[Route('/api/users/{id}/block', name: 'api_block_user', methods: ['POST'])]
    public function blockUser(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        $userToBlock = $entityManager->getRepository(User::class)->find($id);

        if (!$currentUser || !$userToBlock) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($currentUser->getId() === $userToBlock->getId()) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous bloquer vous-même.'], 400);
        }

        $block = new Block();
        $block->setBlocker($currentUser);
        $block->setBlocked($userToBlock);

        $entityManager->persist($block);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur bloqué avec succès.']);
    }

    #[Route('/api/users/{id}/unblock', name: 'api_unblock_user', methods: ['DELETE'])]
    public function unblockUser(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        $userToUnblock = $entityManager->getRepository(User::class)->find($id);

        if (!$currentUser || !$userToUnblock) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        $block = $entityManager->getRepository(Block::class)
            ->findOneBy(['blocker' => $currentUser, 'blocked' => $userToUnblock]);

        if (!$block) {
            return new JsonResponse(['message' => 'Utilisateur non bloqué.'], 400);
        }

        $entityManager->remove($block);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur débloqué avec succès.']);
    }
}
