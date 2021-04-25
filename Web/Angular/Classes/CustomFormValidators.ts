import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomFormValidators {

  static lengthRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) return null;
      const inRange = control.value.length >= min && control.value.length <=max;
      return inRange ? null : {
        range: `Value length is not in range of [${min} - ${max}]`
      };
    };
  }

  static numRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) return null;
      const inRange = control.value >= min && control.value <=max;
      return inRange ? null : {
        range: `Value is not in range of [${min} - ${max}]`
      };
    };
  }

  static _getISODate(date: Date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0]
  }

  static dateRange(fromDate: Date, toDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) return null;
      const date = this._getISODate(new Date(control.value));
      const _fromDate = this._getISODate(fromDate);
      const _toDate = this._getISODate(toDate);
      const inRange = date >= _fromDate && date <= _toDate;
      return inRange ? null : {
        range: `Date value is not in range of [${_fromDate} - ${_toDate}]`
      };
    };
  }

}
