<?php
// src/Controller/BlockController.php

namespace App\Controller;

use App\Entity\Block;
use App\Entity\User;
use App\Repository\BlockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class BlockController extends AbstractController
{
    #[Route('/api/users/{id}/block', name: 'block_user', methods: ['POST'])]
    public function blockUser(
        int $id,
        BlockRepository $blockRepo,
        EntityManagerInterface $em,
        Request $request
    ): JsonResponse {
        $blocked = $em->getRepository(User::class)->find($id);
        if (!$blocked) {
            return $this->json(['error' => 'Utilisateur à bloquer non trouvé'], 404);
        }

        // Récupération de l'utilisateur courant via le token
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization') ?? '');
        $blocker = $em->getRepository(User::class)->findOneBy(['apiToken' => $token]);

        if (!$blocker) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if ($blocker === $blocked) {
            return $this->json(['error' => 'Impossible de se bloquer soi-même'], 400);
        }

        if ($blockRepo->isBlocked($blocker, $blocked)) {
            return $this->json(['message' => 'Déjà bloqué']);
        }

        $block = new Block();
        $block->setBlocker($blocker);
        $block->setBlocked($blocked);
        $em->persist($block);

        // Supprimer les abonnements existants dans les deux sens
        $subscriptionRepo = $em->getRepository(\App\Entity\Subscription::class);

        $subFromBlocked = $subscriptionRepo->findOneBy([
            'follower' => $blocked,
            'followed' => $blocker,
        ]);
        if ($subFromBlocked) {
            $em->remove($subFromBlocked);
        }

        $subFromBlocker = $subscriptionRepo->findOneBy([
            'follower' => $blocker,
            'followed' => $blocked,
        ]);
        if ($subFromBlocker) {
            $em->remove($subFromBlocker);
        }

        $em->flush();

        return $this->json(['message' => 'Utilisateur bloqué et désabonnement(s) effectué(s)']);
    }

    #[Route('/api/users/{id}/unblock', name: 'unblock_user', methods: ['DELETE'])]
    public function unblockUser(
        User $blocked,
        BlockRepository $blockRepo,
        EntityManagerInterface $em,
        Request $request
    ): JsonResponse {
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization') ?? '');
        $blocker = $em->getRepository(User::class)->findOneBy(['apiToken' => $token]);

        if (!$blocker) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $block = $blockRepo->findOneBy(['blocker' => $blocker, 'blocked' => $blocked]);

        if (!$block) {
            return $this->json(['error' => 'Cet utilisateur n’est pas bloqué'], 404);
        }

        $em->remove($block);
        $em->flush();

        return $this->json(['message' => 'Utilisateur débloqué']);
    }

    #[Route('/api/blocked', name: 'blocked_users', methods: ['GET'])]
    public function getBlockedUsers(
        BlockRepository $blockRepo,
        EntityManagerInterface $em,
        Request $request
    ): JsonResponse {
        $token = str_replace('Bearer ', '', $request->headers->get('Authorization') ?? '');
        $user = $em->getRepository(User::class)->findOneBy(['apiToken' => $token]);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $blockedUsers = $blockRepo->findBlockedByUser($user);

        $data = array_map(function (Block $block) {
            return [
                'id' => $block->getBlocked()->getId(),
                'username' => $block->getBlocked()->getUsername(),
            ];
        }, $blockedUsers);

        return $this->json($data);
    }
    #[Route('/api/users/{id}/blocked', name: 'api_users_blocked_by_user', methods: ['GET'])]
    public function getBlockedByUser(
        User $user,
        BlockRepository $blockRepo
    ): JsonResponse {
        $blockedUsers = $blockRepo->findBlockedByUser($user);

        $data = array_map(function ($block) {
            return [
                'id' => $block->getBlocked()->getId(),
                'username' => $block->getBlocked()->getUsername(),
            ];
        }, $blockedUsers);

        return $this->json($data);
    }
}
