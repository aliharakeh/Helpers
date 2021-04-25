import { ControlValueAccessor } from '@angular/forms';

export class BaseFormAccessor implements ControlValueAccessor {

  // basic form control properties
  touched = false;
  disabled = false;
  reportValueChange = (_: any) => {};
  reportControlTouch = () => {};

  setFormControlValue(value) {
    // implemented by inheritance class so that we can use the @Input data or any other data
  }

  // this method is called by the Forms module to write a value into a form control
  writeValue(controlValue: any): void {
    this.setFormControlValue(controlValue);
  }

  // Registers a callback function that is called when the control's value changes in the UI.
  // reportValueChange(value) will be used in the custom component to report to the parent form that the
  // control value has been changed
  registerOnChange(formAPI_OnChange: any): void {
    this.reportValueChange = formAPI_OnChange;
  }

  // Registers a callback function that is called by the forms API on initialization to update the form model on blur.
  // reportControlTouch() will be used in the custom component to report to the parent form that the control
  // has been touched
  registerOnTouched(formAPI_OnTouched: any): void {
    this.reportControlTouch = formAPI_OnTouched;
  }

  // Function that is called by the forms API when the control status changes to or from 'DISABLED'.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // an extra function to manually set the form control as touched
  markAsTouched() {
    if (!this.touched) {
      this.reportControlTouch();
      this.touched = true;
    }
  }
}
