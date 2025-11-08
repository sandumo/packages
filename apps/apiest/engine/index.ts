// import { DataProcessor } from './data.processor';
import { z } from 'zod';
import { FilterProcessor } from './filter.processor';
import { BaseAction, NestedObject, PermissionParser } from './permissions';
import { PrismaAdapter } from './prisma.adapter';
import { Tree } from './tree';
import {
  Field,
  FIELD_TYPE,
  Language,
  Query,
  QueryFilter,
  Resource,
  Schema,
  User,
} from './types';
import {
  asyncMapParallel,
  castValue,
  isObject,
  traverse,
  validateValue,
} from './utils';
import { firstLetterToUpperCase } from './generators/utils';
import { CacheService } from '@sandumo/nestjs-cache-module';

export class App {
  private schema: Schema;
  private resource: Resource;
  private user: User;
  private language: Language;
  private query: Query;

  private permissionParser: PermissionParser;
  private filterProcessor: FilterProcessor;
  private prismaAdapter: PrismaAdapter;

  // computed permissions
  private permissions: string[];
  private ownerPermissions: string[];

  private action: BaseAction;

  // data: DataProcessor;

  // private languages: Language[];

  private prisma;

  private cache: CacheService;

  private data: any;

  constructor(
    schema: Schema,
    resource: Resource,
    user: User,
    // language: string,
    query: Query,
    action: BaseAction,
    data: any,
  ) {
    this.schema = schema;
    this.resource = resource;
    this.user = user;
    // this.language = language;
    this.query = query;
    this.action = action;
    this.permissionParser = new PermissionParser(schema, user._permissions);
    this.filterProcessor = new FilterProcessor();
    // this.prismaAdapter = new PrismaAdapter(schema, language, query);
    // this.data = new DataProcessor();
    this.data = data;
  }

  // setLanguages(languages: Language[]) {
  //   this.languages = languages;
  // }

  setPrisma(prisma: any) {
    this.prisma = prisma;
  }

  setCache(cache: CacheService) {
    this.cache = cache;
  }

  async getLanguages(): Promise<Language[]> {
    return await this.cache.get(
      'languages',
      () =>
        this.prisma.language.findMany({
          select: {
            id: true,
            locale: true,
            name: true,
            // nativeName: true,
            // direction: true,
            fallback: {
              select: {
                id: true,
                locale: true,
                name: true,
                fallback: {
                  select: {
                    id: true,
                    locale: true,
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            active: true,
          },
        }),
      24 * 60 * 60,
    );
  }

  async getLanguage(idOrLocale: string | number) {
    const languages = await this.getLanguages();

    if (typeof idOrLocale === 'string') {
      return languages.find((language) => language.locale === idOrLocale);
    }

    if (typeof idOrLocale === 'number') {
      return languages.find((language) => language.id === idOrLocale);
    }

    return null;
  }

  async setLanguage(locale: string) {
    this.language = await this.getLanguage(locale);

    this.prismaAdapter = new PrismaAdapter(
      this.schema,
      this.language,
      this.query,
    );
  }

  do() {
    // build the tree:
    // console.log(this.schema.permissions);

    // console.log('[x] permissions', permissions);

    // const tree = this.getTree();
    // console.log('[x] tree', tree);

    // const select = this.prismaAdapter.getSelect(this.resource, this.getTree());

    const tree = this.getTree();

    console.log('[x] tree', tree);
  }

  /**
   * Split update/create input data that contains translations into separate objects
   *
   * TODO: Test all cases
   */
  splitData(data: any, resource: Resource = this.resource) {
    const result = {};

    const { translations, ...commonFields } = data;

    if (translations) {
      Object.keys(translations).forEach((lang) => {
        result[lang] = {
          ...commonFields,
          ...translations[lang],
        };
      });
    } else {
      result[this.language.locale] = commonFields;
    }

    traverse(commonFields, resource, (fieldKey, value, field) => {
      if (field.ref) {
        const res = this.splitData(
          value,
          this.schema.resources[field.ref.resource],
        );

        Object.keys(res).forEach((lang) => {
          result[lang][fieldKey] = res[lang];
        });
      }
    });

    return result;
  }

  /**
   * Merge update/create split data into a single object to include all translations
   */
  mergeData(data: any, resource: Resource = this.resource) {
    let result = {};
    const translations = {};
    const refs = {};

    Object.keys(data).forEach((lang) => {
      result = this.merge(
        result,
        traverse(data[lang], resource, (key, value, field) => {
          if (field.ref) {
            if (refs[key]) {
              return;
            }

            refs[key] = true;

            return this.mergeData(
              Object.fromEntries(
                Object.keys(data).map((lang) => [lang, data[lang][key]]),
              ),
              this.schema.resources[field.ref.resource],
            );
          } else if (field.translatable) {
            if (!translations[lang]) {
              translations[lang] = {};
            }

            translations[lang][key] = value;
          } else {
            return value;
          }
        }),
        resource,
      );

      // Object.keys(data[lang]).forEach((key) => {
      //   if (isObject(data[lang][key])) {
      //     data[lang][key] = this.mergeData(data[lang][key], resource);
      //   }
      // });
    });

    return {
      ...result,
      ...(resource.translatable ? { translations } : {}),
    };
  }

  merge(
    a: Record<string, any>,
    b: Record<string, any>,
    resource: Resource = this.resource,
  ): Record<string, any> {
    const result: Record<string, any> = { ...a };

    for (const key in b) {
      if (b.hasOwnProperty(key)) {
        if (key in a) {
          const field = resource.fields[key];

          if (key === 'translations') {
            const subResult = { ...a[key] };

            for (const locale of Object.keys(b[key])) {
              if (locale in a[key]) {
                subResult[locale] = this.merge(
                  a[key][locale],
                  b[key][locale],
                  resource,
                );
              } else {
                subResult[locale] = b[key][locale];
              }
            }

            result[key] = subResult;
          } else if (field.ref) {
            result[key] = this.merge(
              a[key],
              b[key],
              this.schema.resources[field.ref.resource],
            );
          } else if (field.type === FIELD_TYPE.FILE) {
            result[key] = a[key];
          } else {
            const aVal = a[key];
            const bVal = b[key];

            if (
              typeof aVal === 'object' &&
              aVal !== null &&
              typeof bVal === 'object' &&
              bVal !== null
            ) {
              // Recursively merge nested objects
              result[key] = this.merge(
                aVal as Record<string, any>,
                bVal as Record<string, any>,
              );
            } else {
              // Overwrite with b's value if not both objects
              result[key] = bVal || aVal;
            }
          }
        } else {
          result[key] = b[key];
        }
      }
    }

    return result;
  }

  /**
   * Cleans update/create input data. Removes non-existent fields. Removes fields that are not allowed to be updated.
   */
  cleanData(data: any) {
    return Tree.filter(data, this.getTree());
  }

  castData(data: any, resource: Resource = this.resource) {
    return traverse(data, resource, (key, value, field) => {
      if (value === undefined) {
        return undefined;
      }

      if (field.ref && field.iterable && Array.isArray(value)) {
        if (Array.isArray(value)) {
          return value.map((value: any) =>
            this.castData(value, this.schema.resources[field.ref.resource]),
          );
        }
      } else if (field.ref) {
        return this.castData(value, this.schema.resources[field.ref.resource]);
      } else if (field.iterable) {
        if (Array.isArray(value)) {
          return value.map((value: any) => castValue(value, field.type));
        }
      } else {
        return castValue(value, field.type);
      }
    });
  }

  validateData(data: any, optional: boolean = false) {
    const schema = this.getValidationSchema(
      this.getTree(),
      this.resource,
      optional,
    );

    return schema.safeParse(data);
  }

  /**
   * Get the data to be used for the update/create operation.
   */
  async getUpdateData(
    data: any,
    resource: Resource = this.resource,
    excludeTranslations: boolean = false,
  ) {
    return {
      // simple fields
      ...traverse(data, resource, (key, value, field) => {
        if (!field.ref && !field.primaryKey) {
          // file fields
          if (field.type === FIELD_TYPE.FILE) {
            if (field.iterable) {
              return value.map((file) => ({
                name: file.originalname || file.name,
                path: file.path,
                size: file.size,
                type: file.mimetype || file.type,
              }));
            }

            return {
              name: value.originalname || value.name,
              path: value.path,
              size: value.size,
              type: value.mimetype || value.type,
            };
          }

          return value;
        }
      }),

      // translatable fields
      ...(data.translations &&
      !excludeTranslations &&
      Object.values(data.translations).reduce(
        (acc: number, curr) => acc + Object.keys(curr).length,
        0,
      )
        ? {
            translations: {
              upsert: await Promise.all(
                Object.keys(data.translations).map(async (lang: string) => ({
                  where: {
                    [`${resource.name}${firstLetterToUpperCase(resource.primaryKey)}_languageId`]:
                      {
                        [`${resource.name}${firstLetterToUpperCase(resource.primaryKey)}`]:
                          data[resource.primaryKey],
                        languageId: (await this.getLanguage(lang))?.id,
                      },
                  },
                  update: {
                    ...data.translations[lang],
                  },
                  create: {
                    ...data.translations[lang],
                    languageId: (await this.getLanguage(lang))?.id,
                  },
                })),
              ),
            },
          }
        : {}),

      // relations
      ...(await this.asyncTraverse(
        data,
        resource,
        async (key, value, field, resource, schema) => {
          // handle non-iterable relations
          if (field.ref && !field.iterable) {
            // handle connect case
            if (
              value[schema.resources[field.ref.resource].primaryKey] &&
              Object.keys(value).length === 1
            ) {
              return {
                connect: {
                  [schema.resources[field.ref.resource].primaryKey]:
                    value[schema.resources[field.ref.resource].primaryKey],
                },
              };
            }

            // handle update case
            return {
              update: await this.getUpdateData(
                value,
                this.schema.resources[field.ref.resource],
              ),
            };
          }
          // TODO: handle iterable relations
        },
      )),
    };
  }

  /**
   * Get the data to be used for the create operation.
   */
  async getCreateData(
    data: any,
    resource: Resource = this.resource,
    excludeTranslations: boolean = false,
  ) {
    return {
      // simple fields
      ...traverse(data, resource, (key, value, field) => {
        if (!field.ref && !field.primaryKey) {
          // file fields
          if (field.type === FIELD_TYPE.FILE) {
            if (field.iterable) {
              return value.map((file) => ({
                name: file.originalname,
                path: file.path,
                size: file.size,
                type: file.mimetype,
              }));
            }

            return {
              name: value.originalname,
              path: value.path,
              size: value.size,
              type: value.mimetype,
            };
          }

          return value;
        }
      }),

      // translatable fields
      ...(data.translations && !excludeTranslations
        ? {
            translations: {
              create: await Promise.all(
                Object.keys(data.translations).map(async (lang: string) => ({
                  ...data.translations[lang],
                  languageId: (await this.getLanguage(lang))?.id,
                })),
              ),
            },
          }
        : {}),

      // relations
      ...(await this.asyncTraverse(
        data,
        resource,
        async (key, value, field, resource, schema) => {
          // handle non-iterable relations
          if (field.ref && !field.iterable) {
            if (value[schema.resources[field.ref.resource].primaryKey]) {
              return {
                connect: {
                  [schema.resources[field.ref.resource].primaryKey]:
                    value[schema.resources[field.ref.resource].primaryKey],
                },
              };
            }

            return {
              create: await this.getCreateData(
                value,
                this.schema.resources[field.ref.resource],
              ),
            };
          }
        },
      )),

      // ownable resources
      ...(resource.ownable
        ? {
            owner: {
              connect: {
                [this.schema.resources.user.primaryKey]: this.user.id,
              },
            },
          }
        : {}),
    };
  }

  getValidationSchema(
    tree: NestedObject,
    resource: Resource,
    optional: boolean = false,
  ) {
    return z.object(
      Object.fromEntries(
        Object.entries(resource.fields).map(([key, field]) => {
          let zod: z.ZodTypeAny;

          if (field.ref && field.iterable && isObject(tree[key])) {
            zod = z.array(
              this.getValidationSchema(
                tree[key] as NestedObject,
                this.schema.resources[field.ref.resource],
                true,
              ),
            );
          } else if (field.ref && isObject(tree[key])) {
            zod = this.getValidationSchema(
              tree[key] as NestedObject,
              this.schema.resources[field.ref.resource],
              true,
            );
          } else if (field.iterable) {
            zod = z.array(validateValue(field, field.type));
          } else {
            zod = validateValue(field, field.type);
          }

          if (
            optional ||
            field.nullable ||
            field.primaryKey ||
            field.defaultValue !== undefined ||
            field.iterable
          ) {
            zod = zod.optional();
          }

          return [key, zod];
        }),
      ) as Record<string, z.ZodTypeAny>,
    );

    // return schema.safeParse(data);
  }

  // Not really sure if this one is needed
  getIncludeFromData(data: any) {
    // const include = [];

    // return traverse(data, resource, (key, value, field, model) => {
    //   if (field.ref) {
    //     return '';
    //   }
    // });

    return Object.keys(data)
      .filter((key) => isObject(data[key]))
      .flatMap((key) => {
        const sub = this.getIncludeFromData(data[key]);

        console.log('[x] sub', sub);

        return sub.map((subKey) => `${key}.${subKey}`);
      });
  }

  getSelect() {
    const tree = this.getTree();

    // console.log('[x] getSelect tree=', tree);

    if (!tree || Object.keys(tree).length === 0) {
      return null;
    }

    return this.prismaAdapter.getSelect(this.resource, tree);
  }

  getFilter() {
    const permissionFilter = this.permissionParser.getConditionsFilter(
      this.action,
      this.resource,
      [...this.getPermissions(), ...this.getOwnerPermissions()],
    );

    const filter: QueryFilter = {
      and: [this.query.filter, permissionFilter].filter(
        Boolean,
      ) as QueryFilter[],
    };

    // console.log('[x] filter=', JSON.stringify(filter, null, 2));

    const castedFilter = this.filterProcessor.castFilter(filter, this.resource); // filter.processor.ts

    // console.log('[x] castedFilter=', JSON.stringify(castedFilter, null, 2));

    // const prismaFilter = transformToPrismaFilter(castedFilter); // prisma.adapter.ts

    return this.prismaAdapter.getFilter(castedFilter);
  }

  private tree: NestedObject;

  /**
   * Creates a tree based on the permissions, action, resource and query.
   */
  getTree() {
    if (this.tree) return this.tree;

    if (!this.resource.ownable || !this.user) {
      this.tree = this.getNonOwnerTree();

      return this.tree;
    }

    // check if empty nonOwnerTree
    if (Object.keys(this.getNonOwnerTree()).length === 0) {
      this.tree = this.getOwnerTree();

      return this.tree;
    }

    this.tree = Tree.merge(this.getNonOwnerTree(), this.getOwnerTree()) || {};

    return this.tree;
  }

  private nonOwnerTree: NestedObject;

  private getNonOwnerTree() {
    if (this.nonOwnerTree) return this.nonOwnerTree;

    this.nonOwnerTree = this.getTreeFromPermissions(this.getPermissions());

    return this.nonOwnerTree;
  }

  private ownerTree: NestedObject;

  private getOwnerTree() {
    if (this.ownerTree) return this.ownerTree;

    if (!this.resource.ownable || !this.user) {
      this.ownerTree = {};

      return this.ownerTree;
    }

    this.ownerTree = this.getTreeFromPermissions(this.getOwnerPermissions());

    return this.ownerTree;
  }

  private getTreeFromPermissions(permissions: string[]) {
    return (
      this.permissionParser.tree(
        this.action,
        this.resource,
        ['list', 'read'].includes(this.action) ? this.query.include : null,
        permissions,
        ['create', 'update', 'read'].includes(this.action) ? this.data : null,
      ) || {}
    );
  }

  /**
   * Get the permissions for the user. Takes into account the user's role and user's permissions.
   */
  private getPermissions(): string[] {
    if (this.permissions) return this.permissions;

    const permissions: string[] = [];

    permissions.push(...this.schema.permissions.anyone);

    // authenticated user
    if (this.user) {
      permissions.push(...this.user._permissions);
      permissions.push(...this.schema.permissions.user);

      // root user
      if (this.user.id === 1) {
        permissions.push(...this.schema.permissions.root);
      }
    }
    // unauthenticated user
    else {
      permissions.push(...this.schema.permissions.guest);
    }

    this.permissions = this.permissionParser.filterPermissions(
      permissions,
      this.action,
    );

    return this.permissions;
  }

  private getOwnerPermissions(): string[] {
    if (this.ownerPermissions) return this.ownerPermissions;

    // owner's permissions
    if (this.resource.ownable && this.user) {
      this.ownerPermissions = this.permissionParser.filterPermissions(
        this.schema.permissions.owner,
        this.action,
      );
    } else {
      this.ownerPermissions = [];
    }

    return this.ownerPermissions;
  }

  /**
   * Postprocess the data to include translations and references
   */
  postProcess(data: any) {
    const process = (data: any) => {
      const resultData = this.prismaAdapter.postProcessRecursive(
        this.resource,
        data,
      );

      // return resultData;

      if (
        this.resource.ownable &&
        this.user &&
        resultData.owner.id !== this.user.id
      ) {
        return Tree.filter(resultData, this.getNonOwnerTree());
      }

      console.log('[x] tree=', this.getTree());

      return Tree.filter(resultData, this.getTree());
    };

    if (Array.isArray(data)) {
      return data.map((item) => process(item));
    }

    return process(data);
  }

  async traverse(
    data: any,
    resource: Resource,
    callback: (
      key: string,
      value: any,
      field: Field,
      resource: Resource,
    ) => Promise<any> | any,
    recursive: boolean = false,
  ): Promise<any> {
    return Object.fromEntries(
      (
        await asyncMapParallel(Object.entries(data), async ([key, value]) => {
          if (resource.fields[key]) {
            if (recursive && resource.fields[key].ref) {
              return [
                key,
                await this.traverse(
                  value,
                  this.schema.resources[resource.name],
                  callback,
                  recursive,
                ),
              ];
            }

            return [
              key,
              await callback(key, value, resource.fields[key], resource),
            ];
          }

          return [key, undefined];
        })
      ).filter(([, value]) => value !== undefined),
    );
  }

  async asyncTraverse(
    data: any,
    resource: Resource,
    callback: (
      key: string,
      value: any,
      field: Field,
      resource: Resource,
      schema: Schema,
    ) => Promise<any> | any,
    recursive: boolean = false,
  ): Promise<any> {
    return Object.fromEntries(
      (
        await asyncMapParallel(Object.entries(data), async ([key, value]) => {
          if (resource.fields[key]) {
            if (recursive && resource.fields[key].ref) {
              return [
                key,
                await this.asyncTraverse(
                  value,
                  this.schema.resources[resource.name],
                  callback,
                  recursive,
                ),
              ];
            }

            return [
              key,
              await callback(
                key,
                value,
                resource.fields[key],
                resource,
                this.schema,
              ),
            ];
          }

          return [key, undefined];
        })
      ).filter(([, value]) => value !== undefined),
    );
  }
}
