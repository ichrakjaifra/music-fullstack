import { Component, OnInit, OnDestroy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Track, MusicCategory } from '../../core/models/track.model';
import { SortBy, SortOrder } from '../../core/models/player-state.enum';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { TrackCardComponent } from '../../shared/components/track-card/track-card';
import { TrackFormComponent } from '../../shared/components/track-form/track-form';
import { DurationPipe } from '../../shared/pipes/duration-pipe';
import { FileSizePipe } from '../../shared/pipes/file-size-pipe';
import { SearchFilterPipe } from '../../shared/pipes/search-filter-pipe';
import { DragDropDirective } from '../../shared/directives/drag-drop';
import { ApiUrlPipe } from '../../shared/pipes/api-url.pipe';
import { AppState } from '../../core/store/app.state';
import * as TrackActions from '../../core/store/track/track.actions';
import * as TrackSelectors from '../../core/store/track/track.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TrackCardComponent,
    TrackFormComponent,
    DurationPipe,
    DragDropDirective,
    ApiUrlPipe
  ],
  templateUrl: './library.html',
  styleUrls: ['./library.css']
})
export class LibraryComponent implements OnInit, OnDestroy {
  // Injections
  public store = inject(Store<AppState>);
  private destroyRef = inject(DestroyRef);
  public playerService = inject(AudioPlayerService);
  private router = inject(Router);

  protected readonly TrackActions = TrackActions;

  // Observables depuis le store
  private tracks$ = this.store.select(TrackSelectors.selectFilteredTracks);
  private loading$ = this.store.select(TrackSelectors.selectTrackLoading);
  private error$ = this.store.select(TrackSelectors.selectTrackError);
  private categories$ = this.store.select(TrackSelectors.selectCategories);
  private stats$ = this.store.select(TrackSelectors.selectTrackStats);
  private categoryStats$ = this.store.select(TrackSelectors.selectCategoryStats);
  private currentPage$ = this.store.select(TrackSelectors.selectCurrentPage);
  private totalPages$ = this.store.select(TrackSelectors.selectTotalPages);
  private totalElements$ = this.store.select(TrackSelectors.selectTotalElements);
  private searchQuery$ = this.store.select(TrackSelectors.selectSearchQuery);
  private selectedCategory$ = this.store.select(TrackSelectors.selectSelectedCategory);

  // Signaux pour l'UI
  showForm = signal(false);
  editingTrack = signal<Track | null>(null);
  selectedTracks = signal<Set<string>>(new Set());
  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  sortBy = signal<SortBy>(SortBy.DATE);
  sortOrder = signal<SortOrder>(SortOrder.DESC);
  isDragging = signal(false);
  showStats = signal(false);
  showImportExport = signal(false);
  itemsPerPage = signal(12);

  // Signaux pour les données
  tracks = signal<Track[]>([]);
  loading = signal(false);
  error = signal('');
  categories = signal<string[]>(['all']);
  stats = signal({
    totalTracks: 0,
    totalDuration: 0,
    totalPlays: 0,
    totalLikes: 0,
    byCategory: {} as Record<string, number>
  });
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  selectedCategory = signal('all');

  // État du lecteur
  currentPlayingId = computed(() => this.playerService.currentTrack()?.id);
  isPlaying = computed(() => this.playerService.status() === 'playing');

  // Signaux locaux pour les données triées
  filteredTracks = signal<Track[]>([]);

  // Subjects pour la recherche
  private searchSubject = new Subject<string>();

  // Définir SortBy et SortOrder comme propriétés publiques pour le template
  readonly SortBy = SortBy;
  readonly SortOrder = SortOrder;

  ngOnInit(): void {
    // Setup search avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(0);

      if (term.trim()) {
        this.store.dispatch(TrackActions.searchTracks({ query: term }));
      } else {
        this.store.dispatch(TrackActions.loadTracks({ page: 0 }));
      }
    });

    // S'abonner aux observables du store
    this.setupStoreSubscriptions();

    // Charger les tracks initiales
    this.store.dispatch(TrackActions.loadTracks({ page: 0 }));
    this.store.dispatch(TrackActions.loadTrackStats());
    this.store.dispatch(TrackActions.loadCategoryStats());

    // Restaurer les préférences
    this.restorePreferences();
  }

  ngOnDestroy(): void {
    this.savePreferences();
  }

  private setupStoreSubscriptions(): void {
    this.tracks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tracks => {
        this.tracks.set(tracks);
        this.filteredTracks.set(this.sortTracks(tracks));
      });

    this.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loading => this.loading.set(loading));

    this.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(error => this.error.set(error || ''));

    this.categories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(categories => {
        // Toujours mettre 'all' en premier et éviter les doublons
        this.categories.set(['all', ...categories]);
      });

    this.stats$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stats => {
        if (stats) {
          this.stats.update(s => ({
            ...s,
            totalTracks: stats.totalTracks,
            totalDuration: stats.totalDuration,
            totalPlays: stats.totalPlays,
            totalLikes: stats.totalLikes
          }));
        }
      });

    this.categoryStats$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(categoryStats => {
        if (categoryStats) {
          this.stats.update(s => ({
            ...s,
            byCategory: categoryStats
          }));
        }
      });

    this.currentPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(page => this.currentPage.set(page));

    this.totalPages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(totalPages => this.totalPages.set(totalPages));

    this.totalElements$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(totalElements => this.totalElements.set(totalElements));

    this.selectedCategory$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(category => this.selectedCategory.set(category));
  }

  // ============ TRACK ACTIONS ============

  onPlayTrack(track: Track): void {
    const currentTrack = this.playerService.currentTrack();

    if (currentTrack?.id === track.id && this.isPlaying()) {
      this.playerService.pause();
    } else if (currentTrack?.id === track.id && !this.isPlaying()) {
      this.playerService.play();
    } else {
      this.playerService.setQueue([track], 0);
      this.playerService.play();
    }
  }

  onDeleteTrack(track: Track): void {
    if (confirm(`Supprimer "${track.title}" ? Cette action est irréversible.`)) {
      this.store.dispatch(TrackActions.deleteTrack({ id: track.id }));

      // Si la piste supprimée est en cours de lecture, arrêter la lecture
      if (this.playerService.currentTrack()?.id === track.id) {
        this.playerService.stop();
      }

      // Retirer de la sélection
      const selected = new Set(this.selectedTracks());
      selected.delete(track.id);
      this.selectedTracks.set(selected);
    }
  }

  onLikeTrack(track: Track): void {
    this.store.dispatch(TrackActions.likeTrack({ id: track.id }));
  }

  onAddToQueue(track: Track): void {
    this.playerService.addToQueue(track);
  }

  onPauseTrack(): void {
    this.playerService.pause();
  }

  onEditTrack(track: Track): void {
    this.editingTrack.set(track);
    this.showForm.set(true);
  }

  // ============ FORM HANDLING ============

  onTrackSubmit(event: {
    trackData: Partial<Track>;
    audioFile: File;
    imageFile?: File;
  }): void {
    const editingTrack = this.editingTrack();

    if (editingTrack) {
      // Cas de la mise à jour
      const updateRequest = {
        title: event.trackData.title!,
        artist: event.trackData.artist!,
        description: event.trackData.description,
        category: event.trackData.category as MusicCategory
      };

      this.store.dispatch(TrackActions.updateTrack({
        id: editingTrack.id,
        trackData: updateRequest
      }));
    } else {
      // Cas de la création
      const createRequest = {
        title: event.trackData.title!,
        artist: event.trackData.artist!,
        description: event.trackData.description,
        category: event.trackData.category as MusicCategory
      };

      this.store.dispatch(TrackActions.createTrack({
        trackData: createRequest,
        audioFile: event.audioFile,
        imageFile: event.imageFile
      }));
    }

    this.showForm.set(false);
    this.editingTrack.set(null);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.editingTrack.set(null);
  }

  // ============ SEARCH & FILTER ============

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
    this.store.dispatch(TrackActions.loadTracks({ page: 0 }));
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(0);

    if (category === 'all') {
      this.store.dispatch(TrackActions.loadTracks({ page: 0 }));
    } else {
      this.store.dispatch(TrackActions.filterTracksByCategory({ category, page: 0 }));
    }
  }

  onSortChange(sortBy: SortBy): void {
    if (this.sortBy() === sortBy) {
      // Inverser l'ordre si on clique sur la même colonne
      this.sortOrder.set(
        this.sortOrder() === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
      );
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set(SortOrder.DESC);
    }

    // Appliquer le tri local
    this.filteredTracks.set(this.sortTracks(this.filteredTracks()));
  }

  private sortTracks(tracks: Track[]): Track[] {
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    return [...tracks].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case SortBy.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case SortBy.ARTIST:
          aValue = a.artist.toLowerCase();
          bValue = b.artist.toLowerCase();
          break;
        case SortBy.DATE:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case SortBy.DURATION:
          aValue = a.duration;
          bValue = b.duration;
          break;
        case SortBy.PLAYS:
          aValue = a.plays || 0;
          bValue = b.plays || 0;
          break;
        case SortBy.LIKES:
          aValue = a.likes || 0;
          bValue = b.likes || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // ============ UI CONTROLS ============

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  toggleStats(): void {
    this.showStats.set(!this.showStats());
  }

  toggleImportExport(): void {
    this.showImportExport.set(!this.showImportExport());
  }

  openAddForm(): void {
    this.editingTrack.set(null);
    this.showForm.set(true);
  }

  // ============ PAGINATION ============

  goToPage(page: number): void {
    const currentCategory = this.selectedCategory();

    if (currentCategory === 'all') {
      this.store.dispatch(TrackActions.loadTracks({ page }));
    } else {
      this.store.dispatch(TrackActions.filterTracksByCategory({
        category: currentCategory,
        page
      }));
    }

    this.currentPage.set(page);
    this.scrollToTop();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    // Afficher un nombre limité de pages autour de la page courante
    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i + 1); // +1 pour afficher 1,2,3... au lieu de 0,1,2...
    }

    return pages;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============ COMPUTED VALUES ============

  paginatedTracks = computed(() => {
    const startIndex = this.currentPage() * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredTracks().slice(startIndex, endIndex);
  });

  selectedCount = computed(() => this.selectedTracks().size);
  hasSelection = computed(() => this.selectedCount() > 0);

  // ============ SELECTION ACTIONS ============

  onSelectTrack(track: Track, event?: Event): void {
    event?.stopPropagation();

    const mouseEvent = event as MouseEvent;

    if (mouseEvent?.ctrlKey || mouseEvent?.metaKey) {
      // Sélection multiple
      const selected = new Set(this.selectedTracks());
      if (selected.has(track.id)) {
        selected.delete(track.id);
      } else {
        selected.add(track.id);
      }
      this.selectedTracks.set(selected);
    } else {
      // Sélection simple
      const selected = new Set<string>();
      selected.add(track.id);
      this.selectedTracks.set(selected);
    }
  }

  selectAll(): void {
    const selected = new Set<string>();
    this.paginatedTracks().forEach(track => {
      selected.add(track.id);
    });
    this.selectedTracks.set(selected);
  }

  clearSelection(): void {
    this.selectedTracks.set(new Set());
  }

  // ============ DRAG & DROP ============

  onFilesDropped(files: FileList): void {
    this.isDragging.set(false);

    // Pour l'instant, on ne gère qu'un seul fichier audio
    const audioFiles = Array.from(files).filter(file =>
      file.type.startsWith('audio/')
    );

    if (audioFiles.length > 0) {
      this.openAddForm();
    }
  }

  onDragOver(isDragging: boolean): void {
    this.isDragging.set(isDragging);
  }

  // ============ IMPORT/EXPORT ============

  exportData(): void {
    console.warn('Export via API non implémenté');
    alert('La fonction d\'export est désactivée en mode API.');
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      alert('L\'importation est désactivée en mode API.');
    }
  }

  clearAllData(): void {
    if (confirm('Vider toute la bibliothèque ? Cette action est irréversible.')) {
      alert('La suppression massive est désactivée en mode API.');
    }
  }

  // ============ BATCH ACTIONS ============

  deleteSelectedTracks(): void {
    const count = this.selectedCount();
    if (count === 0) return;

    if (confirm(`Supprimer ${count} piste(s) sélectionnée(s) ?`)) {
      const tracksToDelete = Array.from(this.selectedTracks());

      tracksToDelete.forEach(trackId => {
        this.store.dispatch(TrackActions.deleteTrack({ id: trackId }));
      });

      this.selectedTracks.set(new Set());
    }
  }

  addSelectedToQueue(): void {
    const selectedIds = Array.from(this.selectedTracks());
    const selectedTracks = this.filteredTracks().filter(track => selectedIds.includes(track.id));

    selectedTracks.forEach(track => {
      this.playerService.addToQueue(track);
    });
  }

  playSelectedTracks(): void {
    const selectedIds = Array.from(this.selectedTracks());
    const selectedTracks = this.filteredTracks().filter(track => selectedIds.includes(track.id));

    if (selectedTracks.length > 0) {
      this.playerService.setQueue(selectedTracks, 0);
      this.playerService.play();
    }
  }

  // ============ PREFERENCES ============

  private savePreferences(): void {
    const preferences = {
      viewMode: this.viewMode(),
      itemsPerPage: this.itemsPerPage(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };

    localStorage.setItem('music-stream-library-preferences', JSON.stringify(preferences));
  }

  private restorePreferences(): void {
    try {
      const saved = localStorage.getItem('music-stream-library-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);

        if (preferences.viewMode) this.viewMode.set(preferences.viewMode);
        if (preferences.itemsPerPage) this.itemsPerPage.set(preferences.itemsPerPage);
        if (preferences.sortBy) this.sortBy.set(preferences.sortBy);
        if (preferences.sortOrder) this.sortOrder.set(preferences.sortOrder);
      }
    } catch (error) {
      console.error('Erreur lors de la restauration des préférences:', error);
    }
  }

  getSortByLabel(): string {
    switch (this.sortBy()) {
      case SortBy.TITLE: return 'Titre';
      case SortBy.ARTIST: return 'Artiste';
      case SortBy.DATE: return 'Date';
      case SortBy.DURATION: return 'Durée';
      case SortBy.PLAYS: return 'Lectures';
      case SortBy.LIKES: return 'Likes';
      default: return 'Titre';
    }
  }
}
