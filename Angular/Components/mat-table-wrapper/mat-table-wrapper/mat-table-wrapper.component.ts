import {
    AfterContentInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import {MatColumnDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';

export class TableOptions {
    _columns: TableColumn[] = [];
    _groupColumns: GroupColumn[] = [];
    getStatusColor?: (data) => string = (_) => 'transparent';
    groupSpacing?: string = '16px';

    get columns(): TableColumn[] {
        return this._columns;
    }

    set columns(columns: TableColumn[]) {
        this._updateTableColumnsWidth(columns);
        this._columns = columns;
    }

    get groupColumns(): GroupColumn[] {
        return this._groupColumns;
    }

    set groupColumns(groupColumns: GroupColumn[]) {
        this._updateGroupingColumnsWidth(groupColumns);
        this._groupColumns = groupColumns;
    }

    constructor(options: TableOptions | {}) {
        Object.assign(this, options);
    }

    _updateTableColumnsWidth(columns: TableColumn[]) {
        const { totalWidthTaken, columnsWithoutSpecificWidth } = this._getWidthUsageInfo(columns);
        const availableTableWidth = 100 - totalWidthTaken;
        const autoColumnWidth = (availableTableWidth / columnsWithoutSpecificWidth) + '%';
        columns.forEach(c => {
            if (!c.width) {
                c.width = autoColumnWidth;
            }
        });
    }

    _getWidthUsageInfo(columns: TableColumn[]) {
        let columnsWithoutSpecificWidth = 0;
        const totalWidthTaken = columns.reduce((acc, c) => {
            if (!c.width) {
                columnsWithoutSpecificWidth++;
            }
            return acc + (c.width ? parseInt(c.width.slice(0, -1)) : 0); // remove % and convert to number
        }, 0);
        return {
            totalWidthTaken,
            columnsWithoutSpecificWidth
        };
    }

    _updateGroupingColumnsWidth(groupColumns: GroupColumn[]) {
        let startColIndex = 0;
        let endColIndex = 0;
        for (let groupColumn of groupColumns) {
            endColIndex = startColIndex + groupColumn.colspan;
            groupColumn.width = this._mergeWidths(this._columns.slice(startColIndex, endColIndex));
            startColIndex = endColIndex;
        }
    }

    _mergeWidths(columns: TableColumn[]) {
        return Math.round(
            columns.reduce((acc, c) => {
                return acc + (c.width ? parseFloat(c.width.slice(0, -1)) : 0);
            }, 0)
        ) + '%';
    }
}

export class TableColumn {
    columnDef: string;
    label?: string = '';
    textColumn?: boolean = true;
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
    valueFn?: (data) => string = (data) => data[this.name];
    labelFn?: (data, groupData) => string = (data, _) => data[this.name];
    groupBy?: boolean = true;
    colspan?: number = 1;
    width?: string;
    position?: 'left' | 'center' | 'right' = 'left';

    constructor(options: GroupColumn) {
        Object.assign(this, options);
    }
}

/*
* The Idea of this component is to have a simple & extendable wrapper over cdk-table.
* Features:
*   - group table data by adding a row before each group as a header to the grouped data. This header can be customized
*     through the GroupColumn class properties in the table options.
*   - single & multi select of table data.
*   - column customization through the TableColumn class properties options.
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

    @Input('linesPerRow') set setLinesPerRow(linesPerRow: number) {
        this.elRef.nativeElement.style.setProperty('--cdk-line-clamp', linesPerRow);
    }

    @Input('defaultSelection') set defaultSelection(selection: any[]) {
        this.selection.clear();
        selection.forEach(s => this.selection.select(s));
    }

    @Input('data') set setData(data: any[]) {
        this.data = data;
        if (data) {
            this.buildDataSource();
        }
    }

    @Input('tableOptions') set setTableOptions(tableOptions: TableOptions) {
        this.tableOptions = new TableOptions(tableOptions);
        for (const col of tableOptions.columns) {
            this.displayedColumns.push(col.columnDef);
            if (col.textColumn) this.textColumns.push(col);
        }
        this.groupByColumns = tableOptions.groupColumns.filter(c => c.groupBy);
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
    collapsedGroups = new Set<string>(); // groups that are collapsed
    selection = new SelectionModel<any>(true, []); // selected data
    previousGroupName = '';

    constructor(private elRef: ElementRef) {}

    ngAfterContentInit() {
        this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef)); // add external columns
    }

    buildDataSource() {
        this.dataSource.data = this.groupedData();
        this.elRef.nativeElement.style.setProperty('--cdk-num-of-cols', this.displayedColumns.length);
    }

    groupedData() {
        if (this.groupByColumns.length === 0) return this.data;

        let groups = this.data?.reduce((groups, row) => this._customReducer(groups, row), {});
        let groupArray = groups ? Object.keys(groups).map(key => groups[key]) : [];

        // flatten the data to create one single level array containing the group & data rows
        let flatList = groupArray?.reduce((a, c) => a.concat(c), []);

        // we filter the final data by keeping the grouping rows & the non-collapsed rows
        return flatList?.filter(row => row.isGroup || !this.collapsedGroups.has(this._getGroupName(row)));
    }

    _customReducer(groups, row) {
        const groupName = this._getGroupName(row);
        // add a grouping row as a header for each group of data
        if (!groups[groupName]) {

            // update previous group label
            // if (groupName !== this.previousGroupName) {
            //     groups[this.previousGroupName][0].groupLabel = this._getGroupLabel(groups[this.previousGroupName][0]);
            // }
            //
            // this.previousGroupName = groupName;

            groups[groupName] = [
                {
                    groupName,
                    data: this.tableOptions.groupColumns.reduce((acc, c) => {
                        return {
                            ...acc,
                            [c.name]: row[c.name]
                        };
                    }, {}),
                    groupLabel: '',
                    groupData: [],
                    isReduced: this.collapsedGroups.has(groupName),
                    isGroup: true
                }
            ];
        }
        const rowData = {
            ...row,
            __rowStatusColor__: this.tableOptions.getStatusColor(row)
        };
        // add the data to the group
        groups[groupName].push(rowData);
        // leave a pointer to all group row data inside the group row
        groups[groupName][0].groupData.push(rowData);
        return groups;
    };

    _getGroupName(data) {
        return this.groupByColumns.reduce((acc, c, i) => acc + (i > 0 ? '_' : '') + c.valueFn(data), '');
    }

    // _getGroupLabel(group: any[]) {
    //     return this.groupByColumns.reduce((acc, c, i) => acc + (i > 0 ? '_' : '') + c.valueFn(data), '');
    // }

    get groupColumns() {
        return this.tableOptions.groupColumns.map(c => `__${c.name}__`);
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
            this.selection.clear();
            this.data?.forEach(row => this.selection.select(row));
            this.collapsedGroups.clear();
            this.buildDataSource();
        }
        this.emitSelection();
    }

    toggleRowSelection(value) {
        this.selection.toggle(value);
        this.emitSelection();
    }

    emitSelection() {
        if (this.withSelection) {
            this.selectionChange.emit(this.selection.selected);
        }
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numNonGroupRows = this.data?.length;
        return numSelected === numNonGroupRows;
    }

    rowAction(data: any) {
        this.rowClick.emit(data);
    }
}
