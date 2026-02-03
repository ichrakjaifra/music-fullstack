import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library')
      .then(m => m.LibraryComponent)
  },
  {
    path: 'track/:id',
    loadComponent: () => import('./features/track-detail/track-detail')
      .then(m => m.TrackDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'library'
  }
];
