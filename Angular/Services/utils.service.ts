import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  debug(...objects: any[]): void {
    if (!environment.production) {
      for (const obj of objects) {
        console.log(obj);
      }
    }
  }

  error(error: any): void {
    if (!environment.production) {
      alert(JSON.stringify(error, null, 2));
    }
  }
}
