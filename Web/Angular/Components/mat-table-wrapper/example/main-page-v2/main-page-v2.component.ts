import {ActivatedRoute, Router} from '@angular/router';
import {SearchBarService} from '@app/shared-module/providers/search-bar.service';
import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NotificationService} from '@app/shared-module/providers/notification.service';
import {take, takeWhile, tap} from 'rxjs/operators';
import {FilterDataService} from '../providers/filter-data.service';
import {NavbarService} from '@app/shared-module/providers/navbar.service';
import {GroupColumn, TableColumn} from '@app/suivi-collectes-module/mat-table-wrapper/mat-table-wrapper.component';
import {Utils} from '@app/shared-module/providers/Utils';
import {TableOptionsService} from '@app/suivi-collectes-module/providers/table-options.service';
import {AuthenticationService} from '@app/login-module/providers/authentication.service';
import {AppConfigService} from '@app/app-config.service';
import {TrinovConfigurationService} from '@app/admin-module/providers/trinov-configuration.service';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';
import {
    CollectListPreferencesComponent
} from '@app/suivi-collectes-module/collect-list-preferences/collect-list-preferences.component';
import {CalendarCustomService} from '@app/shared-module/providers/calendar-custom.service';
import {CalendarCustomComponent} from '@app/shared-module/components/calendar-custom/calendar-custom.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page-v2.component.html',
    styleUrls: ['./main-page-v2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MainPageV2Component implements OnInit, OnDestroy {
    searchBarPlaceholder: string;
    isCalendar = false;
    private isDestroyed = false;
    customColumns: any = {
        generatedDocumentName: {
            cellStyles: 'font-weight: 700'
        },
        datePrestation: {
            getValue: (data) => this.utils.getDateFormated(new Date(data['datePrestation']))
        },
        dechet: {
            width: '25%'
        },
        centreTraitement: {
            width: '15%'
        },
        nombreColis: {
            width: '5%'
        },
        poidsEstime: {
            width: '5%',
            position: 'center'
        },
        poidsReel: {
            textColumn: false,
            width: '5%'
        },
        documents: {
            textColumn: false
        },
        actions: {
            textColumn: false
        },
        status: {
            textColumn: false,
            width: '0.1%'
        }
    };
    additionalColumns = [
        {
            columnName: 'PRESTATIONS.SUIVI.ACTIONS',
            columnValue: 'status',
            order: 0
        },
        {
            columnName: 'PRESTATIONS.SUIVI.DOCUMENTS',
            columnValue: 'documents'
        },
        {
            columnName: 'PRESTATIONS.SUIVI.ACTIONS',
            columnValue: 'actions'
        }
    ];
    groups = [
        {
            label: 'PRESTATIONS.SUIVI.NO_GROUP_BY',
            columnDef: '',
            groupingFn: null
        },
        {
            label: 'PRESTATIONS.SUIVI.DATE',
            columnDef: 'datePrestation',
            groupingFn: (data, groupData) => this.utils.getDateFormated(new Date(data['datePrestation']))
        },
        {
            label: 'PRESTATIONS.SUIVI.WASTE',
            columnDef: 'dechet',
            groupingFn: (data, groupData) => data['dechet']
        },
        {
            label: 'PRESTATIONS.SUIVI.MATERIAL',
            columnDef: 'materiel',
            groupingFn: (data, groupData) => data['materiel']
        }
    ];
    statuses = {
        TOUTES: {
            label: 'PRESTATIONS.SUIVI.STATUSES.TOUTES',
            route: 'toutes-les-collectes',
            status: 'TOUTES',
            columns: [],
            preferences: {
                columnsOrder: [],
                hiddenColumns: new Set<string>(),
                groupBy: '',
                statusColor: ''
            }
        },
        PLANNIFIEE: {
            label: 'PRESTATIONS.SUIVI.STATUSES.PLANNIFIEE',
            route: 'collectes-planifiees',
            status: 'PLANNIFIEE',
            columns: [],
            preferences: {
                columnsOrder: [],
                hiddenColumns: new Set<string>(),
                groupBy: '',
                statusColor: ''
            }
        },
        COLLECTE: {
            label: 'PRESTATIONS.SUIVI.STATUSES.COLLECTE',
            route: 'collectes-realisees',
            status: 'COLLECTE',
            columns: [],
            preferences: {
                columnsOrder: [],
                hiddenColumns: new Set<string>(),
                groupBy: '',
                statusColor: ''
            }
        },
        VALIDATION: {
            label: 'PRESTATIONS.SUIVI.STATUSES.VALIDATION',
            route: 'collectes-cloturees',
            status: 'VALIDATION',
            columns: [],
            preferences: {
                columnsOrder: [],
                hiddenColumns: new Set<string>(),
                groupBy: '',
                statusColor: ''
            }
        }
    };
    status = this.statuses['TOUTES'];
    config: any;
    originalUserPreferences; // keep a copy of the original preferences (for detecting preferences changes)
    userPreferences;
    columnsChange: boolean;
    groupChange: boolean;

    @ViewChild('calendar') calendar: CalendarCustomComponent;

    constructor(
        private readonly translate: TranslateService,
        private readonly notificationService: NotificationService,
        public readonly searchService: SearchBarService,
        public readonly filterService: FilterDataService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private authService: AuthenticationService,
        private appConfigService: AppConfigService,
        private searchBarService: SearchBarService,
        private navbarService: NavbarService,
        private tableOptionsService: TableOptionsService,
        private utils: Utils,
        private trinovConfig: TrinovConfigurationService,
        private dialog: MatDialog,
        private calendarCustomService: CalendarCustomService
    ) {
    }

    ngOnInit() {
        this.navbarService.setHidden(true);
        this.notificationService.clearLastNotification();
        this.notificationService.showNotification(
            { message: 'NOTIFICATION.INFO_SCHEDULE_COLLECT', type: 'info' }
        );
        this.searchService.setSearchQuery('');
        this.translate.get('PRESTATIONS.PLACEHOLDER').pipe(
            take(1),
            tap(res => this.searchBarPlaceholder = res)
        ).subscribe();

        this.route.queryParamMap.pipe(
            takeWhile(() => !this.isDestroyed),
            tap((paramsAsMap: any) => {
                if (paramsAsMap.params?.isCalendar) {
                    this.isCalendar = true;
                }
                if (paramsAsMap.params?.query) {
                    this.searchBarService.setSearchQuery(paramsAsMap.params?.query);
                }
            })
        ).subscribe();

        this.config = this.appConfigService.getConfiguration();
        this.trinovConfig.getUserPreferences().pipe(
            tap(preferences => {
                this.originalUserPreferences = this.config['userPreferences'];
                this.userPreferences = Utils.deepCopy(this.originalUserPreferences);
                this.updateStatus(this.statuses[this.userPreferences['tabsOrder'][0]], false);
                this.isCalendar = this.userPreferences['mode'] === 'CALENDAR';
                if (this.isCalendar) {
                    this.updateDisplay();
                }
                // this.calendar.onChangeCalendar(this.userPreferences['defaultPeriod']);
            })
        ).subscribe();

        // this.calendarCustomService.startEndDateObs$.pipe(
        //     tap(type => {
        //         console.log(type);
        //         // this.originalUserPreferences['defaultPeriod'] = type;
        //         // this.userPreferences['defaultPeriod'] = type;
        //     })
        // ).subscribe();
    }

    ngOnDestroy() {
        this.navbarService.setHidden(false);
    }

    getStatuses() {
        if (this.userPreferences) {
            return this.userPreferences.tabsOrder.map(status => this.statuses[status]);
        }
        else {
            return Object.values(this.statuses);
        }
    }

    updateTableOptions() {
        const groupingColumn = this.status.preferences.groupBy;
        const displayedColumns = this.getDisplayedColumns();
        const actionCols = this.additionalColumns.map(c => c.columnValue);
        this.tableOptionsService.setValues({
            columns: displayedColumns,
            groupColumns: groupingColumn ? [
                new GroupColumn({
                    name: groupingColumn,
                    labelFn: this.groups.find(g => g.columnDef === groupingColumn).groupingFn,
                    colspan: displayedColumns.filter(c => !actionCols.includes(c.columnDef)).length - 1,
                    groupBy: true
                }),
                new GroupColumn({
                    name: 'poidsReel',
                    labelFn: (data, groupData) => groupData.reduce((acc, d) => acc + d.poidsReel, 0),
                    colspan: 1,
                    groupBy: false,
                    position: 'center'
                })
            ] : []
        });
    }

    getDisplayedColumns() {
        const displayedColumns: TableColumn[] = [];
        for (let col of this.status.columns) {
            if (!this.status.preferences.hiddenColumns.has(col.columnValue)) {
                const customColumn = this.customColumns[col.columnValue] || {};
                let c: TableColumn = new TableColumn({
                    label: col.columnName,
                    columnDef: col.columnValue,
                    ...customColumn, // add all custom properties
                    // check textColumn field, otherwise put true
                    textColumn: customColumn.textColumn ?? true
                });
                displayedColumns.push(c);
            }
        }
        return displayedColumns;
    }

    updateTableColumns(column) {
        this.status.preferences.hiddenColumns.has(column.columnValue) ?
            this.status.preferences.hiddenColumns.delete(column.columnValue) :
            this.status.preferences.hiddenColumns.add(column.columnValue);
        this.detectIfColumnsHaveChanged();
        this.updateTableOptions();
    }

    updateTableGrouping(group) {
        this.status.preferences.groupBy = group.columnDef;
        this.detectIfGroupHasChanged();
        this.updateTableOptions();
    }

    detectIfGroupHasChanged() {
        const status = this.status.status;
        this.groupChange = this.status.preferences.groupBy !== this.originalUserPreferences[status].groupBy;
    }

    updateStatus(status: any, savePreviousState = true) {
        if (savePreviousState) {
            this.savePreviousChanges();
        }
        this.setStatus(status);
        this.setStatusPreferences(this.userPreferences[status.status]);
        this.setStatusColumnsOrder();
        this.detectIfColumnsHaveChanged();
        this.updateTableOptions();
        this.router.navigate([`/suivi/collectes/${status.route}`]);
    }

    setStatus(status) {
        this.status = status;
        const columns: any[] = this.config[status.status].tableView;
        this.additionalColumns.forEach(col => {
            if (col.order != undefined) {
                columns.splice(col.order, 0, col);
            }
            else {
                columns.push(col);
            }
        });
        this.status.columns = columns;
    }

    setStatusPreferences(statusPreferences) {
        this.status.preferences = {
            ...statusPreferences,
            hiddenColumns: new Set<string>(statusPreferences.hiddenColumns)
        };
    }

    setStatusColumnsOrder() {
        if (this.status.preferences.columnsOrder.length === 0) {
            this.status.preferences.columnsOrder = this.status.columns.map((c, i) => i);
        }
        else {
            const temp = [];
            for (let index of this.status.preferences.columnsOrder) {
                temp.push(this.status.columns[index]);
            }
            this.status.columns = temp;
        }
    }

    detectIfColumnsHaveChanged() {
        const status = this.status.status;
        const originalHiddenColumns = this.originalUserPreferences[status].hiddenColumns;
        const currentHiddenColumns: Set<string> = this.status.preferences.hiddenColumns;
        if (originalHiddenColumns.length !== currentHiddenColumns.size) {
            this.columnsChange = true;
        }
        else {
            for (let value of originalHiddenColumns) {
                if (!currentHiddenColumns.has(value)) {
                    this.columnsChange = true;
                    break;
                }
            }
            this.columnsChange = false;
        }
    }

    savePreviousChanges() {
        // return set to array type
        this.userPreferences[this.status.status] = {
            ...this.status.preferences,
            hiddenColumns: Array.from(this.status.preferences.hiddenColumns.values())
        };
    }

    updateDisplay() {
        this.router.navigate([`/suivi/collectes/${this.status.route}`], {
            queryParams: this.isCalendar ? { isCalendar: true } : null
        });
    }

    isIntern() {
        // only show button if we are in internal mode and external sites exist
        return this.authService.getCurrentSiteStatus()[0] == 'INTERN'
            && this.appConfigService.getConfiguration().sitesMenu.displaySitesByStatus.includes('EXTERN');
    }

    reorderColumns(event) {
        moveItemInArray(this.status.columns, event.previousIndex, event.currentIndex);
        moveItemInArray(this.status.preferences.columnsOrder, event.previousIndex, event.currentIndex);
        this.updateTableOptions();
    }

    savePreferences(resetColumns) {
        this.savePreviousChanges();
        this.originalUserPreferences = Utils.deepCopy(this.userPreferences); // update the original copy of the
                                                                             // preferences
        resetColumns ? this.columnsChange = false : this.groupChange = false;
        this.trinovConfig.saveUserPreferences(this.userPreferences).subscribe();
    }

    openUserPreferences() {
        const dialog = this.dialog.open(CollectListPreferencesComponent, {
            data: {
                statuses: this.getStatuses(),
                userPreferences: this.userPreferences
            }
        });

        dialog.afterClosed().pipe(
            tap(data => {
                if (data) {
                    this.userPreferences.tabsOrder = data.tabs;
                    this.originalUserPreferences.tabsOrder = data.tabs;
                    data.statusColors.forEach(s => {
                        this.userPreferences[s.status].statusColor = s.color;
                        this.originalUserPreferences[s.status].statusColor = s.color;
                        this.statuses[s.status].preferences.statusColor = s.color;
                    });
                    this.trinovConfig.saveUserPreferences(this.originalUserPreferences).subscribe();
                }
            })
        ).subscribe();
    }
}

