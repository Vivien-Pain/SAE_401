<?php
// src/Controller/UserController.php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class UserController extends AbstractController
{

    #[Route('/api/admin', name: 'admin', methods: ["GET"])]
    public function getUsers(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        if (!$users) {
            return new JsonResponse(['message' => 'Aucun utilisateur trouvé'], 404);
        }
        $userData = [];

        foreach ($users as $user) {
            $roles = $user->getRoles();
            // Si aucun rôle n'est défini, attribue un rôle par défaut
            $role = !empty($roles) ? $roles[0] : 'ROLE_USER';

            $userData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $role,
                'isBlocked' => $user->getIsBlocked(),
            ];
        }

        return new JsonResponse($userData);
    }


    #[Route("/api/admin/{id}", name: "api_user_edit", methods: ["PUT"])]
    public function editUser(int $id, Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Modifier les champs
        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['role'])) {
            // On vérifie et met à jour les rôles
            $user->setRoles([$data['role']]);
        }

        $userRepository->save($user, true); // Enregistrer les changements
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
}
