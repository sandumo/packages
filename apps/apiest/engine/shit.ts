import { filterPermissions, getAllowedAttributes } from './rules';
import { Language, Permission, Resource, Schema } from './types';

/*
{
  select: {
    id: true,
    status: true,

    -------------------------------

    comments: true,

    OR

    comments: {
      select: {
        id: true,
        content: true,
      },
    },

    -------------------------------

    translations: {
    }
  },
}


*/

export class Shit {
  private schema: Schema;
  private permissions: Permission[];
  private language: Language;

  constructor(schema: Schema, permissions: Permission[], language: Language) {
    this.schema = schema;
    this.permissions = permissions;
    this.language = language;

    console.log('[x] language=', this.language);
  }

  doTheShit(resource: Resource, include: string[]) {
    return this.shit(resource.naming.camelCase, include);
  }

  /**
   * Preprocess the query to include only allowed attributes + translations if needed
   */
  shit(resourceKey: string, include: string[]) {
    const resource = this.schema.resources[resourceKey];

    const allowedAttributes = getAllowedAttributes(
      resource,
      this.permissions,
      'read',
    );

    if (allowedAttributes.length === 0) {
      return false;
    }

    const includeMap = include.reduce((acc, attr) => {
      const parts = attr.split('.');
      const key = parts.shift();
      const rest = parts.join('.');

      if (parts.length === 0) {
        acc[key] = true;
      } else if (!(key in acc)) {
        acc[key] = [rest];
      } else {
        acc[key].push(rest);
      }

      return acc;
    }, {});

    const epta = allowedAttributes.reduce((acc, attr) => {
      if (resource.fields[attr].translatable) {
        return acc;
      }

      if (resource.fields[attr].ref) {
        if (attr in includeMap) {
          return {
            ...acc,
            [attr]: this.doTheShit(
              this.schema.resources[resource.fields[attr].ref.resource],
              includeMap[attr] === true ? [] : includeMap[attr],
            ),
          };
        }

        return acc;
      }

      return { ...acc, [attr]: true };
    }, {});

    const translatable = Object.values(resource.fields).some(
      (field) => field.translatable && allowedAttributes.includes(field.name),
    );

    let translations = {};

    if (translatable) {
      translations = {
        translations: {
          select: {
            languageId: true,
            ...allowedAttributes
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
        ...epta,
        ...translations,
      },
    };
  }

  /**
   * Postprocess the data to include translations and references
   */
  postprocess(resource: Resource, data: any) {
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
              this.postprocess(this.schema.resources[field.ref.resource], item),
            ),
          };
        }

        return {
          ...acc,
          [field.name]: this.postprocess(
            this.schema.resources[field.ref.resource],
            data[field.name],
          ),
        };
      }

      return { ...acc, [field.name]: data[field.name] };
    }, {});
  }
}
