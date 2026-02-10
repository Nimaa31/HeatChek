<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial schema for HeatCheck app';
    }

    public function up(Schema $schema): void
    {
        // Create user table
        $this->addSql('CREATE TABLE "user" (
            id UUID NOT NULL,
            email VARCHAR(180) NOT NULL,
            username VARCHAR(50) NOT NULL,
            roles JSON NOT NULL,
            password VARCHAR(255) NOT NULL,
            avatar_url VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "user" (email)');
        $this->addSql('COMMENT ON COLUMN "user".id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');

        // Create artist table
        $this->addSql('CREATE TABLE artist (
            id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            image_url VARCHAR(500) DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN artist.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN artist.created_at IS \'(DC2Type:datetime_immutable)\'');

        // Create track table
        $this->addSql('CREATE TABLE track (
            id UUID NOT NULL,
            artist_id UUID NOT NULL,
            title VARCHAR(255) NOT NULL,
            cover_url VARCHAR(500) DEFAULT NULL,
            spotify_url VARCHAR(500) DEFAULT NULL,
            youtube_url VARCHAR(500) DEFAULT NULL,
            release_date DATE DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_D6E3F8A6B7970CF8 ON track (artist_id)');
        $this->addSql('COMMENT ON COLUMN track.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN track.artist_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN track.created_at IS \'(DC2Type:datetime_immutable)\'');

        // Create vote table
        $this->addSql('CREATE TABLE vote (
            id UUID NOT NULL,
            user_id UUID NOT NULL,
            track_id UUID NOT NULL,
            value SMALLINT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_5A108564A76ED395 ON vote (user_id)');
        $this->addSql('CREATE INDEX IDX_5A1085645ED23C43 ON vote (track_id)');
        $this->addSql('CREATE UNIQUE INDEX unique_user_track_vote ON vote (user_id, track_id)');
        $this->addSql('COMMENT ON COLUMN vote.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN vote.user_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN vote.track_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN vote.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN vote.updated_at IS \'(DC2Type:datetime_immutable)\'');

        // Add foreign keys
        $this->addSql('ALTER TABLE track ADD CONSTRAINT FK_D6E3F8A6B7970CF8 FOREIGN KEY (artist_id) REFERENCES artist (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE vote ADD CONSTRAINT FK_5A108564A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE vote ADD CONSTRAINT FK_5A1085645ED23C43 FOREIGN KEY (track_id) REFERENCES track (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE track DROP CONSTRAINT FK_D6E3F8A6B7970CF8');
        $this->addSql('ALTER TABLE vote DROP CONSTRAINT FK_5A108564A76ED395');
        $this->addSql('ALTER TABLE vote DROP CONSTRAINT FK_5A1085645ED23C43');
        $this->addSql('DROP TABLE vote');
        $this->addSql('DROP TABLE track');
        $this->addSql('DROP TABLE artist');
        $this->addSql('DROP TABLE "user"');
    }
}
