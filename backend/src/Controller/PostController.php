<?php
// src/Controller/PostController.php
namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;


class PostController extends AbstractController
{
    #[Route('/api/posts', methods: ['GET'], defaults: ["_format" => "json"])]
    public function getPosts(
        Request $request,
        PostRepository $postRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = (int) $request->query->get('limit', 50);

        $posts = $postRepository->findPaginatedPosts($page, $limit);

        // Convertir le tableau en JSON
        $data = [
            'total' => $postRepository->count([]),
            'page' => $page,
            'limit' => $limit,
            'posts' => json_decode($serializer->serialize($posts, 'json', ['groups' => 'post']), true)
        ];

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }


    #[Route('/api/posts', methods: ['POST'], defaults: ["_format" => "json"])]
    public function createPost(
        Request $request,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ): JsonResponse {
        // Décoder les données JSON envoyées dans le corps de la requête
        $data = json_decode($request->getContent(), true);

        // Vérifier que le champ 'content' est présent dans la requête
        if (!isset($data['content'])) {
            return new JsonResponse(['error' => 'Content is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Créer un nouvel objet Post
        $post = new Post();
        $post->setContent($data['content']);
        $post->setCreatedAt(new \DateTime()); // Ajouter la date de création du post

        // Validation de l'entité Post
        $errors = $validator->validate($post);
        if (count($errors) > 0) {
            // Si des erreurs sont trouvées, renvoyer une réponse 400 avec les erreurs
            return new JsonResponse((string) $errors, JsonResponse::HTTP_BAD_REQUEST);
        }

        // Sauvegarder le post dans la base de données
        $entityManager->persist($post);
        $entityManager->flush();

        // Sérialiser l'objet Post pour la réponse
        $serializedPost = $serializer->serialize($post, 'json', ['groups' => 'post']);

        // Renvoyer une réponse JSON avec l'objet post créé
        return new JsonResponse($serializedPost, JsonResponse::HTTP_CREATED, [], false);
    }
}
