import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
    name: 'apiUrl',
    standalone: true
})
export class ApiUrlPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) {
            return 'assets/images/default-cover.png';
        }

        // Si l'URL est déjà absolue (http://... ou https://... ou blob:...)
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
            return value;
        }

        // S'assurer que le chemin commence par /
        const path = value.startsWith('/') ? value : `/${value}`;

        return `${environment.apiUrl}${path}`;
    }
}
