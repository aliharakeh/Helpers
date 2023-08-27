import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteUitlsService {

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  routeParams(): Observable<ParamMap> {
    return this.activatedRoute.paramMap;
  }
  
  routeData(): Observable<Data> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data)
    );
  }

  redirectTo(route: string, ...params: any[]): Promise<boolean> {
    return this.router.navigate([route, ...params]);
  }
}
