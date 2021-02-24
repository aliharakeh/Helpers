import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ServerResponse } from '../models/response.model';
import { HttpErrorsService } from './http-errors.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private BASE_URL = environment.serverURL;

  constructor(private http: HttpClient, private httpErrors: HttpErrorsService, private utils: UtilsService) {}

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
    for (let key in data) {
      formData.append(key, data[key]);
    }
    return this.post(route, formData);
  }

  private callHttpMethod(httpMethod, url: string, data?: {}): Observable<ServerResponse> {
    const params: any = [url];
    if (data) params.push(data);

    // bind the function to its owner for correct `this` reference
    httpMethod = httpMethod.bind(this.http);
    const response: Observable<any> = httpMethod(...params);

    return response.pipe(
      map((res: any) => {
        let serverResponse;
        if (!res)
          return new ServerResponse({});
        else
          serverResponse = new ServerResponse(res);
        this.utils.debug('Server Response', serverResponse);
        return serverResponse;
      }),
      catchError(this.httpErrors.handleError)
    );
  }

  private buildUrl(route: string, params = []): string {
    const url = `${this.BASE_URL}/${route}`;
    if (params.length !== 0)
      return url + '/' + params.join('/');
    return url;
  }
}
