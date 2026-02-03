import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur';
        } else if (error.status === 401) {
          errorMessage = 'Non autorisé';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé';
        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée';
        } else if (error.status === 500) {
          errorMessage = 'Erreur interne du serveur';
        }
      }

      console.error('HTTP Error:', error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
