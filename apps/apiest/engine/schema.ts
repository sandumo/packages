import {
  firstLetterToLowerCase,
  firstLetterToUpperCase,
} from './generators/utils';
import {
  dataTypes,
  Field,
  FieldReference,
  QueryFilter,
  Resource,
  Schema,
} from './types';
import { camelCaseToKebabCase } from './utils';

export type InputModel = {
  plural?: string;
  flags?: string;
  conditions?: Record<string, QueryFilter>;
  fields: Record<string, string>;
};

export type InputSchema = {
  resources: {
    [key: string]: InputModel;
  };
  permissions: Record<string, string[]>;
};

export const inputSchema: InputSchema = {
  resources: {
    product: {
      fields: {
        id: 'integer PK identifiable', // /products/1
        category: 'string filterable sortable searchable',
        name: 'string translatable',
        price: 'float',
        discount: 'float nullable',
        highlights: 'string nullable iterable',
        active: 'boolean default(false)',
        pictures: 'file iterable',
      },
    },

    category: {
      plural: 'categories',
      fields: {
        id: 'integer PK sortable',
        name: 'string filterable sortable searchable',
      },
    },

    post: {
      flags: 'ownable',
      fields: {
        id: 'integer PK identifiable',
        title: 'string translatable',
        content: 'string translatable nullable',
        comments: 'ref(comment) iterable',
        moderated: 'boolean default(false)',
        status: 'string default("draft")',
        // likes: 'ref(postLike) iterable countable',
        hash: 'string identifiable nullable',
        author: 'ref(user.id) nullable',
        // hideStatus: 'boolean default(false)',
      },
      conditions: {
        sentToModeration: {
          field: 'status',
          operator: 'eq',
          value: 'sent_to_moderation',
        },
        published: {
          field: 'status',
          operator: 'eq',
          value: 'published',
        },
      },
    },

    // postLike: {
    //   name: 'PostLike',
    //   plural: 'postLikes',
    //   fields: {
    //     post: 'ref(post.id)',
    //     user: 'ref(user.id)',
    //   },
    // },

    comment: {
      fields: {
        id: 'integer PK',
        content: 'string translatable',
        post: 'ref(post.id)',
      },
    },

    // User
    user: {
      fields: {
        id: 'integer PK',
        email: 'string',
        phone: 'string',
        password: 'string',
        firstname: 'string nullable',
        lastname: 'string nullable',
        displayName: 'string nullable',
        avatar: 'file nullable',
        permissions: 'string iterable',
        // role: 'ref(role.id) nullable',
      },
    },

    // role: {
    //   name: 'Role',
    //   fields: {
    //     id: 'integer PK',
    //     name: 'string',
    //   },
    // },

    // Language: https://chatgpt.com/share/e/6743889a-f720-800a-ad5c-dcb08b5f8b7a
    language: {
      fields: {
        id: 'integer PK identifiable',
        locale: 'string unique',
        name: 'string',
        nativeName: 'string',
        direction: 'string default("LTR")',
        active: 'boolean default(false)',
        fallback: 'ref(language.id) nullable',
      },
    },
  },
  permissions: {
    root: ['read.product'], // root user
    admin: ['*.post'], // not sure if needed
    owner: [
      // '*.post',
      'list.post',
      'list.post.[id,title,content,author.[id,displayName],comments.[id,content]]',
      'read.post.[*,author.[id,displayName]]',
      // 'read.user',
      // 'list.post.author',
      // 'list.post.comments.[id,content]',
      // 'list.post.owner',
      // 'list.user.[id,email]',
    ], // owner of the resource
    user: [], // authenticated user
    guest: ['read.post.![status]:status(published)'], // unauthenticated user
    anyone: [],
  },
};

/**
 * Transform the input schema to the internal schema
 * @param schema - The input schema
 * @returns The internal schema
 */
function transform(schema: InputSchema): Schema {
  return {
    // resources
    resources: Object.entries(schema.resources).reduce((acc, [key, model]) => {
      const singular = firstLetterToLowerCase(key);
      const plural = firstLetterToLowerCase(model.plural || `${singular}s`);

      const ownable = model.flags?.includes('ownable') || false;

      const fields = model.fields;

      if (ownable) {
        fields.owner = 'ref(user.id)';
      }

      return {
        ...acc,
        [key]: {
          name: singular,
          naming: {
            camelCase: singular,
            camelCasePlural: plural,
            pascalCase: firstLetterToUpperCase(singular),
            pascalCasePlural: firstLetterToUpperCase(plural),
            kebabCase: camelCaseToKebabCase(singular),
            kebabCasePlural: camelCaseToKebabCase(plural),
          },
          fields: Object.entries(model.fields).reduce(
            (acc, [key, tagsString]) => {
              const tags = tagsString.split(' ');

              let ref: FieldReference | undefined;

              if (tags.find((t) => t.match(/ref\([\w\.]+\)/))) {
                const refString = tags.find((t) => t.match(/ref\([\w\.]+\)/));

                const match = refString.match(/ref\(([\w\.]+)\)/)?.[1];

                const [modelKey, field] = match.split('.');

                // const model = schema.resources[modelKey];

                const resourceNamingCamelCase =
                  firstLetterToLowerCase(modelKey);

                if (field) {
                  ref = {
                    resource: resourceNamingCamelCase,
                    field,
                  };
                } else {
                  ref = {
                    resource: resourceNamingCamelCase,
                  };
                }
              }

              return {
                ...acc,
                [key]: {
                  name: key,
                  type:
                    tags.filter((tag) => dataTypes.includes(tag))?.[0] ||
                    (tags.find((t) => t.match(/ref\([\w\.]+\)/))
                      ? 'ref'
                      : 'string'),
                  primaryKey: tags.includes('PK'),
                  nullable: tags.includes('nullable'),
                  iterable: tags.includes('iterable'),
                  filterable: tags.includes('filterable'),
                  sortable: tags.includes('sortable'),
                  searchable: tags.includes('searchable'),
                  translatable: tags.includes('translatable'),
                  identifiable: tags.includes('identifiable'),
                  unique: tags.includes('unique'),
                  defaultValue: tags
                    .find((tag) => tag.startsWith('default('))
                    ?.replace('default(', '')
                    .replace(')', ''),
                  ref,
                } as Field,
              };
            },
            {},
          ),

          // conditions
          conditions: model.conditions,

          // primaryKey
          primaryKey: Object.entries(model.fields).find(([, value]) =>
            value.includes('PK'),
          )?.[0],

          // ownable
          ownable: model.flags?.includes('ownable') || false,

          // translatable
          translatable: Object.values(model.fields).some((field) =>
            field.includes('translatable'),
          ),
        } as Resource,
      };
    }, {}),

    // permissions
    permissions: schema.permissions,
  } as Schema;
}

export const schema = transform(inputSchema);
export const router = Object.keys(schema.resources).reduce((acc, key) => {
  acc[schema.resources[key].naming.kebabCasePlural] = key;
  return acc;
}, {});
