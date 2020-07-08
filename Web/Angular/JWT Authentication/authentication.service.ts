import {Injectable} from '@angular/core';
import {HttpService} from '../http.service';
import {User} from './user.model';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private user: User | null = null;

  constructor(private http: HttpService, private router: Router) {
  }

  register(username: string, password: string) {
    this.http.post('register', {username, password}).subscribe(
      response => {
        // @ts-ignore
        this.user = {...response.user, token: response.token};
        localStorage.setItem('user', JSON.stringify(this.user));
        if (this.user.is_admin) {
          this.router.navigate(['/systems']);
        } else {
          this.router.navigate(['/tasks', this.userID]);
        }
      },
      error => console.log(error)
    );
  }

  login(username: string, password: string) {
    this.http.post('login', {username, password}).subscribe(
      response => {
        // @ts-ignore
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        if (this.user.is_admin) {
          this.router.navigate(['/systems']);
        } else {
          this.router.navigate(['/tasks', this.userID]);
        }
      },
      error => console.log(error)
    );
  }

  setUser(user: string) {
    this.user = JSON.parse(user);
  }

  get is_admin() {
    return this.user.is_admin;
  }

  get userExists() {
    return this.user !== null;
  }

  get isAdmin() {
    return this.userExists && this.user.is_admin === 1;
  }

  get userID() {
    return this.userExists ? this.user.id : -1;
  }

  get username() {
    return this.user.display_name;
  }

  get userToken() {
    return this.user.token;
  }

  logout() {
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }
}
