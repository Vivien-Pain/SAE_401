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
use App\Entity\Subscription;



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
            'readOnlyMode' => $user->isReadOnlyMode(),
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
                ->findBy(['author' => $user, 'parent' => null], ['created_at' => 'DESC']);

            $pinnedPost = $entityManager->getRepository(Post::class)
                ->findOneBy(['author' => $user, 'isPinned' => true]);

            $postsData = array_map(function ($post) {
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($post->getLikes()),
                    'authorId' => $post->getAuthor()->getId(),
                    'authorUsername' => $post->getAuthor()->getUsername(),
                    'media' => $post->getMedia() ?? [],
                    'isPinned' => $post->isPinned(),
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
                'readOnlyMode' => $user->isReadOnlyMode(),
                'posts' => $postsData,
                'pinnedPost' => $pinnedPost ? [
                    'id' => $pinnedPost->getId(),
                    'content' => $pinnedPost->getContent(),
                    'created_at' => $pinnedPost->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($pinnedPost->getLikes()),
                    'authorId' => $pinnedPost->getAuthor()->getId(),
                    'authorUsername' => $pinnedPost->getAuthor()->getUsername(),
                    'media' => $pinnedPost->getMedia() ?? [],
                    'isPinned' => true,
                ] : null,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
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


    #[Route('/api/posts/{id}/pin', name: 'api_pin_post', methods: ['POST'])]
    public function pinPost(int $id, EntityManagerInterface $entityManager, Request $request): JsonResponse
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

        $post = $entityManager->getRepository(Post::class)->find($id);

        if (!$post || $post->getAuthor()->getId() !== $user->getId()) {
            return new JsonResponse(['message' => 'Post introuvable ou non autorisé'], 403);
        }

        // Retirer éventuellement l'ancien pinned
        $oldPinned = $entityManager->getRepository(Post::class)
            ->findOneBy(['author' => $user, 'isPinned' => true]);

        if ($oldPinned) {
            $oldPinned->setIsPinned(false);
            $entityManager->persist($oldPinned);
        }

        $post->setIsPinned(true);
        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post épinglé avec succès']);
    }

    #[Route('/api/posts/{id}/unpin', name: 'api_unpin_post', methods: ['POST'])]
    public function unpinPost(int $id, EntityManagerInterface $entityManager, Request $request): JsonResponse
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

        $post = $entityManager->getRepository(Post::class)->find($id);

        if (!$post || $post->getAuthor()->getId() !== $user->getId()) {
            return new JsonResponse(['message' => 'Post introuvable ou non autorisé'], 403);
        }

        if ($post->isPinned()) {
            $post->setIsPinned(false);
            $entityManager->persist($post);
            $entityManager->flush();
        }

        return new JsonResponse(['message' => 'Post désépinglé avec succès']);
    }

    #[Route('/api/profile/{username}/follow', name: 'api_follow_user', methods: ['POST'])]
    public function followUser(string $username, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);
        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        $userToFollow = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$currentUser || !$userToFollow) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous suivre vous-même.'], 400);
        }

        $existingSubscription = $entityManager->getRepository(Subscription::class)
            ->findOneBy(['follower' => $currentUser, 'followed' => $userToFollow]);

        if ($existingSubscription) {
            return new JsonResponse(['message' => 'Déjà abonné.'], 400);
        }

        $subscription = new Subscription();
        $subscription->setFollower($currentUser);
        $subscription->setFollowed($userToFollow);

        $entityManager->persist($subscription);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur suivi avec succès.']);
    }

    #[Route('/api/profile/{username}/unfollow', name: 'api_unfollow_user', methods: ['DELETE'])]
    public function unfollowUser(string $username, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);
        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        $userToUnfollow = $entityManager->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$currentUser || !$userToUnfollow) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        $subscription = $entityManager->getRepository(Subscription::class)
            ->findOneBy(['follower' => $currentUser, 'followed' => $userToUnfollow]);

        if (!$subscription) {
            return new JsonResponse(['message' => 'Vous ne suivez pas cet utilisateur.'], 400);
        }

        $entityManager->remove($subscription);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Désabonnement réussi.']);
    }

    #[Route('/api/profile/{username}/edit', name: 'api_edit_profile', methods: ['PUT'])]
    public function editProfile(
        string $username,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // 1. Check the token and the current user
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $currentUser = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);
        if (!$currentUser) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], 401);
        }

        // 2. Check that the current user *is* the one whose profile is being edited
        //    or check if you allow admins, etc. For now, we’ll assume the user can only
        //    edit *their own* profile.
        if ($currentUser->getUsername() !== $username) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        // 3. Decode the JSON body
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return new JsonResponse(['message' => 'Données invalides'], 400);
        }

        // 4. Update fields on the User entity
        //    For example, if in your `User` entity you have `setBio()`, `setProfilePicture()`, etc.
        if (isset($data['bio'])) {
            $currentUser->setBio($data['bio']);
        }
        if (isset($data['profilePicture'])) {
            $currentUser->setProfilePicture($data['profilePicture']);
        }
        if (isset($data['banner'])) {
            $currentUser->setBanner($data['banner']);
        }
        if (isset($data['location'])) {
            $currentUser->setLocation($data['location']);
        }
        if (isset($data['website'])) {
            $currentUser->setWebsite($data['website']);
        }

        // 5. Persist and flush
        $entityManager->persist($currentUser);
        $entityManager->flush();

        // 6. Return the updated user in JSON
        return $this->json([
            'id' => $currentUser->getId(),
            'username' => $currentUser->getUsername(),
            'bio' => $currentUser->getBio(),
            'profilePicture' => $currentUser->getProfilePicture(),
            'banner' => $currentUser->getBanner(),
            'location' => $currentUser->getLocation(),
            'website' => $currentUser->getWebsite(),
            'readOnlyMode' => $currentUser->isReadOnlyMode(),
        ]);
    }
}
