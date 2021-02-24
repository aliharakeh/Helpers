import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteUitlsService {

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  getRouteParams(): Observable<ParamMap> {
    return this.activatedRoute.paramMap;
  }

  redirectTo(route: string, ...params: any[]): Promise<boolean> {
    return this.router.navigate([route, ...params]);
  }
}
