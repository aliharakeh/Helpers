import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IServerResponse, ServerResponse} from '../models/response.model';
import {map} from 'rxjs/operators';
import {DebugService} from './debug.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private BASE_URL = environment.serverURL;

  constructor(private http: HttpClient, private debug: DebugService) {}

  get(route: string, ...params): Observable<ServerResponse> {
    return this.callHttpMethod(this.http.get, this.buildUrl(route, params));
  }

  post(route: string, data): Observable<ServerResponse> {
    return this.callHttpMethod(this.http.post, this.buildUrl(route), data);
  }

  put(route: string, data): Observable<ServerResponse> {
    return this.callHttpMethod(this.http.put, this.buildUrl(route), data);
  }

  patch(route: string, data): Observable<ServerResponse> {
    return this.callHttpMethod(this.http.patch, this.buildUrl(route), data);
  }

  delete(route: string, ...params): Observable<ServerResponse> {
    return this.callHttpMethod(this.http.delete, this.buildUrl(route, params));
  }

  formData(route: string, data): Observable<ServerResponse> {
    let formData = new FormData();
    for (let key in data)
      formData.append(key, data[key]);
    return this.post(route, formData);
  }

  private callHttpMethod(httpMethod, url: string, data?: {}): Observable<ServerResponse> {
    const params: any = [url];
    if (data) params.push(data);

    // bind the function to its owner for correct `this` reference
    httpMethod = httpMethod.bind(this.http);
    const response: Observable<IServerResponse> = httpMethod(...params);

    return response.pipe(
      map((res: IServerResponse) => {
        const serverResponse = new ServerResponse(res);
        this.debug.debug('Server Response', serverResponse);
        return serverResponse;
      })
    );
  }

  private buildUrl(route: string, params = []): string {
    const url = `${this.BASE_URL}/${route}`;
    if (params.length !== 0)
      return url + '/' + params.join('/');
    return url;
  }
}
