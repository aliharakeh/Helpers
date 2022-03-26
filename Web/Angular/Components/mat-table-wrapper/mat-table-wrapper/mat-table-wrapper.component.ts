import {
    AfterContentInit,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import {MatColumnDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';

export class TableOptions {
    columns: TableColumn[] = [];
    groupColumns: GroupColumn[] = [];

    constructor(options: TableOptions | {}) {
        Object.assign(this, options);
    }
}

export class TableColumn {
    label: string = '';
    columnDef: string = '-';
    textColumn: boolean = true;
    getValue?: (row) => string;
    headerStyles?: string;
    cellStyles?: string;
    position?: 'left' | 'center' | 'right' = 'left';
    width?: string;

    constructor(options: TableColumn) {
        Object.assign(this, options);
    }
}

export class GroupColumn {
    name: string = '';
    labelFn?: (data, groupData) => string = (data) => data[this.name];
    groupBy: boolean;
    colspan?: number;
    position?: 'left' | 'center' | 'right' = 'left';

    constructor(options: GroupColumn) {
        Object.assign(this, options);
    }
}

/*
* The Idea of this component is to have a simple & extendable wrapper over mat-table.
* Features:
*   - group table data by adding a row before each group as a header to the grouped data. This header can be customized
*     through the `groupColumns` property in the table options.
*   - single & multi select of table data.
*   - column customization through the table options.
*   - custom external columns added through `ng-content` to customize any non-text column that needs to be added
*     to the table.
* Note: for simplicity, this component doesn't include any complex conditional logic on columns or rows as this can
* be done through the table configuration from outside the component.
* */
@Component({
    selector: 'app-mat-table-wrapper',
    templateUrl: './mat-table-wrapper.component.html',
    styleUrls: ['./mat-table-wrapper.component.scss']
})
export class MatTableWrapperComponent<T> implements AfterContentInit {

    @ViewChild(MatTable, { static: true }) table: MatTable<T>; // table
    @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>; // custom external table columns

    @Input() withSelection: boolean = false;

    @Input('defaultSelection') set defaultSelection(selection: any[]) {
        selection.forEach(s => this.selection.toggle(s));
    };

    @Input('data') set setData(data: any[]) {
        this.data = data;
        if (data) {
            this.buildDataSource();
        }
    }

    @Input('tableOptions') set setTableOptions(tableOptions: TableOptions) {
        this.tableOptions = new TableOptions(tableOptions);
        this.textColumns = tableOptions.columns.filter(c => c.textColumn);
        this.displayedColumns = tableOptions.columns.map(c => c.columnDef);
        this.groupByColumns = tableOptions.groupColumns.filter(c => c.groupBy);
        this.availableTableWidth = 100;
        this.columnsWithoutSpecificWidth = 0;
        this.availableTableWidth -= tableOptions.columns.reduce((acc, c) => {
            if (!c.width) {
                this.columnsWithoutSpecificWidth++;
            }
            return acc + (c.width ? parseInt(c.width.slice(0, -1)) : 0);
        }, 0);
        this.buildDataSource();
    }

    @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

    @Output('selection') selectionChange: EventEmitter<any> = new EventEmitter<any>();

    data = []; // source data
    dataSource = new MatTableDataSource([]); // displayed table data
    tableOptions: TableOptions = new TableOptions({}); // table options
    textColumns: TableColumn[] = []; // columns that only include text (non-custom columns)
    displayedColumns: string[] = []; // displayed table columns & their order
    groupByColumns: GroupColumn[] = []; // columns responsible for the data grouping
    availableTableWidth = 100; // available width for columns without specific width
    columnsWithoutSpecificWidth = 0; // columns without specific width count
    collapsedGroups = new Set<string>(); // groups that are collapsed
    selection = new SelectionModel<any>(true, []); // selected data

    ngAfterContentInit() {
        this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef)); // add external columns
    }

    buildDataSource() {
        this.dataSource.data = this.groupedData();
    }

    groupedData() {
        if (this.groupByColumns.length === 0) return this.data;

        const customReducer = (groups, row) => {
            let groupName = this.getGroupName(row);

            // add a grouping row as a header for each group of data
            if (!groups[groupName]) {
                groups[groupName] = [{
                    groupName,
                    data: this.tableOptions.groupColumns.reduce((acc, c) => {
                        return {
                            ...acc,
                            [c.name]: row[c.name]
                        };
                    }, {}),
                    groupData: [],
                    isReduced: this.collapsedGroups.has(groupName),
                    isGroup: true
                }];
            }
            // add the data to the group
            groups[groupName].push(row);
            groups[groupName][0].groupData.push(row);
            return groups;
        };

        let groups = this.data.reduce(customReducer, {});
        let groupArray = Object.keys(groups).map(key => groups[key]);

        // flatten the data to create one single level array containing the group & data rows
        let flatList = groupArray.reduce((a, c) => a.concat(c), []);

        // we filter the final data by keeping the grouping rows & the non-collapsed rows
        return flatList.filter(row => row.isGroup || !this.collapsedGroups.has(this.getGroupName(row)));
    }

    getGroupName(data) {
        return this.groupByColumns.reduce((acc, c, i) => acc + (i > 0 ? '_' : '') + data[c.name], '');
    }

    get groupColumns() {
        return this.tableOptions.groupColumns.map(c => `__${c.name}__`).concat('__icon__');
    }

    isGroup(index, item): boolean {
        return item.isGroup;
    }

    toggleGroup(group) {
        this.collapsedGroups.has(group.groupName) ?
            this.collapsedGroups.delete(group.groupName) :
            this.collapsedGroups.add(group.groupName);
        this.buildDataSource();
    }

    toggleAllRowsSelection() {
        if (this.isAllSelected()) {
            this.selection.clear();
        }
        else {
            // expand all rows first
            this.collapsedGroups.clear();
            this.buildDataSource();

            // select all non group rows
            this.dataSource.data.forEach(row => !row.isGroup && this.selection.select(row));
        }
        if (this.withSelection) {
            this.selectionChange.emit(this.selection.selected);
        }
    }

    toggleRowSelection(row) {
        this.selection.toggle(row);
        if (this.withSelection) {
            this.selectionChange.emit(this.selection.selected);
        }
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numNonGroupRows = this.data.length;
        return numSelected == numNonGroupRows;
    }

    getWidth(col: TableColumn) {
        return col.width || (this.availableTableWidth / this.columnsWithoutSpecificWidth) + '%';
    }

    rowAction(data: any) {
        this.rowClick.emit(data);
    }
}
