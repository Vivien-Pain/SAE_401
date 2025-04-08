<?php
// src/Entity/User.php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Post;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private ?string $username = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $roles = '';

    #[ORM\Column(type: 'string', length: 64, nullable: true, unique: true)]
    private ?string $apiToken = null;

    // ✅ Nouveaux champs
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $profilePicture = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $banner = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $location = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isBlocked = false;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $readOnlyMode = false;

    // ✅ Nouveau champ pour le mode privé
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isPrivate = false;

    #[ORM\OneToMany(mappedBy: "author", targetEntity: Post::class, cascade: ["remove"])]
    private Collection $posts;

    // ✅ Relation pour les likes : un utilisateur peut aimer plusieurs posts
    #[ORM\ManyToMany(targetEntity: Post::class, mappedBy: 'likes')]
    private Collection $likedPosts;

    /**
     * @var Collection<int, Subscription>
     */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'follower')]
    private Collection $followed;

    /**
     * @var Collection<int, Subscription>
     */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'followed')]
    private Collection $subscriptions;

    #[ORM\Column(type: 'boolean')]
    private $onlyFollowersCanComment = false;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->likedPosts = new ArrayCollection();
        $this->followed = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
    }

    // ... [les getters et setters existants] ...

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getRoles(): array
    {
        $rolesArray = explode(',', $this->roles);
        return array_unique(array_merge($rolesArray, ['ROLE_USER']));
    }

    public function setRoles(array $roles): static
    {
        $this->roles = implode(',', $roles);
        return $this;
    }

    public function getApiToken(): ?string
    {
        return $this->apiToken;
    }

    public function setApiToken(?string $apiToken): static
    {
        $this->apiToken = $apiToken;
        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;
        return $this;
    }

    public function getProfilePicture(): ?string
    {
        return $this->profilePicture;
    }

    public function setProfilePicture(?string $profilePicture): static
    {
        $this->profilePicture = $profilePicture;
        return $this;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;
        return $this;
    }

    public function getIsBlocked(): bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(bool $isBlocked): self
    {
        $this->isBlocked = $isBlocked;
        return $this;
    }

    public function isReadOnlyMode(): bool
    {
        return $this->readOnlyMode;
    }

    public function setReadOnlyMode(bool $readOnlyMode): self
    {
        $this->readOnlyMode = $readOnlyMode;
        return $this;
    }

    // Getters et setters pour le mode privé
    public function isPrivate(): bool
    {
        return $this->isPrivate;
    }

    public function setIsPrivate(bool $isPrivate): self
    {
        $this->isPrivate = $isPrivate;
        return $this;
    }

    // Getters et setters pour la relation likedPosts
    public function getLikedPosts(): Collection
    {
        return $this->likedPosts;
    }

    public function addLikedPost(Post $post): self
    {
        if (!$this->likedPosts->contains($post)) {
            $this->likedPosts[] = $post;
        }
        return $this;
    }

    public function removeLikedPost(Post $post): self
    {
        $this->likedPosts->removeElement($post);
        return $this;
    }

    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): self
    {
        if (!$this->posts->contains($post)) {
            $this->posts[] = $post;
            $post->setAuthor($this);
        }
        return $this;
    }

    public function removePost(Post $post): self
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getAuthor() === $this) {
                $post->setAuthor(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getFollowed(): Collection
    {
        return $this->followed;
    }

    public function addFollowed(Subscription $followed): static
    {
        if (!$this->followed->contains($followed)) {
            $this->followed->add($followed);
            $followed->setFollower($this);
        }
        return $this;
    }

    public function removeFollowed(Subscription $followed): static
    {
        if ($this->followed->removeElement($followed)) {
            if ($followed->getFollower() === $this) {
                $followed->setFollower(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
    }

    public function addSubscription(Subscription $subscription): static
    {
        if (!$this->subscriptions->contains($subscription)) {
            $this->subscriptions->add($subscription);
            $subscription->setFollowed($this);
        }
        return $this;
    }

    public function removeSubscription(Subscription $subscription): static
    {
        if ($this->subscriptions->removeElement($subscription)) {
            if ($subscription->getFollowed() === $this) {
                $subscription->setFollowed(null);
            }
        }
        return $this;
    }

    public function isOnlyFollowersCanComment(): bool
    {
        return $this->onlyFollowersCanComment;
    }

    public function setOnlyFollowersCanComment(bool $onlyFollowersCanComment): self
    {
        $this->onlyFollowersCanComment = $onlyFollowersCanComment;
        return $this;
    }
}
