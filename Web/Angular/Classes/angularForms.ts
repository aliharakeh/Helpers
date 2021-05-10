import { AbstractControlOptions, AsyncValidatorFn, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

export interface IAngularArrayFormControl {
  0: any;
  1?: string | (string | Function)[];
}

export interface IAngularObjectFormControl {
  initialState: any;
  validators?: string | (string | ValidatorFn)[];
}

export interface IAngularFormControls {
  [key: string]: IAngularArrayFormControl | IAngularObjectFormControl;
}

export interface IAngularFormValidators {
  [validatorName: string]: {
    validator: Function;
    parseBy: Function;
  }
}

export class AngularFormValidators {
  private static readonly VALIDATORS_DICTIONARY: IAngularFormValidators = {
    required: {
      validator: Validators.required,
      parseBy: null
    },
    requiredTrue: {
      validator: Validators.requiredTrue,
      parseBy: null
    },
    maxLength: {
      validator: Validators.maxLength,
      parseBy: parseInt
    },
    minLength: {
      validator: Validators.minLength,
      parseBy: parseInt
    },
    max: {
      validator: Validators.max,
      parseBy: parseInt
    },
    min: {
      validator: Validators.min,
      parseBy: parseInt
    },
    pattern: {
      validator: Validators.pattern,
      parseBy: null
    },
    email: {
      validator: Validators.email,
      parseBy: null
    }
  };

  static parseValidators(validators: string | any[]) {
    let parsedValidators = [];
    if (typeof validators === 'string') {
      validators = validators.split('|');
    }
    // iterate validators
    for (let validator of validators) {
      if (typeof validator === 'string')
        parsedValidators.push(this.parseValidator(validator));
      else
        parsedValidators.push(validator);
    }
    return parsedValidators;
  }

  static parseValidator(validator: string) {
    if (validator.includes(':')) {
      let validatorData = validator.split(':');
      let validatorName = validatorData[0].trim();
      let validatorParams = validatorData[1].split(',');
      // validators functions
      let validatorFunction = this.VALIDATORS_DICTIONARY[validatorName].validator;
      let validatorParamsParse = this.VALIDATORS_DICTIONARY[validatorName].parseBy;
      // apply validator with its parameters and push it the the validators list
      return validatorFunction(...validatorParams.map(
        param => validatorParamsParse ? validatorParamsParse(param.trim()) : param.trim()
      ));
    }
    return this.VALIDATORS_DICTIONARY[validator.trim()].validator;
  }

}

export class AngularFormControl extends FormControl {
  constructor(angularFormControl: IAngularArrayFormControl | IAngularObjectFormControl) {
    const initialState = 'initialState' in angularFormControl ? angularFormControl.initialState : angularFormControl[0];
    const validators = 'validators' in angularFormControl ? angularFormControl.validators : angularFormControl[1];
    super(initialState, AngularFormValidators.parseValidators(validators || [])
    );
  }

  hasErrors(errorKeys?: string[]): string[] {
    const invalid = this.invalid && (this.dirty || this.touched);
    const errors = this.errors ? Object.keys(this.errors) : null;
    if (!invalid || !errors) return [];
    if (!errorKeys && errors) return errors;
    return Object.keys(errors).filter(err => errorKeys.includes(err));
  }

  getErrors() {
    return this.errors ? [] : Object.entries(this.errors).map((error, message) => ({ error, message }));
  }

}

export class AngularForm extends FormGroup {

  constructor(
    controls: IAngularFormControls,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(
      Object.entries(controls).reduce((acc, [controlName, angularFormControl]) => {
        return {
          ...acc,
          [controlName]: new AngularFormControl(angularFormControl)
        };
      }, {}),
      validatorOrOpts,
      asyncValidator
    );
  }

  get(controlName: string): AngularFormControl {
    return super.get(controlName) as AngularFormControl;
  }

  get allErrors(): any {
    const errors = {};
    Object.entries(this.controls).map(([field, control]) => {
      if (control.errors)
        errors[field] = control.errors;
    });
    return errors;
  }

  validateFormManually(): void {
    const formErrors = Object.keys(this.allErrors());
    formErrors.forEach(field => this.get(field).markAsTouched({ onlySelf: true }));
  }
}
