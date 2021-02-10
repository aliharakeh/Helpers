import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppMaterialModule} from '../../app-material.module';
import {LanguageSelectComponent} from './language-select/language-select.component';

@NgModule({
  declarations: [
    LanguageSelectComponent
  ],
  imports: [
    CommonModule,
    AppMaterialModule
  ],
  exports: [
    LanguageSelectComponent
  ]
})
export class ComponentsModule {
}
