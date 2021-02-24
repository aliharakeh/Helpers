import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  getResource(resource: string) {
    return environment.production ? environment.serverURL + '/' + resource : `../../../assets/${resource}`;
  }
}
