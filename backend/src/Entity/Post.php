<?php
// src/Entity/Post.php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['post'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 280)]
    #[Groups(['post'])]
    private string $content;

    #[ORM\Column(type: 'boolean')]
    private bool $isPinned = false;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['post'])]
    private \DateTimeInterface $created_at;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['post'])]
    private ?array $media = [];

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    private User $author;

    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'likedPosts')]
    #[ORM\JoinTable(name: 'post_likes')]
    private Collection $likes;

    #[ORM\Column(type: 'boolean')]
    private bool $isCensored = false;

    // ✅ Nouvelle relation : parent (le tweet auquel celui-ci répond)
    #[ORM\ManyToOne(targetEntity: Post::class, inversedBy: 'replies')]
    private ?Post $parent = null;

    // ✅ Nouvelle relation : replies (les réponses à ce tweet)
    #[ORM\OneToMany(mappedBy: 'parent', targetEntity: Post::class, cascade: ['remove'])]
    private Collection $replies;

    public function __construct()
    {
        $this->likes = new ArrayCollection();
        $this->replies = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at): self
    {
        $this->created_at = $created_at;
        return $this;
    }

    public function getAuthor(): User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getLikes(): Collection
    {
        return $this->likes;
    }

    public function addLike(User $user): self
    {
        if (!$this->likes->contains($user)) {
            $this->likes[] = $user;
        }

        return $this;
    }

    public function removeLike(User $user): self
    {
        $this->likes->removeElement($user);
        return $this;
    }

    public function getMedia(): ?array
    {
        return $this->media;
    }

    public function setMedia(?array $media): self
    {
        $this->media = $media;
        return $this;
    }

    // ✅ Getters/Setters pour la réponse
    public function getParent(): ?Post
    {
        return $this->parent;
    }

    public function setParent(?Post $parent): self
    {
        $this->parent = $parent;
        return $this;
    }

    public function getReplies(): Collection
    {
        return $this->replies;
    }

    public function addReply(Post $reply): self
    {
        if (!$this->replies->contains($reply)) {
            $this->replies[] = $reply;
            $reply->setParent($this);
        }

        return $this;
    }

    public function removeReply(Post $reply): self
    {
        if ($this->replies->removeElement($reply)) {
            if ($reply->getParent() === $this) {
                $reply->setParent(null);
            }
        }

        return $this;
    }

    public function isCensored(): bool
    {
        return $this->isCensored;
    }

    public function setIsCensored(bool $isCensored): self
    {
        $this->isCensored = $isCensored;
        return $this;
    }

    public function isPinned(): bool
    {
        return $this->isPinned;
    }

    public function setIsPinned(bool $isPinned): self
    {
        $this->isPinned = $isPinned;
        return $this;
    }
}
