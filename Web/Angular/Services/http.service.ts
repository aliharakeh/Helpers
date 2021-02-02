import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private BASE_URL = environment.serverURL;

  constructor(private http: HttpClient) {
  }

  get(route: string, ...params): Observable<any> {
    const urlData = !params ? '' :  `/${params.join('/')}`;
    return this.http.get<any>(`${this.BASE_URL}/${route}${urlData}`);
  }

  post(route: string, data): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/${route}`, data);
  }
}
