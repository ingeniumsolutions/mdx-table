import { Component, ViewChild, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter, HostListener } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl } from "@angular/forms";
import { Md2DataTable } from "md2";

@Component({
  selector: "mdx-table",
  templateUrl: "mdx-table.component.html",
  styleUrls: ["mdx-table.component.scss"],
  providers: []
})
export class MdxTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any;

  _config: any;
  _columns: any;
  @Input() set config(x: any) {
    if (x) {
      this._columns = x.columns;
      this._config = x;
    } else {
      this._config = x;
    };
  };
  @Input() sortBy: string;
  @Input() enableMargin = true;
  @Input() tableName: string;
  @Input() loading: boolean;

  @Output() add = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() changeSize = new EventEmitter();
  @Output() changeOrder = new EventEmitter();

  @ViewChild("md2") md2: Md2DataTable;

  resizingColumn = -1;
  dragColumn = null;
  dragColumnPosition = { x: 0, y: 0 };
  startResizingPosition = { x: 0, y: 0 };
  dragHeaderPosition = { x: 0, y: 0 };
  clientDragPosition = { x: 0, y: 0 };
  @HostListener("document:mouseup", ["$event"])
  mouseUp($event: MouseEvent) {
    if (this.resizingColumn > -1) {
      this.resizingColumn = -1;
      this.onChangeSize();
    };

    if (this.dragColumn !== null) {
      this.dragColumn = null;
      this.dragHeaderPosition = { x: 0, y: 0 };
      this.onChangeOrder();
    };
  }

  @HostListener("document:mousemove", ["$event"])
  mouseMove($event: MouseEvent) {
    if (this.resizingColumn > -1) {
      let translation = $event.x - this.startResizingPosition.x;
      this.updateColumnSize(translation);
    };

    if (this.dragColumn !== null) {
      let translation = { x: $event.x - this.dragColumnPosition.x, y: $event.y - this.dragColumnPosition.y };
      this.dragHeaderPosition = { x: $event.x - this.clientDragPosition.x - 4, y: $event.y - this.clientDragPosition.y - 4 };
      this.checkReorder(translation, $event);
    };
  }

  public activePage = 1;
  public pageSize: number;
  public pageSizes: number[];
  public selected: any[] = [];
  public allSelected = false;
  public searchControl = new FormControl("");
  public entities: any;
  public showLoading: boolean;
  public columnsSizes: number[];
  public columnsSizesBuffer: number[];

  _selectedForMenu: any;
  _loadingTimer: any;
  _searchSubscription: Subscription;

  constructor(
  ) {
    this.toggleSelectAllVisible = this.toggleSelectAllVisible.bind(this);
    /*
        this.paginator._intl.itemsPerPageLabel = "Элементов на странице";
        this.paginator._intl.getRangeLabel = (page, pageSize, length) => `${page * pageSize + 1} - ${(page + 1) * pageSize} из ${length}`;
        this.paginator._intl.nextPageLabel = "Вперед";
        this.paginator._intl.previousPageLabel = "Назад";*/
  }

  public length = () => this.data.length;

  public menuActions = () => (this._config.actions || [])
    .concat(this._config.additionalActions || [])
    .filter((a: any) => !a.hideInMenu);

  public checkMenuButtonColumn = (i: number) =>
    i === (this._config.menuButtonColumn ? this._config.menuButtonColumn : null);
  public checkBool = (b: any) => !!b ? "check_box" : "check_box_outline_blank";

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

  public onSettingsMenuClick(f: Function) {
    f(this.selected);
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

  public resizeDown($event: MouseEvent, index: number) {
    $event.stopPropagation();
    this.resizingColumn = index;
    this.startResizingPosition = { x: $event.x, y: $event.y };
    this.columnsSizesBuffer = this.columnsSizes.map(x => x);
  }

  public dragDown($event: MouseEvent, column: any) {
    $event.stopPropagation();
    this.dragColumn = column;
    this.dragColumnPosition = { x: $event.x, y: $event.y };
    this.clientDragPosition = { x: $event.offsetX, y: $event.offsetY };
    this.dragHeaderPosition = { x: $event.x - this.clientDragPosition.x, y: $event.y - this.clientDragPosition.y };
  }

  public onChangeOrder() {
    this.changeOrder.emit(this._columns.slice());
  }

  public onChangeSize() {
    let columns = this._columns.slice();
    columns.forEach((column: any, index: number) => {
      column.size = this.columnsSizes[index];
    });
    this.changeSize.emit(columns);
  }

  checkReorder(translation: { x: number, y: number }, $event: MouseEvent) {
    let columnIndex = this._columns.findIndex((x: any) => x === this.dragColumn);
    if (columnIndex < this._columns.length && translation.x >= this.columnsSizes[columnIndex + 1] + 26) {
      this.dragColumnPosition = { x: $event.x - translation.x + this.columnsSizes[columnIndex + 1] + 20, y: $event.y };
      this.reorderColumns(columnIndex, columnIndex + 1, $event);
    };

    if (columnIndex > 0 && -translation.x >= this.columnsSizes[columnIndex - 1] + 16) {
      this.dragColumnPosition = { x: $event.x - translation.x - this.columnsSizes[columnIndex - 1] - 20, y: $event.y };
      this.reorderColumns(columnIndex, columnIndex - 1, $event);
    };
  }

  reorderColumns(columnIndex1: number, columnIndex2: number, $event: MouseEvent) {
    let tmpColumn = this._columns[columnIndex1];
    let tmpSize = this.columnsSizes[columnIndex1];

    this._columns[columnIndex1] = this._columns[columnIndex2];
    this._columns[columnIndex2] = tmpColumn;

    this.columnsSizes[columnIndex1] = this.columnsSizes[columnIndex2];
    this.columnsSizes[columnIndex2] = tmpSize;
  }

  ngOnInit() {
    if (this._config && this._config.pagination) {
      this.pageSize = this._config.pagination.pageSize || 10;
      this.pageSizes = this._config.pagination.pageSizes || [10, 50, 100];
    }

    this.columnsSizes = this._columns.map((x: any) => x.size || 100);

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

    if (changes.config && changes.config.currentValue && changes.config.currentValue.pagination) {
      this.pageSize = changes.config.currentValue.pagination.pageSize || 10;
      this.pageSizes = changes.config.currentValue.pagination.pageSizes || [10, 50, 100];
    }
  }

  ngOnDestroy() {
    this._searchSubscription.unsubscribe();
  }

  public isString(item: any) {
    return typeof item === "string";
  }

  public isSelected(item: any) {
    return this.selected.indexOf(item) > -1;
  }

  public rowClick(item: any, event: any) {
    const primaryAction = (this._config.actions || []).find((a: any) => !!a.primary);
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
    this.searchControl.setValue("");
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

  updateColumnSize(translation: number) {
    let newColumnSize = this.columnsSizesBuffer[this.resizingColumn] + translation;
    if (newColumnSize > 50) {
      this.columnsSizes[this.resizingColumn] = newColumnSize;
    };
  }

  filterData(str: string) {
    const anyF = (x: any, y: any) => x || y;
    const find = (s: string) => s.toLowerCase().indexOf(str.toLowerCase()) > -1;

    if (str.length === 0) {
      return this.data;
    }

    return this.data.filter((row: any) =>
      this._columns.map((column: any) => {
        const cell = (row[column.fieldName] || "").toString();
        return (<{ [index: string]: () => boolean[] }> {
          ["BaseEntry"]: () => [find(cell)],
          ["ArrayEntry"]: () => cell.map((item: any) => find(item)),
          ["MultiEntry"]: () => (column).inner.map((item: any) => cell[item.fieldName] && find(cell[item.fieldName])),
          ["BoolEntry"]: () => [false]
        })[column.type]().reduce(anyF, false);
      }).reduce(anyF, false));
  }
}
