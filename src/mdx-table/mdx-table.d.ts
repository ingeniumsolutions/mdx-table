export type EntryTypes = "BaseEntry" | "MultiEntry" | "ArrayEntry" | "ImageEntry" | "BoolEntry";

interface IEntry {
  name: string;
  fieldName: string;
  type: EntryTypes;
  style?: Object;
  noSort?: boolean;
}

export interface BaseEntry extends IEntry {
  type: "BaseEntry";
};

export interface MultiEntry extends IEntry {
  type: "MultiEntry";
  inner: { fieldName: string, style?: Object }[];
};

export interface ArrayEntry extends IEntry {
  type: "ArrayEntry";
};

export interface ImageEntry extends IEntry {
  type: "ImageEntry";
};

export interface BoolEntry extends IEntry {
  type: "BoolEntry";
};

type ColumnConfig = BaseEntry | MultiEntry | ArrayEntry | ImageEntry | BoolEntry;
export type Action = {
  name: string;
  function: Function;
  disabled?: Function;
  hideInMenu?: boolean;
}
export type MainAction = Action &
  {
    icon: string;
    primary?: boolean;
  }
export type TableConfig = {
  columns: ColumnConfig[];
  menuButtonColumn?: number;
  pagination?: {
    pageSizes: number[],
    pageSize: number
  },
  actions?: MainAction[];
  additionalActions?: Action[];
}
