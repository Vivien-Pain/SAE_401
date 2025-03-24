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

        // Vérification des informations d'authentification
        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email et mot de passe requis'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Recherche de l'utilisateur en fonction de l'email
        $user = $userRepository->findOneBy(['email' => $email]);

        // Si l'utilisateur existe et que le mot de passe est valide
        if ($user && $this->passwordHasher->isPasswordValid($user, $password)) {
            // Générer un token unique pour l'utilisateur
            $token = bin2hex(random_bytes(32));  // Utilisation de random_bytes pour générer un token sécurisé
            $user->setApiToken($token);  // Assigner le token à l'utilisateur
            $userRepository->save($user, true);  // Sauvegarder l'utilisateur avec le nouveau token

            // Retourner le token dans la réponse
            return new JsonResponse([
                'message' => 'Connexion réussie.',
                'token' => $token  // Le token est renvoyé au client
            ], JsonResponse::HTTP_OK);
        } else {
            return new JsonResponse(['error' => 'Nom d\'utilisateur ou mot de passe invalide.'], JsonResponse::HTTP_FORBIDDEN);
        }
    }
}
