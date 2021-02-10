import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  alert(message: string) {
    if (!environment.production) {
      alert(message);
    }
  }

  debug(...objects: any[]) {
    if (!environment.production) {
      for (const obj of objects) {
        console.log(obj);
      }
    }
  }
}
