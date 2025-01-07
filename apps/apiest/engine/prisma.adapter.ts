import { NestedObject } from './permissions';
import { Tree } from './tree';
import { Language, Query, QueryFilter, Resource, Schema } from './types';

export class PrismaAdapter {
  private schema: Schema;
  private language: Language;
  private query: Query;

  // private client: PrismaClient;

  constructor(
    schema: Schema,
    language: Language,
    query: Query,
    // client: PrismaClient,
  ) {
    this.schema = schema;
    this.language = language;
    this.query = query;
    // this.client = client;
  }

  // static create(schema: Schema, language: Language, query: Query) {
  //   return new PrismaAdapter(schema, language, query);
  // }

  getSelect(resource: Resource, tree: NestedObject) {
    if (!tree || Object.keys(tree).length === 0) {
      return {};
    }

    if (resource.ownable) {
      return this.getSelectRecursive(
        resource.name,
        Tree.merge(tree, { owner: { id: true } }),
      );
    }

    return this.getSelectRecursive(resource.name, tree);
  }

  /**
   * Preprocess the query to include only allowed attributes + translations if needed
   */
  private getSelectRecursive(resourceName: string, tree: NestedObject) {
    if (!tree || Object.keys(tree).length === 0) {
      return {};
    }

    const resource = this.schema.resources[resourceName];

    let translations = {};

    if (resource.translatable) {
      translations = {
        translations: {
          select: {
            languageId: true,
            ...Object.keys(tree || {})
              .filter((attr) => resource.fields[attr].translatable)
              .reduce(
                (acc, attr) => ({
                  ...acc,
                  [attr]: true,
                }),
                {},
              ),
          },
          where: {
            OR: [
              { languageId: this.language.id },
              ...(this.language.fallback
                ? [
                    { languageId: this.language.fallback.id },
                    ...(this.language.fallback.fallback
                      ? [{ languageId: this.language.fallback.fallback.id }]
                      : []),
                  ]
                : []),
            ],
          },
        },
      };
    }

    return {
      select: {
        ...Object.keys(tree || {}).reduce((acc, key) => {
          if (resource.fields[key].translatable) {
            return acc;
          }

          if (resource.fields[key].ref) {
            acc[key] = this.getSelectRecursive(
              resource.fields[key].ref.resource,
              tree[key] as NestedObject,
            );

            return acc;
          }

          if (tree[key]) {
            acc[key] = true;
          }

          return acc;
        }, {}),
        ...translations,
      },
    };
  }

  getFilter(filter: QueryFilter) {
    return this.getFilterRecursive(filter);
  }

  private getFilterRecursive(filter: QueryFilter) {
    if (!filter) {
      return {};
    }

    if ('or' in filter) {
      return {
        OR: filter.or.map((f) => this.getFilterRecursive(f)).filter(Boolean),
      };
    }

    if ('and' in filter) {
      return {
        AND: filter.and.map((f) => this.getFilterRecursive(f)).filter(Boolean),
      };
    }

    if (filter.operator === 'eq') {
      return { [filter.field]: filter.value };
    }

    if (!filter.operator) {
      return {};
    }

    return null;
  }

  postProcessRecursive(resource: Resource, data: any) {
    return Object.values(resource.fields).reduce((acc, field) => {
      if (field.translatable) {
        const translation = data.translations.find(
          (t) => t.languageId === this.language.id,
        );

        let translationFallback1 = null;
        let translationFallback2 = null;

        if (this.language.fallback) {
          translationFallback1 = data.translations.find(
            (t: any) => t.languageId === this.language.fallback.id,
          );

          if (this.language.fallback.fallback) {
            translationFallback2 = data.translations.find(
              (t: any) => t.languageId === this.language.fallback.fallback.id,
            );
          }
        }

        return {
          ...acc,
          [field.name]:
            translation?.[field.name] ||
            translationFallback1?.[field.name] ||
            translationFallback2?.[field.name],
        };
      }

      if (!(field.name in data)) {
        return acc;
      }

      if (field.ref) {
        if (Array.isArray(data[field.name])) {
          return {
            ...acc,
            [field.name]: data[field.name].map((item: any) =>
              this.postProcessRecursive(
                this.schema.resources[field.ref.resource],
                item,
              ),
            ),
          };
        }

        return {
          ...acc,
          [field.name]: this.postProcessRecursive(
            this.schema.resources[field.ref.resource],
            data[field.name],
          ),
        };
      }

      return { ...acc, [field.name]: data[field.name] };
    }, {});
  }
}
