import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../http.service';
import {Router} from '@angular/router';
import alertify from 'alertifyjs';
import {AuthenticationService} from '../authentication/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    display_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    password: new FormControl('', [Validators.maxLength(60)]),
    confirm_password: new FormControl('', [Validators.maxLength(60), this.passwordConfirmed.bind(this)]),
  });

  constructor(private http: HttpService, private router: Router, private auth: AuthenticationService) {
  }

  ngOnInit() {
    this.profile.setValue({
      username: this.auth.username,
      display_name: this.auth.username,
      password: '',
      confirm_password: ''
    });
  }

  OnSubmit() {
    const mismatch = this.profile.get('confirm_password').value !== this.profile.get('password').value;
    if (mismatch) {
      this.profile.get('confirm_password').setErrors({mismatch: true});
    }
    if (this.profile.valid) {
      this.http.post('users/edit', {
        ...this.profile.value,
        id: this.auth.userID,
        is_admin: this.auth.is_admin
      }).subscribe(
        response => {
          // @ts-ignore
          if (response === 'username_taken') {
            alertify.notify('Username is already taken', 'error', 2);

          } else {
            // @ts-ignore
            if (response.updated === 1) {
              alertify.notify('Profile Updated', 'success', 2);

            } else {
              alertify.notify('Error', 'error', 2);
            }
          }
        },
        error => console.log(error)
      );
    }
  }

  passwordConfirmed(confirmedPassword: FormControl) {
    return confirmedPassword.value === '' || confirmedPassword.value === this.profile.get('password').value ?
      null :
      {mismatch: true};
  }

  printErrors(property, errors) {
    let msg = '';
    if (errors.required) {
      msg = `${property} is required`;
    }
    if (errors.maxlength && errors.maxlength.requiredLength < errors.maxlength.actualLength) {
      msg = `${property} must be <= ${errors.maxlength.requiredLength} character`;
    }
    if (errors.mismatch) {
      msg = `password doesn't match`;
    }
    return msg;
  }

}
