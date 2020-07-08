import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor(public auth: AuthenticationService) {
  }

  private adminRoutes = ['systems', 'projects', 'users'];

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const currentRoute = state.url.split('/')[1];
    if (currentRoute in this.adminRoutes) {
      return this.auth.userExists && this.auth.isAdmin;

    } else {
      return this.auth.userExists;
    }
  }
}
