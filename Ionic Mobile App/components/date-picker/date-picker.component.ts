import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UtilsService} from '@app/shared/providers/utils/utils.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent {

    @Input() date: Date;
    @Input() minDate: Date;
    @Input() maxDate: Date;
    @Input() readonly = false;
    @Input() cssClasses = 'px-4 py-2';
    @Output() dateChange: EventEmitter<Date> = new EventEmitter();

    public displayFormat = 'DD/MMMM/YYYY';
    public monthNames;

    constructor(public utils: UtilsService, private translate: TranslateService) {
        this.monthNames = translate.instant('DATES.MONTH_NAMES');
    }

    updateDate(event) {
        this.date = new Date(event.detail.value);
        this.dateChange.emit(this.date);
    }
}
