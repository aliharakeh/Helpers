import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GoogleMapsModule} from '@angular/google-maps';
import {MatExpansionModule} from '@angular/material/expansion';
import {RouterModule} from '@angular/router';
import {DatePickerComponent} from '@app/shared/components/date-picker/date-picker.component';
import {SearchComponent} from '@app/shared/components/search/search.component';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {PinchZoomModule} from 'ngx-pinch-zoom';
import {BadgeBtnComponent} from './badge-btn/badge-btn.component';
import {BottomSheetComponent} from './bottom-sheet/bottom-sheet.component';
import {CollectionValidationComponent} from './collection-validation/collection-validation.component';
import {DividerComponent} from './divider/divider.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {LogoHeaderComponent} from './logo-header/logo-header.component';
import {WizardComponent} from './wizard/wizard.component';


@NgModule({
    declarations: [
        LogoHeaderComponent,
        DividerComponent,
        BadgeBtnComponent,
        LoadingSpinnerComponent,
        BottomSheetComponent,
        CollectionValidationComponent,
        WizardComponent,
        SearchComponent,
        DatePickerComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule,
        FormsModule,
        RouterModule,
        MatExpansionModule,
        GoogleMapsModule,
        PinchZoomModule,
        PdfViewerModule
    ],
    exports: [
        LogoHeaderComponent,
        DividerComponent,
        BadgeBtnComponent,
        LoadingSpinnerComponent,
        BottomSheetComponent,
        CollectionValidationComponent,
        WizardComponent,
        SearchComponent,
        DatePickerComponent
    ]
})
export class ComponentsModule {
}
