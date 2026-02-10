<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\TrackRepository;
use App\State\TrackRankingProvider;
use App\State\RecentTracksProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TrackRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(),
        new GetCollection(
            uriTemplate: '/tracks/ranking',
            provider: TrackRankingProvider::class,
            openapiContext: [
                'parameters' => [
                    [
                        'name' => 'period',
                        'in' => 'query',
                        'description' => 'Period for ranking: week, month, or all',
                        'required' => false,
                        'schema' => ['type' => 'string', 'enum' => ['week', 'month', 'all']]
                    ]
                ]
            ]
        ),
        new GetCollection(
            uriTemplate: '/tracks/recent',
            provider: RecentTracksProvider::class,
            openapiContext: [
                'summary' => 'Get tracks released in the last 7 days'
            ]
        ),
        new Get(normalizationContext: ['groups' => ['track:read', 'track:read:full']]),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['track:read']],
    denormalizationContext: ['groups' => ['track:write']],
    paginationEnabled: true
)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'partial', 'artist.name' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['releaseDate', 'createdAt', 'title'])]
#[ApiFilter(DateFilter::class, properties: ['releaseDate'])]
class Track
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['track:read', 'vote:read', 'artist:read:full', 'user:votes'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 255)]
    #[Groups(['track:read', 'track:write', 'vote:read', 'artist:read:full', 'user:votes'])]
    private ?string $title = null;

    #[ORM\ManyToOne(inversedBy: 'tracks')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['track:read', 'track:write', 'vote:read', 'user:votes'])]
    private ?Artist $artist = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['track:read', 'track:write', 'artist:read:full', 'user:votes'])]
    private ?string $coverUrl = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['track:read', 'track:write'])]
    private ?string $spotifyUrl = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['track:read', 'track:write'])]
    private ?string $youtubeUrl = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['track:read', 'track:write', 'artist:read:full'])]
    private ?\DateTimeInterface $releaseDate = null;

    #[ORM\Column]
    #[Groups(['track:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToMany(mappedBy: 'track', targetEntity: Vote::class, orphanRemoval: true)]
    private Collection $votes;

    #[ApiProperty]
    #[Groups(['track:read', 'track:read:full'])]
    private ?int $score = null;

    #[ApiProperty]
    #[Groups(['track:read:full'])]
    private ?int $upvotes = null;

    #[ApiProperty]
    #[Groups(['track:read:full'])]
    private ?int $downvotes = null;

    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getArtist(): ?Artist
    {
        return $this->artist;
    }

    public function setArtist(?Artist $artist): static
    {
        $this->artist = $artist;
        return $this;
    }

    public function getCoverUrl(): ?string
    {
        return $this->coverUrl;
    }

    public function setCoverUrl(?string $coverUrl): static
    {
        $this->coverUrl = $coverUrl;
        return $this;
    }

    public function getSpotifyUrl(): ?string
    {
        return $this->spotifyUrl;
    }

    public function setSpotifyUrl(?string $spotifyUrl): static
    {
        $this->spotifyUrl = $spotifyUrl;
        return $this;
    }

    public function getYoutubeUrl(): ?string
    {
        return $this->youtubeUrl;
    }

    public function setYoutubeUrl(?string $youtubeUrl): static
    {
        $this->youtubeUrl = $youtubeUrl;
        return $this;
    }

    public function getReleaseDate(): ?\DateTimeInterface
    {
        return $this->releaseDate;
    }

    public function setReleaseDate(?\DateTimeInterface $releaseDate): static
    {
        $this->releaseDate = $releaseDate;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    /**
     * @return Collection<int, Vote>
     */
    public function getVotes(): Collection
    {
        return $this->votes;
    }

    public function addVote(Vote $vote): static
    {
        if (!$this->votes->contains($vote)) {
            $this->votes->add($vote);
            $vote->setTrack($this);
        }
        return $this;
    }

    public function removeVote(Vote $vote): static
    {
        if ($this->votes->removeElement($vote)) {
            if ($vote->getTrack() === $this) {
                $vote->setTrack(null);
            }
        }
        return $this;
    }

    public function getScore(): ?int
    {
        if ($this->score !== null) {
            return $this->score;
        }

        $score = 0;
        foreach ($this->votes as $vote) {
            $score += $vote->getValue();
        }
        return $score;
    }

    public function setScore(?int $score): static
    {
        $this->score = $score;
        return $this;
    }

    public function getUpvotes(): ?int
    {
        if ($this->upvotes !== null) {
            return $this->upvotes;
        }

        $count = 0;
        foreach ($this->votes as $vote) {
            if ($vote->getValue() === 1) {
                $count++;
            }
        }
        return $count;
    }

    public function setUpvotes(?int $upvotes): static
    {
        $this->upvotes = $upvotes;
        return $this;
    }

    public function getDownvotes(): ?int
    {
        if ($this->downvotes !== null) {
            return $this->downvotes;
        }

        $count = 0;
        foreach ($this->votes as $vote) {
            if ($vote->getValue() === -1) {
                $count++;
            }
        }
        return $count;
    }

    public function setDownvotes(?int $downvotes): static
    {
        $this->downvotes = $downvotes;
        return $this;
    }
}
