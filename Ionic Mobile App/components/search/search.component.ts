import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent {
    @Input() placeholder;
    @Output() search: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('input') input;

    onSearch(ev) {
        this.search.emit(ev.target.value);
    }

    clear() {
        this.input.value = '';
    }
}

