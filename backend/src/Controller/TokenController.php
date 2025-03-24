<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class TokenController extends AbstractController
{
    #[Route('/api/token/validate', name: 'api_token_validate', methods: ['POST'])]
    public function validateToken(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupérer l'en-tête Authorization
        $authHeader = $request->headers->get('Authorization');

        // Vérification si l'en-tête existe et commence par 'Bearer '
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->json(['error' => 'Token is missing or invalid'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Extraire le token de l'en-tête
        $token = str_replace('Bearer ', '', $authHeader);

        // Rechercher un utilisateur correspondant à ce token dans la base de données
        $user = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $token]);

        // Si l'utilisateur n'existe pas ou si le token est incorrect
        if (!$user) {
            return $this->json(['error' => 'Invalid token'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Réponse de succès si le token est valide
        return $this->json([
            'message' => 'Token is valid',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ]
        ]);
    }
}
