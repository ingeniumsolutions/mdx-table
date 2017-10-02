import { Component, ViewChild, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MdPaginator, } from '@angular/material';
import { TableConfig, BaseEntry, MultiEntry, Action } from './mdx-table.d';
import { Md2DataTable } from 'md2';

@Component({
  selector: 'mdx-table',
  templateUrl: 'mdx-table.component.html',
  styleUrls: ['mdx-table.component.scss'],
  providers: [MdPaginator]
})
export class MdxTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any;
  @Input() config: TableConfig;
  @Input() sortBy: string;
  @Input() enableMargin = true;
  @Input() tableName: string;
  @Input() loading: boolean;

  @Output() add = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();

  @ViewChild('md2') md2: Md2DataTable;

  public activePage = 1;
  public pageSize: number;
  public pageSizes: number[];
  public selected: any[] = [];
  public allSelected = false;
  public searchControl = new FormControl('');
  public entities: any;
  public showLoading: boolean;

  _selectedForMenu: any;
  _loadingTimer: any;
  _searchSubscription: Subscription;

  constructor(private paginator: MdPaginator) {
    this.toggleSelectAllVisible = this.toggleSelectAllVisible.bind(this);

    this.paginator._intl.itemsPerPageLabel = 'Элементов на странице';
    this.paginator._intl.getRangeLabel = (page, pageSize, length) => `${page * pageSize + 1} - ${(page + 1) * pageSize} из ${length}`;
    this.paginator._intl.nextPageLabel = 'Вперед';
    this.paginator._intl.previousPageLabel = 'Назад';
  }

  public length = () => this.data.length;

  public menuActions = () => (<Action[]> this.config.actions || [])
    .concat(this.config.additionalActions || [])
    .filter(a => !a.hideInMenu);

  public checkMenuButtonColumn = (i: number) =>
    i === (this.config.menuButtonColumn ? this.config.menuButtonColumn : this.config.columns.length - 1);
  public checkBool = (b: any) => !!b ? 'check_box' : 'check_box_outline_blank';

  public typeClass = (t: string) => `mdx-cell-${t.toLowerCase()}`;

  public onAdd() {
    this.add.emit();
  }

  public onEdit() {
    this.edit.emit(this.selected[0]);
  }

  public onDelete() {
    this.delete.emit(this.selected);
    this.freeSelected();
  }

  public onAdditionalMenuClick(f: Function) {
    f(this.selected);
    this.freeSelected();
  }

  public onBaseMenuClick(f: Function) {
    f(this.selected);
    this.freeSelected();
  }

  public onContextMenuClick(f: Function) {
    if (this._selectedForMenu) {
      f([this._selectedForMenu]);
    }
    this._selectedForMenu = null;
  }

  public freeSelected() {
    this.selected = [];
    this.allSelected = false;
  }

  public toggleSelectAllVisible() {
    if (this.allSelected) {
      this.selected = [];
      this.allSelected = false;
    } else {
      this.selected = this.md2.data;
      this.allSelected = true;
    }
  }

  public menuClosed() {
    this._selectedForMenu = null;
  }

  public showMenu(entity: any, event: any) {
    event.stopImmediatePropagation();
    this._selectedForMenu = entity;
  }

  ngOnInit() {
    if (this.config.pagination) {
      this.pageSize = this.config.pagination.pageSize || 10;
      this.pageSizes = this.config.pagination.pageSizes || [10, 50, 100];
    }

    this.freeSelected();
    this.updateEtities(this.data);
    this.updateLoadingBar(this.loading);

    this._searchSubscription = this.searchControl.valueChanges.subscribe(x => {
      this.freeSelected();
      this.updateEtities(this.filterData(x));
    });
  }

  ngOnChanges(changes: any) {
    this.freeSelected();
    if (changes.data) {
      this.updateEtities(changes.data.currentValue);
    }

    if (changes.loading) {
      this.updateLoadingBar(changes.loading.currentValue);
    }

    if (changes.config && changes.config.currentValue.pagination) {
      this.pageSize = changes.config.currentValue.pagination.pageSize || 10;
      this.pageSizes = changes.config.currentValue.pagination.pageSizes || [10, 50, 100];
    }
  }

  ngOnDestroy() {
    this._searchSubscription.unsubscribe();
  }

  public isString(item: any) {
    return typeof item === 'string';
  }

  public isSelected(item: any) {
    return this.selected.indexOf(item) > -1;
  }

  public rowClick(item: any, event: any) {
    const primaryAction = (this.config.actions || []).find(a => !!a.primary);
    if (primaryAction) {
      primaryAction.function([item]);
    }
  }

  public toggleRowSelection(item: any, event: any) {
    if (!event.checked) {
      this.selected = this.selected.filter(x => x !== item);
      this.allSelected = this.allSelected && this.selected.length > 0;
    } else {
      this.selected = [...this.selected, item];
    }

    return false;
  }

  public clearSearch() {
    this.searchControl.setValue('');
  }

  public pageChanged(pageEvent: { pageIndex: number, pageSize: number, length: number }) {
    this.activePage = pageEvent.pageIndex + 1;
    this.pageSize = pageEvent.pageSize;

    this.md2.setPage(this.activePage, this.pageSize);
  }

  updateLoadingBar(loading: any): any {
    if (loading) {
      this.showLoading = true;
    } else {
      if (this._loadingTimer) {
        clearTimeout(this._loadingTimer);
      }
      this._loadingTimer = setTimeout(() => {
        this.showLoading = false;
      }, 1000);
    }
  }

  updateEtities(data: any[]) {
    this.entities = data;
  }

  filterData(str: string) {
    const anyF = (x: any, y: any) => x || y;
    const find = (s: string) => s.toLowerCase().indexOf(str.toLowerCase()) > -1;

    if (str.length === 0) {
      return this.data;
    }

    return this.data.filter((row: any) =>
      this.config.columns.map(column => {
        const cell = (row[column.fieldName] || '').toString();
        return (<{ [index: string]: () => boolean[] }> {
          ['BaseEntry']: () => [find(cell)],
          ['ArrayEntry']: () => cell.map((item: any) => find(item)),
          ['MultiEntry']: () => (<MultiEntry> column).inner.map((item: BaseEntry) => cell[item.fieldName] && find(cell[item.fieldName])),
          ['BoolEntry']: () => [false]
        })[column.type]().reduce(anyF, false);
      }).reduce(anyF, false));
  }
}
