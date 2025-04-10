<?php
// src/Entity/FollowRequest.php

namespace App\Entity;

use App\Repository\FollowRequestRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FollowRequestRepository::class)]
class FollowRequest
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $requester = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $requested = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isAccepted = false;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }


    public function getId(): ?int
    {
        return $this->id;
    }
    public function getRequester(): ?User
    {
        return $this->requester;
    }
    public function setRequester(?User $requester): self
    {
        $this->requester = $requester;

        return $this;
    }
    public function getRequested(): ?User
    {
        return $this->requested;
    }
    public function setRequested(?User $requested): self
    {
        $this->requested = $requested;

        return $this;
    }
    public function isAccepted(): bool
    {
        return $this->isAccepted;
    }
    public function setAccepted(bool $isAccepted): self
    {
        $this->isAccepted = $isAccepted;

        return $this;
    }
    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }
    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
