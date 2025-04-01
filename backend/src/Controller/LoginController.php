<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\UserRepository;
use Symfony\Component\Routing\Annotation\Route;


class LoginController extends AbstractController
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/api/login', methods: ['POST'], defaults: ["_format" => "json"])]
    public function login(Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email et mot de passe requis'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        // Vérifier si l'utilisateur est bloqué
        if ($user && $user->getIsBlocked()) {
            return new JsonResponse(['error' => 'Votre compte est bloqué. Contactez l\'administrateur.'], JsonResponse::HTTP_FORBIDDEN);
        }

        if ($user && $this->passwordHasher->isPasswordValid($user, $password)) {
            $token = bin2hex(random_bytes(32));
            $user->setApiToken($token);
            $userRepository->save($user, true);

            return new JsonResponse([
                'message' => 'Connexion réussie.',
                'token' => $token
            ], JsonResponse::HTTP_OK);
        }

        return new JsonResponse(['error' => 'Nom d\'utilisateur ou mot de passe invalide.'], JsonResponse::HTTP_FORBIDDEN);
    }
}
