import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur client: ${error.error.message}`;
      } else {
        // Log detailed error for debugging
        console.error(`Status: ${error.status}, URL: ${req.url}, Error:`, error);

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur (vérifiez que le Backend est lancé sur le port 8080)';
        } else if (error.status === 401) {
          errorMessage = 'Non autorisé';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé';
        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée';
        } else if (error.status === 500) {
          errorMessage = 'Erreur interne du serveur (500)';
        } else {
          errorMessage = `Erreur HTTP ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
