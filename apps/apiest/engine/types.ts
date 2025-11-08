// export
export enum FIELD_TYPE {
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  STRING = 'string',
  DATE = 'date',
  DATETIME = 'datetime',
  FILE = 'file',
  REF = 'ref',
}

// export type FieldType = (typeof DataType)[keyof typeof DataType];

export type FieldType =
  | 'integer'
  | 'float'
  | 'boolean'
  | 'string'
  | 'date'
  | 'datetime'
  | 'file'
  | 'ref';

export const dataTypes = [
  'integer',
  'float',
  'boolean',
  'string',
  'date',
  'datetime',
  'file',
];

export type FieldReference = {
  resource: string;
  field?: string;
};

export type Field = {
  name: string;
  type: FieldType;
  primaryKey: boolean;
  nullable: boolean;
  iterable: boolean;
  filterable: boolean;
  sortable: boolean;
  searchable: boolean;
  translatable: boolean;
  identifiable: boolean;
  unique: boolean;
  defaultValue?: any;
  ref?: FieldReference;
};

export type Resource = {
  name: string;
  conditions?: Record<string, QueryFilter>;
  naming: {
    camelCase: string;
    camelCasePlural: string;
    pascalCase: string;
    pascalCasePlural: string;
    kebabCase: string;
    kebabCasePlural: string;
  };
  fields: {
    [key: string]: Field;
  };
  primaryKey: string;
  ownable: boolean;
  translatable: boolean;
  hasMultipleIdentifiableFields: boolean;
};

export type Schema = {
  resources: {
    [key: string]: Resource;
  };
  permissions: {
    root: string[];
    owner: string[];
    user: string[];
    guest: string[];
    anyone: string[];
  };
};

type QueryFilterCondition = {
  field: string;
  operator: string;
  value: any;
  or?: undefined;
  and?: undefined;
};

export type QueryFilter =
  | QueryFilterCondition
  | {
      and: QueryFilter[];
    }
  | {
      or: QueryFilter[];
    };

export type QueryInclude = string[];

export type Query = {
  filter?: QueryFilter;
  page?: number;
  pageSize?: number;
  include?: QueryInclude;
};

export type QueryResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
};

export type User = {
  id: number;
  email: string;
  phone: string;
  password: string;
  firstname?: string;
  lastname?: string;
  displayName?: string;
  avatar?: string;
  permissions: Permission[];
  _permissions: string[];
};

export type Language = {
  id: number;
  name: string;
  locale: string;
  fallback: Language | null;
};

export type AccessRule = {
  subject: string;
  action: 'read' | 'write' | 'delete' | 'manage';
  resource: string;
  attributes: string[];
  conditions: string[];
  filter?: QueryFilter;
};

export type Permission = {
  actions: string[];
  excludeActions: boolean;
  resources: string[];
  excludeResources: boolean;
  fields: string[];
  excludeFields: boolean;
  conditions: string[];
  excludeConditions: boolean;
  specials: string[];
};
