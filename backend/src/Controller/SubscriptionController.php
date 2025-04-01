<?php
// src/Controller/SubscriptionController.php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class SubscriptionController extends AbstractController
{
    // Méthode utilitaire pour récupérer l'utilisateur via le Bearer token (similaire à celle utilisée pour les posts)
    private function getUserFromBearer(Request $request, UserRepository $userRepository): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && 0 === strpos($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            return $userRepository->findOneBy(['apiToken' => $token]);
        }
        return null;
    }

    #[Route('/api/users/{id}/follow', methods: ['POST'], defaults: ["_format" => "json"])]
    public function followUser(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $userToFollow = $userRepository->find($id);
        if (!$userToFollow) {
            return new JsonResponse(['error' => 'User to follow not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUserFromBearer($request, $userRepository);
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated or token invalid'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur essaie de s'abonner à lui-même
        if ($currentUser->getId() === $userToFollow->getId()) {
            return new JsonResponse(['error' => 'You cannot follow your own profile'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'abonnement existe déjà
        $subscriptionRepo = $entityManager->getRepository(Subscription::class);
        $existingSubscription = $subscriptionRepo->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToFollow,
        ]);

        if ($existingSubscription) {
            return new JsonResponse(['message' => 'Already following'], JsonResponse::HTTP_OK);
        }

        $subscription = new Subscription();
        $subscription->setFollower($currentUser);
        $subscription->setFollowed($userToFollow);

        $entityManager->persist($subscription);
        $entityManager->flush();

        // Récupérer les posts de l'utilisateur suivi
        $posts = $userToFollow->getPosts(); // Assurez-vous que la relation entre User et Post est correctement configurée
        $postsData = [];
        foreach ($posts as $post) {
            $postsData[] = [
                'id' => $post->getId(),
                'title' => $post->getTitle() ?? 'Untitled', // Ensure method exists or provide a default
                'content' => $post->getContent() ?? 'No content', // Ensure method exists or provide a default
                'createdAt' => $post->getCreatedAt() ? $post->getCreatedAt()->format('Y-m-d H:i:s') : null, // Handle null dates
            ];
        }

        return new JsonResponse([
            'message' => 'User followed successfully',
            'posts' => $postsData,
        ], JsonResponse::HTTP_OK);
    }


    #[Route('/api/users/{id}/unfollow', methods: ['DELETE'], defaults: ["_format" => "json"])]
    public function unfollowUser(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $userToUnfollow = $userRepository->find($id);
        if (!$userToUnfollow) {
            return new JsonResponse(['error' => 'User to unfollow not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUserFromBearer($request, $userRepository);
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated or token invalid'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $subscriptionRepo = $entityManager->getRepository(Subscription::class);
        $subscription = $subscriptionRepo->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToUnfollow,
        ]);

        if (!$subscription) {
            return new JsonResponse(['error' => 'Not following this user'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $entityManager->remove($subscription);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User unfollowed successfully'], JsonResponse::HTTP_OK);
    }
}
