<?php
// src/Controller/ProfileController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;

class ProfileController extends AbstractController
{
    #[Route('/api/current_user', name: 'api_current_user', methods: ['GET'])]
    public function getCurrentUser(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $token); // Retire "Bearer " pour ne garder que le token

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant'], 401);
        }

        $user = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['apiToken' => $token]);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 401);
        }

        return $this->json([
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'bio' => $user->getBio(),
            'profilePicture' => $user->getProfilePicture(),
            'banner' => $user->getBanner(),
            'location' => $user->getLocation(),
            'website' => $user->getWebsite(),
        ]);
    }

    #[Route('/api/profile/{username}', name: 'api_profile', methods: ['GET'])]
    public function getProfile(string $username, EntityManagerInterface $entityManager): JsonResponse
    {
        // Essayer de récupérer l'utilisateur
        $user = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            return new JsonResponse(['message' => 'Profil non trouvé'], 404);
        }

        try {
            // Récupérer les posts de l'utilisateur
            $posts = $entityManager->getRepository(\App\Entity\Post::class)
                ->findBy(['author' => $user], ['created_at' => 'DESC']);

            $postsData = array_map(function ($post) {
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'likes' => count($post->getLikes()), // Supposons que `getLikes()` retourne une collection
                    'isLiked' => false, // Tu peux ajuster cette valeur si tu as une logique pour vérifier si l'utilisateur connecté a liké
                    'authorId' => $post->getAuthor()->getId(),
                    'authorUsername' => $post->getAuthor()->getUsername(),
                    'isFollowed' => false // Implémente la logique de suivi si nécessaire
                ];
            }, $posts);

            return $this->json([
                'username' => $user->getUsername(),
                'bio' => $user->getBio(),
                'profilePicture' => $user->getProfilePicture(),
                'banner' => $user->getBanner(),
                'location' => $user->getLocation(),
                'website' => $user->getWebsite(),
                'posts' => $postsData,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors de la récupération des posts: ' . $e->getMessage()], 500);
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

        if (!$currentUser) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié'], 401);
        }

        $userToFollow = $entityManager->getRepository(\App\Entity\User::class)->findOneBy(['username' => $username]);

        if (!$userToFollow) {
            return new JsonResponse(['message' => 'Utilisateur à suivre non trouvé'], 404);
        }

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous suivre vous-même'], 400);
        }

        try {
            $subscription = new \App\Entity\Subscription();
            $subscription->setFollower($currentUser);
            $subscription->setFollowed($userToFollow);

            $entityManager->persist($subscription);
            $entityManager->flush();

            return new JsonResponse(['message' => 'Utilisateur suivi avec succès']);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors du suivi de l\'utilisateur: ' . $e->getMessage()], 500);
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
}
