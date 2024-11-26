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
  name: string;
  plural?: string;
  conditions?: Record<string, QueryFilter>;
  fields: Record<string, string>;
};

export type InputSchema = {
  resources: {
    [key: string]: InputModel;
  };
};

export const inputSchema: InputSchema = {
  resources: {
    product: {
      name: 'Product',
      fields: {
        id: 'integer PK identifiable',
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
      name: 'Category',
      plural: 'categories',
      fields: {
        id: 'integer PK sortable',
        name: 'string filterable sortable searchable',
      },
    },

    post: {
      name: 'Post',
      // plural: 'posts',
      // flags: 'own', // own meanse that the records belongs to the user
      // defaultAccess: 'private',
      // flags: 'ownable',
      fields: {
        id: 'integer PK identifiable',
        title: 'string translatable',
        content: 'string translatable nullable',
        // published: 'boolean default(false)',
        // views: 'integer default(0)',
        comments: 'ref(comment) iterable',
        moderated: 'boolean default(false)',
        status: 'string default("draft")',
        // moderator: 'ref(user) nullable',
        // likes: 'ref(postLike) iterable countable',
        // owner: 'ref(user.id) nullable',
        // ownerId: 'integer nullable',
        hash: 'string identifiable nullable',
        owner: 'ref(user.id) nullable',
        author: 'ref(user.id) nullable',
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
      name: 'Comment',
      // plural: 'comments',
      fields: {
        id: 'integer PK',
        content: 'string translatable',
        post: 'ref(post.id)',
      },
    },

    // User
    user: {
      name: 'User',
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
      },
    },

    // Language: https://chatgpt.com/share/e/6743889a-f720-800a-ad5c-dcb08b5f8b7a
    language: {
      name: 'Language',
      fields: {
        id: 'integer PK identifiable',
        locale: 'string',
        name: 'string',
        nativeName: 'string',
        direction: 'string default("LTR")',
        active: 'boolean default(false)',
        fallback: 'ref(language.id) nullable',
      },
    },
  },
};

/**
 * Transform the input schema to the internal schema
 * @param schema - The input schema
 * @returns The internal schema
 */
function transform(schema: InputSchema): Schema {
  return {
    resources: Object.entries(schema.resources).reduce((acc, [key, model]) => {
      const singular = firstLetterToLowerCase(key);
      const plural = firstLetterToLowerCase(model.plural || `${singular}s`);

      return {
        ...acc,
        [key]: {
          name: model.name,
          // plural: model.plural,
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
          conditions: model.conditions,
          primaryKey: Object.entries(model.fields).find(([, value]) =>
            value.includes('PK'),
          )?.[0],
        } as Resource,
      };
    }, {}),
  } as Schema;
}

export const schema = transform(inputSchema);
export const router = Object.keys(schema.resources).reduce((acc, key) => {
  acc[schema.resources[key].naming.kebabCasePlural] = key;
  return acc;
}, {});
