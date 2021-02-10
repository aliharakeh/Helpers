import { NgModule } from '@angular/core';
import {ComponentsModule} from "./components/components.module";
import {DirectivesModule} from "./directives/directives.module";


@NgModule({
  exports: [
    DirectivesModule,
    ComponentsModule,
  ]
})
export class SharedModule { }
