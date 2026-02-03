import { Component, OnInit, OnDestroy, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AudioPlayerService } from './core/services/audio-player.service';
import { TrackService } from './core/services/track.service';
import { AudioPlayerComponent } from './shared/components/audio-player/audio-player';
import { TrackApiService } from './core/services/track-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AudioPlayerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'music-stream';

  // État de l'application
  public currentRoute = signal<string>('');
  public showPlayer = signal<boolean>(true);
  public isLoading = signal<boolean>(false);
  public storageUsage = signal<number>(0);

  // État du lecteur
  public hasCurrentTrack = computed(() => !!this.playerService.currentTrack());
  public playerStatus = computed(() => this.playerService.status());

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public playerService: AudioPlayerService,
    private trackService: TrackService,
    private trackApiService: TrackApiService  // Service API ajouté
  ) { }

  ngOnInit(): void {
    // Suivre la navigation
    const routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.urlAfterRedirects);
      this.scrollToTop();
    });

    this.subscriptions.push(routerSub);

    // Subscribe to loading state
    this.subscriptions.push(
      this.trackService.isLoading.subscribe(isLoading => {
        this.isLoading.set(isLoading);
      })
    );

    // Restaurer l'état du lecteur
    setTimeout(() => {
      this.playerService.restoreState();
    }, 100);

    // Calcul de l'utilisation du stockage via API si disponible
    this.calculateStorageUsage();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.playerService.saveState();
  }

  // ============ NAVIGATION ============

  isActiveRoute(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  public scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============ PLAYER CONTROLS ============

  public togglePlayer(): void {
    this.showPlayer.update(show => !show);
  }

  public minimizePlayer(): void {
    this.showPlayer.set(false);
  }

  // ============ APP ACTIONS ============

  public refreshLibrary(): void {
    // Utiliser le service API pour rafraîchir
    this.trackApiService.refreshTracks().subscribe({
      next: () => {
        console.log('Bibliothèque rafraîchie');
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement:', error);
      }
    });
  }

  public exportData(): void {
    // Avec API, on ne peut plus exporter localement
    console.warn('Export via API non implémenté - Utilisez les endpoints backend');
  }

  // ============ UTILITY FUNCTIONS ============

  private calculateStorageUsage(): void {
    // Avec API, on ne peut plus calculer l'usage côté client
    // On affiche 0 ou on pourrait créer un endpoint pour ça
    this.storageUsage.set(0);

    // Option: Si vous avez un endpoint pour les stats de stockage
    // this.trackApiService.getStorageStats().subscribe(stats => {
    //   this.storageUsage.set(stats.usagePercentage);
    // });
  }

  // ============ KEYBOARD SHORTCUTS ============

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ignorer si on est dans un input
    if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement) {
      return;
    }

    // Ctrl/Cmd + S pour sauvegarder (désactivé avec API)
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      console.info('Export désactivé en mode API');
    }

    // Ctrl/Cmd + R pour rafraîchir
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.refreshLibrary();
    }

    // Échap pour minimiser le player
    if (event.key === 'Escape' && this.hasCurrentTrack()) {
      this.minimizePlayer();
    }
  }
}
