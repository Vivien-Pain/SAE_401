<?php

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
class Notification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 🔥 L'utilisateur qui reçoit la notification
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'notifications')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $recipient = null;

    // 🔥 L'utilisateur qui a déclenché la notification (ex: qui a liké)
    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $sender = null;

    // 🔥 Le type de notification : "like", "retweet", "reply", "follow", "mention"
    #[ORM\Column(length: 50)]
    private ?string $type = null;

    // 🔥 L'ID du post concerné (optionnel, pour les likes, retweets, réponses, mentions)
    #[ORM\Column(nullable: true)]
    private ?int $postId = null;

    // 🔥 Si la notification est lue ou pas
    #[ORM\Column(type: 'boolean')]
    private bool $isRead = false;

    // 🔥 Date de création
    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->isRead = false;
    }

    // --- Getters & Setters ---

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRecipient(): ?User
    {
        return $this->recipient;
    }

    public function setRecipient(?User $recipient): self
    {
        $this->recipient = $recipient;
        return $this;
    }

    public function getSender(): ?User
    {
        return $this->sender;
    }

    public function setSender(?User $sender): self
    {
        $this->sender = $sender;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getPostId(): ?int
    {
        return $this->postId;
    }

    public function setPostId(?int $postId): self
    {
        $this->postId = $postId;
        return $this;
    }

    public function isRead(): bool
    {
        return $this->isRead;
    }

    public function setIsRead(bool $isRead): self
    {
        $this->isRead = $isRead;
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
