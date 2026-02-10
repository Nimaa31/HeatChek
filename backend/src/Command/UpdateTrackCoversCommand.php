<?php

namespace App\Command;

use App\Repository\TrackRepository;
use App\Service\DeezerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:update-track-covers',
    description: 'Update track cover URLs from Deezer API',
)]
class UpdateTrackCoversCommand extends Command
{
    public function __construct(
        private TrackRepository $trackRepository,
        private DeezerService $deezerService,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Force update even if cover already exists');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $force = $input->getOption('force');

        $tracks = $this->trackRepository->findAll();
        $updated = 0;
        $failed = 0;

        $io->progressStart(count($tracks));

        foreach ($tracks as $track) {
            $io->progressAdvance();

            // Skip if cover exists and not forcing
            if (!$force && $track->getCoverUrl() !== null) {
                continue;
            }

            $artist = $track->getArtist();
            if ($artist === null) {
                $failed++;
                continue;
            }

            $coverUrl = $this->deezerService->searchTrackCover(
                $artist->getName(),
                $track->getTitle()
            );

            if ($coverUrl !== null) {
                $track->setCoverUrl($coverUrl);
                $updated++;
            } else {
                $io->warning(sprintf('No cover found for: %s - %s', $artist->getName(), $track->getTitle()));
                $failed++;
            }
        }

        $this->entityManager->flush();
        $io->progressFinish();

        $io->success(sprintf('Updated %d track covers (%d failed)', $updated, $failed));

        return Command::SUCCESS;
    }
}
