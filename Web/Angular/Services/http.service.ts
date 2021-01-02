import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private BASE_URL = 'http://localhost/api';

  constructor(private http: HttpClient) {
  }

  get(route: string, ...params): Observable<JSON> {
    const urlData = !params ? '' :  `/${params.join('/')}`;
    return this.http.get<JSON>(`${this.BASE_URL}/${route}${urlData}`);
  }

  post(route: string, data): Observable<JSON> {
    return this.http.post<JSON>(`${this.BASE_URL}/${route}`, data);
  }
}
