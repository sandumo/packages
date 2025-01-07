import { Language, Query, QueryFilter, Resource, Schema } from './types';
import { cast } from './utils';

export class FilterProcessor {
  private schema: Schema;
  private language: Language;
  private query: Query;

  /**
   * Cast filter base on the given model
   * @param filter - The filter to cast
   * @param model - The model to cast the filter to
   * @returns The casted filter
   */
  castFilter(filter: QueryFilter, model: Resource) {
    if (!filter) {
      return {};
    }

    if ('or' in filter) {
      return {
        or: filter.or.map((f) => this.castFilter(f, model)),
      };
    }

    if ('and' in filter) {
      return {
        and: filter.and.map((f) => this.castFilter(f, model)),
      };
    }

    return {
      ...filter,
      value: cast(filter.value, model.fields[filter.field].type),
    };
  }
}
