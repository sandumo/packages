import { NestedObject } from './permissions';
import { QueryFilter, Resource } from './types';

export interface Adapter {
  getSelect(resource: Resource, tree: NestedObject);
  getFilter(filter: QueryFilter);
}
