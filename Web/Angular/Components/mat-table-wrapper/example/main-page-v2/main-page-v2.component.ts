import {ActivatedRoute, Router} from '@angular/router';
import {SearchBarService} from '@app/shared-module/providers/search-bar.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NotificationService} from '@app/shared-module/providers/notification.service';
import {map, take, takeWhile, tap} from 'rxjs/operators';
import {FilterDataService} from '../providers/filter-data.service';
import {NavbarService} from '@app/shared-module/providers/navbar.service';
import {
    GroupColumn,
    TableColumn,
    TableOptions
} from '@app/suivi-collectes-module/mat-table-wrapper/mat-table-wrapper.component';
import {Utils} from '@app/shared-module/providers/Utils';
import {PreferencesService} from '@app/suivi-collectes-module/providers/preferences.service';
import {AuthenticationService} from '@app/login-module/providers/authentication.service';
import {AppConfigService} from '@app/app-config.service';
import {TrinovConfigurationService} from '@app/admin-module/providers/trinov-configuration.service';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';
import {
    CollectListPreferencesComponent
} from '@app/suivi-collectes-module/collect-list-preferences/collect-list-preferences.component';
import {cloneDeep} from 'lodash';
import {CalendarCustomService} from '@app/shared-module/providers/calendar-custom.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page-v2.component.html',
    styleUrls: ['./main-page-v2.component.scss']
})
export class MainPageV2Component implements OnInit, OnDestroy {
    searchBarPlaceholder: string;
    customColumns: any = {
        generatedDocumentName: {
            cellStyles: 'font-weight: 700'
        },
        datePrestation: {
            getValue: (data) => this.utils.getDateFormated(data['datePrestation'])
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
        }
    };
    additionalColumns = [
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
            groupingFn: (data, groupData?) => this.utils.getDateFormated(data['datePrestation'])
        },
        {
            label: 'PRESTATIONS.SUIVI.WASTE',
            columnDef: 'dechet',
            groupingFn: (data, groupData?) => data['dechet']
        },
        {
            label: 'PRESTATIONS.SUIVI.MATERIAL',
            columnDef: 'materiel',
            groupingFn: (data, groupData?) => data['materiel']
        }
    ];
    config: any;
    userPreferences: any;
    statuses: any;
    status: any;
    columnsChange = false;
    groupChange = false;
    dateChanged = false;
    isCalendar = false;
    isDestroyed = false;

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
        private preferencesService: PreferencesService,
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
            map(preferences => preferences || this.config['userPreferences']),
            tap(preferences => {
                this.userPreferences = preferences;
                this.statuses = this.getStatuses();
                this.updateStatus(this.statuses[0]);
                this.isCalendar = preferences['mode'] === 'CALENDAR';
                if (this.isCalendar) {
                    this.updateDisplay();
                }
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.navbarService.setHidden(false);
    }

    getStatuses() {
        // get statuses list & add preferences
        let statuses = this.config['stepCollectList'].filter(s => s.status).reduce((statuses, status) => {
            let statusColumns = [...this.config[status.status].tableView, ...this.additionalColumns];
            const preferences = cloneDeep(this.userPreferences[status.status]);
            preferences.hiddenColumns = new Set<string>(preferences.hiddenColumns);
            if (preferences.columnsOrder && preferences.columnsOrder.length) {
                statusColumns = preferences.columnsOrder.map(index => statusColumns[index]);
            }
            else {
                preferences.columnsOrder = statusColumns.map((_, index) => index);
            }
            statuses[status.status] = {
                ...status,
                columns: statusColumns,
                preferences
            };
            return statuses;
        }, {});
        // order statuses according to the preferences
        return this.userPreferences.tabsOrder.map(status => statuses[status]);
    }

    updateStatus(status: any) {
        this.status = status;
        if (status.status) {
            this.detectIfColumnsHaveChanged();
            this.updateTableOptions();
        }
        this.router.navigate([`/suivi/collectes/${status.url}`]);
    }

    detectIfColumnsHaveChanged() {
        const status = this.status.status;
        const originalHiddenColumns = this.userPreferences[status].hiddenColumns;
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

    updateTableOptions() {
        const groupingColumn = this.status.preferences.groupBy;
        const displayedColumns = this.getDisplayedColumns();
        const extraCols = this.additionalColumns.map(c => c.columnValue);
        const statusColors = this.statuses.reduce((colors, status) => {
            colors[status.status] = status.preferences.statusColor;
            return colors;
        }, {});
        this.preferencesService.setValues({
            userPreferences: this.getLocalUserPreferences(),
            statusColors: statusColors,
            tableOptions: new TableOptions({
                columns: displayedColumns,
                groupColumns: groupingColumn ? [
                    new GroupColumn({
                        name: groupingColumn,
                        valueFn: this.groups.find(g => g.columnDef === groupingColumn).groupingFn,
                        labelFn: this.groups.find(g => g.columnDef === groupingColumn).groupingFn,
                        colspan: displayedColumns.filter(c => !extraCols.includes(c.columnDef)).length,
                        groupBy: true
                    }),
                    new GroupColumn({
                        name: 'poidsReel',
                        labelFn: (data, groupData) => groupData.reduce((acc, d) => acc + d.poidsReel, 0),
                        colspan: 1,
                        groupBy: false,
                        position: 'center'
                    })
                ] : [],
                getStatusColor: (data) => statusColors[data.etape]
            })
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

    getLocalUserPreferences() {
        const defaultPreferences = {
            ...this.userPreferences
        };
        return this.statuses.reduce((preferences, status) => {
            preferences[status.status] = status.preferences;
            return preferences;
        }, defaultPreferences);
    }

    updateDisplay() {
        this.router.navigate([`/suivi/collectes/${this.status.url}`], {
            queryParams: this.isCalendar ? { isCalendar: true } : null
        });
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
        this.groupChange = this.status.preferences.groupBy !== this.userPreferences[status].groupBy;
    }

    isIntern() {
        // only show button if we are in internal mode and external sites exist
        return this.authService.getCurrentSiteStatus()[0] == 'INTERN'
            && this.appConfigService.getConfiguration().sitesMenu.displaySitesByStatus.includes('EXTERN');
    }

    reorderColumns(event) {
        const oldColumnsOrder: any[] = [...this.userPreferences[this.status.status].columnsOrder];
        moveItemInArray(this.status.columns, event.previousIndex, event.currentIndex);
        moveItemInArray(this.status.preferences.columnsOrder, event.previousIndex, event.currentIndex);
        this.updateTableOptions();
        this.columnsChange = oldColumnsOrder.reduce((res, order, index) => {
            return res || order !== this.status.preferences.columnsOrder[index];
        }, false);
    }

    savePreferences() {
        this.statuses.forEach(status => {
            this.userPreferences[status.status] = {
                statusColor: status.preferences.statusColor,
                groupBy: status.preferences.groupBy,
                columnsOrder: [...status.preferences.columnsOrder],
                hiddenColumns: [...status.preferences.hiddenColumns.values()]
            };
        });
        this.columnsChange = false;
        this.groupChange = false;
        this.dateChanged = false;
        this.trinovConfig.saveUserPreferences(this.userPreferences).subscribe();
    }

    openUserPreferences() {
        const dialog = this.dialog.open(CollectListPreferencesComponent, {
            data: {
                statuses: cloneDeep(this.statuses),
                isCalendar: this.userPreferences.mode === 'CALENDAR',
                dateMode: this.userPreferences.defaultPeriod
            },
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '100%',
            width: '100%',
            panelClass: 'full-mat-dialog'
        });

        dialog.afterClosed().pipe(
            tap(data => {
                if (data) {
                    this.statuses = data.statuses;
                    const tabs = [];
                    this.statuses.forEach(s => {
                        tabs.push(s.status);
                        this.userPreferences[s.status].statusColor = s.statusColor;
                    });
                    this.userPreferences.tabsOrder = tabs;
                    if (this.userPreferences.defaultPeriod != data.dateMode) {
                        this.calendarCustomService.initialize(null, data.dateMode);
                    }
                    this.userPreferences.defaultPeriod = data.dateMode;
                    this.isCalendar = data.isCalendar;
                    this.userPreferences.mode = data.isCalendar ? 'CALENDAR' : 'LIST';
                    this.updateDisplay();
                    this.updateTableOptions();
                    this.savePreferences();
                }
            })
        ).subscribe();
    }
}

