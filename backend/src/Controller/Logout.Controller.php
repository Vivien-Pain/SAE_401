<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authentication\LogoutHandlerInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutController extends AbstractController
{
    #[Route('/logout', name: 'app_logout', methods: ['POST'])]
    public function logout(): void
    {
        throw new \Exception('Ne sera jamais atteint, Symfony gère la déconnexion automatiquement.');
    }
}
