import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpEventType,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      params: new HttpParams({ fromObject: params })
    }).pipe(
      catchError(this.handleError)
    );
  }

  // GET avec pagination
  getPaginated<T>(endpoint: string, page: number = 0, size: number = 20, params?: any): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<PaginatedResponse<T>>(`${this.apiUrl}${endpoint}`, {
      params: httpParams
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST request
  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, options)
      .pipe(
        catchError(this.handleError)
      ) as Observable<T>;
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PATCH request
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Upload file avec progression - Option 1: Retourne seulement la réponse finale
  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post(`${this.apiUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter((event: HttpEvent<any>): event is HttpResponse<T> => event.type === HttpEventType.Response),
      map((event: HttpResponse<T>) => event.body as T),
      catchError(this.handleError)
    ) as Observable<T>;
  }

  // Upload file avec progression complète - Option 2: Retourne tous les événements
  uploadFileWithProgress<T>(endpoint: string, formData: FormData): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Download file
  downloadFile(endpoint: string, params?: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      params: new HttpParams({ fromObject: params }),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 500) {
        errorMessage = 'Erreur interne du serveur';
      } else if (error.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès interdit';
      } else if (error.status === 400) {
        errorMessage = 'Requête invalide';
      } else if (error.status === 422) {
        errorMessage = 'Données invalides';
      } else if (error.status === 409) {
        errorMessage = 'Conflit de données';
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Méthode utilitaire pour construire des query params
  buildQueryParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            // Pour les tableaux, ajouter chaque valeur
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }
}
