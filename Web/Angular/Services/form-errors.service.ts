import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FormErrorsService {

  constructor(private translateService: TranslateService) {}

  translatedErrorMessage(errors) {
    if (!errors) return '';

    switch (true) {
      case 'required' in errors:
        return this.translateService.instant('Global.FormErrors.Required');
      case 'pattern' in errors:
        return this.translateService.instant('Global.FormErrors.Pattern');
      case 'minlength' in errors:
        return this.translateService.instant('Global.FormErrors.MinLength');
      case 'maxlength' in errors:
        return this.translateService.instant('Global.FormErrors.MaxLength');
      default:
        return this.translateService.instant('Global.FormErrors.Default');
    }
  }

  controlHasErrors(formControl: AbstractControl, errorKeys) {
    const invalid = formControl.invalid && (formControl.dirty || formControl.touched);
    const errors = formControl.errors;
    if (!invalid || !errors) return false;
    return !!Object.keys(errors).filter(err => errorKeys.includes(err));
  }

  allErrors(form: FormGroup) {
    const errors = {};
    Object.entries(form.controls).map(([field, control]) => {
      if (control.errors)
        errors[field] = control.errors;
    });
    return errors;
  }

  validateFormManually(form: FormGroup) {
    const formErrors = Object.keys(this.allErrors(form));
    formErrors.forEach(field => form.get(field).markAsTouched({ onlySelf: true }));
  }
}
