<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegisterController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/api/register', methods: ['POST'], defaults: ["_format" => "json"])]
    public function register(Request $request, ValidatorInterface $validator): JsonResponse
    {
        // Récupération et décodage des données JSON
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['username'], $data['password'])) {
            return new JsonResponse(['error' => 'Tous les champs sont requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $email = $data['email'];
        $username = $data['username'];
        $password = $data['password'];

        // Vérifier si l'email est déjà utilisé
        if ($this->entityManager->getRepository(User::class)->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'L\'email est déjà utilisé.'], JsonResponse::HTTP_CONFLICT);
        }

        // Création d'un nouvel utilisateur
        $user = new User();
        $user->setEmail($email);
        $user->setUsername($username);

        // Hashage du mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        // Validation des données
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return new JsonResponse([
                'error' => 'Données invalides',
                'details' => (string) $errors
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Sauvegarde dans la base de données
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur créé avec succès.'], JsonResponse::HTTP_CREATED);
    }
}
