import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-bottom-sheet',
    templateUrl: './bottom-sheet.component.html',
    styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent {
    @Input() title: string;
}
