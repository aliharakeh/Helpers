import {Directive, ElementRef, Input} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

/*
  This directive is used to auto detect the current app language and apply the appropriate <dir> text direction html
  attribute value on the provided element where this directive was used on. In this app, the <dir> attribute in the
  <app-nav-menu> component is controlling all of its children text direction (i.e: all component, as it is the root of
  everything in this app) so this directive will not be needed unless there is something very specific that isn't
  affected by the root component.
*/

@Directive({
  selector: '[appAutoTextDir]'
})
export class AutoTextDirDirective {
  @Input('appAutoTextDir') mode: 'normal' | 'reverse' = 'normal';

  constructor(private el: ElementRef, private translate: TranslateService) {
    const [rtl, ltr] = this.mode === 'normal' ? ['rtl', 'ltr'] : ['ltr', 'rtl'];
    el.nativeElement.dir = translate.currentLang === 'ar' ? rtl : ltr;
  }
}
