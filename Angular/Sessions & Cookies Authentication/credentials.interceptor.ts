import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {CookieService} from "ngx-cookie-service";

@Injectable()
class CredentialsInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let config: any = {
      withCredentials: true
    };
    if (this.cookieService.check('XSRF-TOKEN')) {
      config = {
        ...config,
        setHeaders: {
          "X-XSRF-TOKEN": this.cookieService.get('XSRF-TOKEN')
        }
      };
    }
    return next.handle(req.clone(config));
  }
}

// should be added in app.module.ts providers as follows:
// providers: [
//   CookieService,
//   CredentialsProvider
// ],
export let CredentialsProvider = {provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true}
