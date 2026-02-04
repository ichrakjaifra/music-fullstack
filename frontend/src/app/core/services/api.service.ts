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
  // L'URL de base est gérée par l'intercepteur
  constructor(private http: HttpClient) { }

  // GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(endpoint, {
      params: new HttpParams({ fromObject: params })
    });
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

    return this.http.get<PaginatedResponse<T>>(endpoint, {
      params: httpParams
    });
  }

  // POST request
  post<T>(endpoint: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(endpoint, data, options) as Observable<T>;
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(endpoint, data);
  }

  // PATCH request
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(endpoint, data);
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(endpoint);
  }

  // Upload file avec progression - Option 1: Retourne seulement la réponse finale
  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post(endpoint, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter((event: HttpEvent<any>): event is HttpResponse<T> => event.type === HttpEventType.Response),
      map((event: HttpResponse<T>) => event.body as T)
    ) as Observable<T>;
  }

  // Upload file avec progression complète - Option 2: Retourne tous les événements
  uploadFileWithProgress<T>(endpoint: string, formData: FormData): Observable<HttpEvent<T>> {
    return this.http.post<T>(endpoint, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  // Download file
  downloadFile(endpoint: string, params?: any): Observable<Blob> {
    return this.http.get(endpoint, {
      params: new HttpParams({ fromObject: params }),
      responseType: 'blob'
    });
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
