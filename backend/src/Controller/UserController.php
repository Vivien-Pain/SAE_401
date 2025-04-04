<?php
// src/Controller/UserController.php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{

    #[Route('/api/admin', name: 'admin', methods: ["GET"])]
    public function getAdminDashboard(UserRepository $userRepository, PostRepository $postRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $userData = [];

        foreach ($users as $user) {
            $roles = $user->getRoles();
            $role = !empty($roles) ? $roles[0] : 'ROLE_USER';

            $userData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $role,
                'isBlocked' => $user->getIsBlocked(),
            ];
        }

        $posts = $postRepository->findAllWithUser();
        $postData = [];

        foreach ($posts as $post) {
            $postData[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'isCensored' => $post->isCensored(),
                'author' => [
                    'username' => $post->getAuthor()->getUsername(),
                ],
            ];
        }

        return new JsonResponse([
            'users' => $userData,
            'posts' => $postData,
        ]);
    }

    #[Route("/api/admin/{id}", name: "api_user_edit", methods: ["PUT"])]
    public function editUser(int $id, Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['role'])) {
            $user->setRoles([$data['role']]);
        }

        $userRepository->save($user, true);
        return new JsonResponse(['message' => 'Utilisateur mis à jour'], 200);
    }

    #[Route('/api/admin/{id}/toggle-block', name: 'toggle_block_user', methods: ["POST"])]
    public function toggleBlockUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->setIsBlocked(!$user->getIsBlocked());
        $entityManager->flush();

        return new JsonResponse([
            'message' => $user->getIsBlocked() ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
            'isBlocked' => $user->getIsBlocked(),
        ]);
    }

    #[Route('/api/admin/{id}/censor', name: 'censor_post', methods: ['POST'])]
    public function censorPost(int $id, PostRepository $postRepository, EntityManagerInterface $em): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['message' => 'Post non trouvé'], 404);
        }

        $post->setIsCensored(true);
        $em->flush();

        return new JsonResponse(['message' => 'Post censuré']);
    }

    #[Route('/api/admin/post/{id}', name: 'delete_post', methods: ['DELETE'])]
    public function deletePost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['message' => 'Post non trouvé'], 404);
        }

        // 1. Supprimer tous les likes
        $post->getLikes()->clear();

        // 2. Supprimer toutes les réponses (réplies)
        foreach ($post->getReplies() as $reply) {
            $em->remove($reply);
        }

        // 3. Supprimer le post lui-même
        $em->remove($post);

        $em->flush();

        return new JsonResponse(['message' => 'Post supprimé avec succès']);
    }
}
