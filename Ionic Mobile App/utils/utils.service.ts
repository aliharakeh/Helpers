import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {endOfMonth} from 'date-fns';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    // readonly data
    public readonly MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    public readonly visualDateFormat = 'dd/MM/yyyy';
    private readonly DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(private datePipe: DatePipe) {
    }

    getFormattedDate(date: Date): string {
        return date ? this.datePipe.transform(
            new Date(date), this.visualDateFormat
        ) : '';
    }

    getMonthStartEndDates(monthIndex: number) {
        let year = new Date().getFullYear();
        let startDate = new Date(year, monthIndex, 1);
        return [startDate, endOfMonth(startDate)];
    }

    groupDataByDays(data: any[], dateKey: string) {
        // group by date
        const groups = data.reduce((groups, item) => {
            const timestamp = parseInt(item[dateKey], 10);
            const date = new Date(timestamp);
            const groupName = this.dateGroupKey(date);
            groups[groupName] = (groups[groupName] || []).concat(item);
            return groups;
        }, {});

        // sort & update the groups
        Object.entries(groups).forEach(([groupName, _]) => {
            groups[groupName].sort(
                (a, b) => parseInt(a[dateKey], 10) - parseInt(b[dateKey], 10)
            );
        });

        return groups;
    }

    dateGroupKey(date: Date) {
        return this.MONTH_NAMES[date.getMonth()] + '_' + this.DAY_NAMES[date.getDay()] + '_' + date.getDate();
    }

    deepCopy(obj): any {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) {
            return obj;
        }

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length;
                 i < len;
                 i++) {
                copy[i] = this.deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in
                obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = this.deepCopy(obj[attr]);
                }
            }
            return copy;
        }

        return null;
    }

    base64ToBlob(base64Data, contentType) {
        contentType = contentType || '';
        let sliceSize = 512;
        let byteCharacters = atob(base64Data);
        let byteArrays = [];
        for (let offset = 0;
             offset < byteCharacters.length;
             offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0;
                 i < slice.length;
                 i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    getValueFromComplexKey(obj, key) {
        return key.split('.').reduce((res, field) => {
            if (!res) {
                return '';
            }
            const index = parseInt(field);
            if (!isNaN(index)) {
                return res ? res[index] : null;
            }
            return res[field];
        }, obj);
    }

    getFileReader(): FileReader {
        const fileReader = new FileReader();
        const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
        return zoneOriginalInstance || fileReader;
    }
}
