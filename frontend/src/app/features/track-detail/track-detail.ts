import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Track } from '../../core/models/track.model';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { FileSizePipe } from '../../shared/pipes/file-size-pipe';
import { TrackApiService } from '../../core/services/track-api.service'; // AJOUTÉ

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, DurationPipe, FileSizePipe],
  templateUrl: './track-detail.html',
  styleUrls: ['./track-detail.css']
})
export class TrackDetailComponent implements OnInit, OnDestroy {
  // État local
  track = signal<Track | null>(null);
  isLoading = signal(true);
  error = signal('');
  showWaveform = signal(false);
  showLyrics = signal(false);
  showSimilarTracks = signal(true);

  // État du lecteur
  isPlaying = computed(() =>
    this.playerService.currentTrack()?.id === this.track()?.id &&
    this.playerService.status() === 'playing'
  );

  currentTime = computed(() => this.playerService.currentTime());
  duration = computed(() => this.playerService.duration());
  progress = computed(() => this.playerService.progress());

  // Tracks similaires
  similarTracks = signal<Track[]>([]);

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trackService: TrackService,
    private playerService: AudioPlayerService,
    private trackApiService: TrackApiService // AJOUTÉ
  ) { }

  ngOnInit(): void {
    this.loadTrack();

    // Écouter les changements de route
    const routeSub = this.route.params.subscribe(() => {
      this.loadTrack();
    });

    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============ LOADING MODIFIÉ ============

  private loadTrack(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('ID de piste manquant');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    // Utiliser l'API pour charger la piste
    this.trackApiService.getTrack(id).subscribe({
      next: (track) => {
        this.track.set(track);
        this.isLoading.set(false);
        this.loadSimilarTracks(track);
      },
      error: (error) => {
        console.error('Erreur API:', error);

        // Fallback: chercher dans les tracks locales
        this.trackService.getTrackById(id).pipe(first()).subscribe(localTrack => {
          if (localTrack) {
            this.track.set(localTrack);
            this.isLoading.set(false);
            this.loadSimilarTracks(localTrack);
          } else {
            this.error.set('Piste non trouvée');
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  private loadSimilarTracks(track: Track): void {
    // Utiliser l'API pour les pistes similaires
    this.trackApiService.getTracksByCategory(track.category, 0, 5)
      .subscribe({
        next: (tracks) => {
          // Filtrer la piste actuelle
          const similar = tracks.filter(t => t.id !== track.id);
          this.similarTracks.set(similar.slice(0, 5));
        },
        error: (error) => {
          console.error('Erreur lors du chargement des pistes similaires:', error);
          // Fallback: utiliser les tracks locales
          this.trackService.tracks.pipe(first()).subscribe(allTracks => {
            const similar = allTracks.filter((t: Track) =>
              t.id !== track.id &&
              (t.category === track.category || t.artist === track.artist)
            ).slice(0, 5);
            this.similarTracks.set(similar);
          });
        }
      });
  }

  // ============ PLAYBACK CONTROLS ============

  playTrack(): void {
    const track = this.track();
    if (!track) return;

    if (this.isPlaying()) {
      this.playerService.pause();
    } else {
      if (this.playerService.currentTrack()?.id === track.id) {
        this.playerService.play();
      } else {
        this.playerService.setQueue([track], 0);
        this.playerService.play();

        // Incrémenter les lectures via API
        this.trackApiService.incrementPlays(track.id).subscribe({
          next: () => {
            // Mettre à jour localement
            this.track.update(t => {
              if (t) {
                return { ...t, plays: t.plays + 1 };
              }
              return t;
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'incrémentation des lectures:', error);
          }
        });
      }
    }
  }

  addToQueue(): void {
    const track = this.track();
    if (track) {
      this.playerService.addToQueue(track);
    }
  }

  playSimilarTrack(similarTrack: Track): void {
    this.playerService.setQueue([similarTrack], 0);
    this.playerService.play();
    this.router.navigate(['/track', similarTrack.id]);
  }

  // ============ TRACK ACTIONS MODIFIÉES ============

  likeTrack(): void {
    const track = this.track();
    if (track) {
      this.trackApiService.likeTrack(track.id).subscribe({
        next: (updatedTrack) => {
          this.track.set(updatedTrack);
        },
        error: (error) => {
          console.error('Erreur lors du like:', error);
        }
      });
    }
  }

  editTrack(): void {
    const track = this.track();
    if (track) {
      this.router.navigate(['/library'], {
        queryParams: { edit: track.id }
      });
    }
  }

  deleteTrack(): void {
    const track = this.track();
    if (!track) return;

    if (confirm(`Supprimer "${track.title}" ? Cette action est irréversible.`)) {
      this.trackApiService.deleteTrack(track.id).subscribe({
        next: () => {
          // Si la piste supprimée est en cours de lecture, arrêter la lecture
          if (this.playerService.currentTrack()?.id === track.id) {
            this.playerService.stop();
          }

          // Retourner à la bibliothèque
          this.router.navigate(['/library']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error.set('Erreur lors de la suppression de la piste');
        }
      });
    }
  }

  // ============ UI CONTROLS ============

  toggleWaveform(): void {
    this.showWaveform.update(show => !show);
  }

  toggleLyrics(): void {
    this.showLyrics.update(show => !show);
  }

  toggleSimilarTracks(): void {
    this.showSimilarTracks.update(show => !show);
  }

  // ============ UTILITIES MODIFIÉES ============

  formatDate(date: Date | string | null | undefined): string {
    if (!date) {
      return 'Date inconnue';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getFileUrlDisplay(): string {
    const track = this.track();
    if (!track || !track.fileUrl) {
      return 'N/A';
    }

    // Afficher uniquement le nom du fichier ou URL courte
    if (track.fileUrl.includes('/uploads/')) {
      const parts = track.fileUrl.split('/');
      return parts[parts.length - 1];
    }

    if (track.fileUrl.length > 50) {
      return track.fileUrl.slice(0, 50) + '...';
    }

    return track.fileUrl;
  }

  getAudioStreamUrl(): string {
    const track = this.track();
    if (!track) return '';

    return this.trackApiService.getAudioStreamUrl(track.id);
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'POP': '#FF6B6B',
      'ROCK': '#4ECDC4',
      'RAP': '#FFD166',
      'JAZZ': '#06D6A0',
      'CLASSICAL': '#118AB2',
      'ELECTRONIC': '#EF476F',
      'HIPHOP': '#7209B7',
      'RNB': '#F8961E',
      'COUNTRY': '#43AA8B',
      'REGGAE': '#577590',
      'METAL': '#2D3047',
      'BLUES': '#264653',
      'FOLK': '#2A9D8F'
    };

    return colors[category.toUpperCase()] || '#E50914';
  }

  goBack(): void {
    this.router.navigate(['/library']);
  }

  // ============ KEYBOARD SHORTCUTS ============

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.goBack();
    } else if (event.key === ' ') {
      event.preventDefault();
      this.playTrack();
    } else if (event.key === 'l' || event.key === 'L') {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.likeTrack();
      }
    }
  }
}
