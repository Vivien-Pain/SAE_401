<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class NotificationController extends AbstractController
{
    private function getUserFromBearer(Request $request, UserRepository $userRepository): ?User
    {
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && 0 === strpos($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            return $userRepository->findOneBy(['apiToken' => $token]);
        }
        return null;
    }

    #[Route('/api/notifications', name: 'api_notifications', methods: ['GET'])]
    public function getNotifications(
        Request $request,
        NotificationRepository $notificationRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $notifications = $notificationRepository->findBy(
            ['recipient' => $user],
            ['createdAt' => 'DESC']
        );

        $data = array_map(function (Notification $notification) {
            return [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'senderUsername' => $notification->getSender()?->getUsername(),
                'postId' => $notification->getPostId(),
                'isRead' => $notification->isRead(),
                'createdAt' => $notification->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $notifications);

        return new JsonResponse($data);
    }

    #[Route('/api/notifications/{id}/read', name: 'api_notifications_read', methods: ['POST'])]
    public function markNotificationAsRead(
        int $id,
        Request $request,
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $notification = $notificationRepository->find($id);
        if (!$notification || $notification->getRecipient() !== $user) {
            return new JsonResponse(['error' => 'Notification not found or unauthorized'], JsonResponse::HTTP_NOT_FOUND);
        }

        $notification->setIsRead(true);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Notification marked as read']);
    }

    #[Route('/api/notifications/read-all', name: 'api_notifications_read_all', methods: ['POST'])]
    public function markAllNotificationsAsRead(
        Request $request,
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUserFromBearer($request, $userRepository);
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $notifications = $notificationRepository->findBy(['recipient' => $user, 'isRead' => false]);
        foreach ($notifications as $notification) {
            $notification->setIsRead(true);
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'All notifications marked as read']);
    }
}
