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
}
