import {NgModule} from '@angular/core';
import {AutoTextDirDirective} from "./auto-text-dir.directive";


@NgModule({
  declarations: [
    AutoTextDirDirective
  ],
  exports: [
    AutoTextDirDirective
  ]
})
export class DirectivesModule {
}
