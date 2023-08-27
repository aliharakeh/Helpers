import {Router} from '@angular/router';
import {AuthenticationService} from '../providers/authentication/authentication.service';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {EMPTY, Observable, Subject, throwError} from 'rxjs';
import {catchError, filter, finalize, retry, switchMap, take, tap} from 'rxjs/operators';
import {Tokens} from '../models/tokens';

@Injectable()
export class RefreshAccessTokenInterceptor implements HttpInterceptor {
    private isTokenRefreshing = false;
    private refreshTokenSubject: Subject<any> = new Subject<any>();

    constructor(
        private readonly auth: AuthenticationService,
        private readonly router: Router
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const currentuser = this.auth.currentUserValue;
        if ([
                '/login',
                '/logout',
                '/refreshToken',
                '/assets/',
                '/configuration/color',
                '/configuration/logo',
                '/configuration/getMobileVersion',
                '/option/getPermissionUrlJson',
                '/option/getSettingsConfigJson',
                '/option/getPermissionTokenJso',
                '/option/getGlobalConfigJson',
                '/raccrochage/resetPasswordByUsername'
            ].some(url => req.url.includes(url))
        ) {
            return next.handle(req).pipe(
                catchError((error) => {
                    if (error.status === 403 && req.url.includes('/refreshToken')) {
                        this.auth.logout();
                        const err = error.message || error.statusText;
                        return throwError(err);
                    }
                    return throwError(error);
                })
            );
        }
        if (this.auth.getJwtToken()) {
            if (this.auth.isTokenExpired() && this.isTokenRefreshing) {
                return this.subscribeToRefreshToken(req, next);
            }
            else if (this.auth.isTokenExpired() && !this.isTokenRefreshing) {
                this.isTokenRefreshing = true;
                this.auth.refreshToken().pipe(
                    take(1),
                    tap((token: Tokens) => {
                        this.isTokenRefreshing = false;
                        this.refreshTokenSubject.next(this.auth.getJwtToken());
                    }),
                    catchError(err => {
                        this.isTokenRefreshing = false;
                        return EMPTY;
                    })
                ).subscribe();
                return this.subscribeToRefreshToken(req, next);
            }
            else {
                req = this.addToken(req, this.auth.getJwtToken());
            }
        }
        else {
            this.auth.logout();
        }
        return next.handle(req).pipe(
            catchError((error) => {
                if (
                    (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) ||
                    error === 'Unauthorized'

                ) {
                    return this.handle401Error(req, next);
                }
                else if (error.status === 302) {
                    this.router.navigate(['login'], { queryParams: { returnUrl: null } });
                }
                else {
                    const err = error.message || error.statusText;
                    return throwError(err);
                }
            })
        );
    }

    private subscribeToRefreshToken(req: HttpRequest<any>, next: HttpHandler) {
        return this.refreshTokenSubject.pipe(
            take(1),
            switchMap((token: string) => {
                return next.handle(this.addToken(req, token));
            })
        );
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isTokenRefreshing) {
            this.isTokenRefreshing = true;

            this.refreshTokenSubject.next(null);

            return this.auth.refreshToken().pipe(
                switchMap((token: Tokens) => {
                    if (token) {
                        this.refreshTokenSubject.next(token.token);
                        return next.handle(this.addToken(request, token.token)).pipe(retry(1));
                    }
                    this.auth.logout();
                }),
                catchError(() => {
                    this.auth.logout();
                    return next.handle(request);
                }),
                finalize(() => {
                    this.isTokenRefreshing = false;
                })
            );
        }
        else {
            return this.refreshTokenSubject.pipe(
                filter((token) => token != null),
                take(1),
                switchMap((token: string) => {
                    return next.handle(this.addToken(request, token)).pipe(retry(1));
                })
            );
        }
    }
}
