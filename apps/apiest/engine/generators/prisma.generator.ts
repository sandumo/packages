import { Field, Resource, Schema } from '../types';
import { code, firstLetterToUpperCase } from './utils';

// export function generatePrismaSchema(schema: Schema) {
//   const userRelations: string[] = [];

//   Object.entries(schema).map(([, model]) =>
//     Object.values(model.fields).map((field) => {
//       if (field.type === 'ref' && field.ref && field.ref.model === 'User') {
//         const iterable = !field.iterable ? '[]' : '';
//         const nullable = field.nullable && field.iterable ? '?' : '';
//         userRelations.push(
//           `${model.naming.camelCasePlural} ${model.naming.pascalCase}${nullable}${iterable}`,
//         );
//       }
//     }),
//   );

//   // console.log('[x] userRelations=', userRelations);

//   const output = code([
//     'generator client {',
//     '  provider = "prisma-client-js"',
//     '  previewFeatures = ["relationJoins"]',
//     '}',
//     '',
//     'datasource db {',
//     '  provider          = "postgresql"',
//     '  url               = env("POSTGRES_PRISMA_URL") // uses connection pooling',
//     '  directUrl         = env("POSTGRES_URL_NON_POOLING") // uses a direct connection',
//     '  shadowDatabaseUrl = env("POSTGRES_URL_NON_POOLING") // used for migrations',
//     '}',
//     '',
//     ...Object.entries(schema).map(([key, model]) =>
//       code([
//         `model ${firstLetterToUpperCase(key)} {`,
//         code(
//           Object.values(model.fields).map((field) => prismaField(field, model)),
//           1,
//         ),
//         ...(key === 'user' && userRelations.length > 0
//           ? userRelations.map((s) => '  ' + s)
//           : []),
//         '  createdAt DateTime? @default(now())',
//         '  updatedAt DateTime? @default(now()) @updatedAt',
//         '  deletedAt DateTime?',
//         '}',
//         '',
//       ]),
//     ),
//   ]);

//   return output;
// }

// function prismaField(field: Field, resource: Resource) {
//   const mappings = {
//     integer: 'Int',
//     float: 'Float',
//     string: 'String',
//     boolean: 'Boolean',
//     file: 'Json',
//   };

//   // const tags = value.split(' ');

//   // const type = tags
//   //   .map((tag) => mappings[tag] || '')
//   //   .join(' ')
//   //   .trim();

//   const iterable = field.iterable ? '[]' : '';
//   const nullable = field.nullable && !iterable ? '?' : '';
//   const primaryKey = field.primaryKey ? '@id @default(autoincrement())' : '';
//   const defaultValue = field.defaultValue
//     ? `@default(${field.defaultValue})`
//     : '';

//   if (field.ref) {
//     // self-referential relation
//     if (field.ref.model === resource.naming.pascalCase && field.ref.field) {
//       // 1-1 self-relation
//       if (!field.iterable) {
//         const nullable = field.nullable ? '?' : '';

//         return code([
//           `${field.name} ${field.ref.model}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation", fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
//           `${field.name}${firstLetterToUpperCase(field.ref.field)} Int${nullable} @unique`,
//           `${field.name}Relation ${field.ref.model}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation")`,
//         ]);
//       }
//     }

//     if (field.ref.field) {
//       return code([
//         `${field.name} ${field.ref.model} @relation(fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
//         `${field.name}${firstLetterToUpperCase(field.ref.field)} Int`,
//       ]);
//     }

//     return `${field.name} ${field.ref.model}${nullable}${iterable}`;
//   }

//   let type = field.type;

//   if (mappings[type]) {
//     type = mappings[type];
//   }

//   return `${field.name} ${type}${nullable}${iterable} ${primaryKey} ${defaultValue}`
//     .replace(/\s+/g, ' ')
//     .trim();
// }

export class PrismaGenerator {
  private schema: Schema;
  private mappings = {
    integer: 'Int',
    float: 'Float',
    string: 'String',
    boolean: 'Boolean',
    file: 'Json',
  };
  private relations: Record<string, string[]> = {
    user: [],
    language: [],
  };

  constructor(schema: Schema) {
    this.schema = schema;
  }

  generatePrismaSchema() {
    // this.relations();

    // return '';

    const userRelations: string[] = [];

    Object.entries(this.schema.resources).map(([, model]) =>
      Object.values(model.fields).map((field) => {
        if (
          field.type === 'ref' &&
          field.ref &&
          field.ref.resource === 'User'
        ) {
          const iterable = !field.iterable ? '[]' : '';
          const nullable = field.nullable && field.iterable ? '?' : '';
          userRelations.push(
            `${model.naming.camelCasePlural} ${model.naming.pascalCase}${nullable}${iterable}`,
          );
        }
      }),
    );

    const output = code([
      'generator client {',
      '  provider = "prisma-client-js"',
      '  previewFeatures = ["relationJoins"]',
      '}',
      '',
      'datasource db {',
      '  provider          = "postgresql"',
      '  url               = env("POSTGRES_PRISMA_URL") // uses connection pooling',
      '  directUrl         = env("POSTGRES_URL_NON_POOLING") // uses a direct connection',
      '  shadowDatabaseUrl = env("POSTGRES_URL_NON_POOLING") // used for migrations',
      '}',
      '',
      ...Object.entries(this.schema.resources).map(([key, model]) =>
        code([
          `model ${firstLetterToUpperCase(key)} {`,
          code(
            Object.values(model.fields).map((field) =>
              this.prismaField(field, model),
            ),
            1,
          ),
          ...(key === 'user' && userRelations.length > 0
            ? userRelations.map((s) => '  ' + s)
            : []),
          '  createdAt DateTime? @default(now())',
          '  updatedAt DateTime? @default(now()) @updatedAt',
          '  deletedAt DateTime?',
          '}',
          '',
        ]),
      ),
    ]);

    return output;
  }

  generate() {
    this.getRelations();

    console.log('[x] relations=', this.relations);

    return code([
      'generator client {',
      '  provider = "prisma-client-js"',
      '  previewFeatures = ["relationJoins"]',
      '}',
      '',
      'datasource db {',
      '  provider          = "postgresql"',
      '  url               = env("POSTGRES_PRISMA_URL") // uses connection pooling',
      '  directUrl         = env("POSTGRES_URL_NON_POOLING") // uses a direct connection',
      '  shadowDatabaseUrl = env("POSTGRES_URL_NON_POOLING") // used for migrations',
      '}',
      '',
      ...Object.entries(this.schema.resources).map(([, model]) =>
        code([this.generateTable(model), '']),
      ),
    ]);
  }

  private getRelations() {
    // iterate resources
    Object.entries(this.schema.resources).map(([, resource]) =>
      // iterate fields
      Object.values(resource.fields).map((field) => {
        if (
          field.type === 'ref' &&
          field.ref &&
          field.ref.resource !== resource.naming.camelCase &&
          this.relations[field.ref.resource]
        ) {
          const iterable = !field.iterable ? '[]' : '';
          const nullable = field.nullable && field.iterable ? '?' : '';

          this.relations[field.ref.resource].push(
            `${resource.naming.camelCase}${firstLetterToUpperCase(field.name)} ${resource.naming.pascalCase}${nullable}${iterable} @relation("${field.name}")`,
          );
        }
      }),
    );

    // collect language relations
    // iterate resources
    Object.entries(this.schema.resources).map(([, resource]) =>
      // iterate fields
      Object.values(resource.fields).some((field) => {
        if (field.translatable) {
          this.relations.language.push(
            `${resource.naming.camelCasePlural} ${resource.naming.pascalCase}Translation[]`,
          );

          return true;
        }
      }),
    );
  }

  private generateTable(resource: Resource) {
    const translatable = Object.values(resource.fields).some(
      (f) => f.translatable,
    );

    return code([
      `model ${firstLetterToUpperCase(resource.naming.pascalCase)} {`,
      code(
        [
          ...Object.values(resource.fields)
            .filter((field) => !field.translatable)
            .map((field) => this.generateField(field, resource)),
          ...(this.relations[resource.naming.camelCase] || []),
        ],
        1,
      ),
      // ...(key === 'user' && userRelations.length > 0
      //   ? userRelations.map((s) => '  ' + s)
      //   : []),
      ...(translatable
        ? [`  translations ${resource.naming.pascalCase}Translation[]`]
        : []),
      '  createdAt DateTime? @default(now())',
      '  updatedAt DateTime? @default(now()) @updatedAt',
      '  deletedAt DateTime?',
      '}',
      ...(translatable
        ? [code(['', this.generateTableTranslation(resource)])]
        : []),
    ]);
  }

  private generateTableTranslation(resource: Resource) {
    const fields = Object.values(resource.fields).filter(
      (field) => field.translatable,
    );

    return code([
      `model ${firstLetterToUpperCase(resource.naming.pascalCase)}Translation {`,
      code(
        [
          `${resource.naming.camelCase}${firstLetterToUpperCase(resource.primaryKey)} ${this.mappings[resource.fields[resource.primaryKey].type]}`,
          `${resource.naming.camelCase} ${resource.naming.pascalCase} @relation(fields: [${resource.naming.camelCase}${firstLetterToUpperCase(resource.primaryKey)}], references: [${resource.primaryKey}])`,
          `languageId Int`,
          'language Language @relation(fields: [languageId], references: [id])',
          `@@id([${resource.naming.camelCase}${firstLetterToUpperCase(resource.primaryKey)}, languageId])`,
          ...fields.map((field) => this.generateField(field, resource)),
        ],
        1,
      ),
      '}',
    ]);
  }

  private generateField(field: Field, resource: Resource) {
    const iterable = field.iterable ? '[]' : '';
    const nullable = field.nullable && !iterable ? '?' : '';
    const primaryKey = field.primaryKey ? '@id @default(autoincrement())' : '';
    const defaultValue = field.defaultValue
      ? `@default(${field.defaultValue})`
      : '';

    if (field.ref) {
      const pascalCase =
        this.schema.resources[field.ref.resource].naming.pascalCase;

      // self-referential relation
      if (field.ref.resource === resource.naming.camelCase && field.ref.field) {
        // 1-1 self-relation
        if (!field.iterable) {
          const nullable = field.nullable ? '?' : '';

          return code([
            `${field.name} ${pascalCase}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation", fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
            `${field.name}${firstLetterToUpperCase(field.ref.field)} Int${nullable} @unique`,
            `${field.name}Relation ${pascalCase}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation")`,
          ]);
        }
      }

      if (field.ref.field) {
        const nullable = field.nullable ? '?' : '';

        return code([
          `${field.name} ${pascalCase}${nullable} @relation("${field.name}", fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
          `${field.name}${firstLetterToUpperCase(field.ref.field)} Int${nullable}`,
        ]);
      }

      const relationName = Object.values(
        this.schema.resources[field.ref.resource].fields,
      ).find(
        (field) =>
          field.ref && field.ref.resource === resource.naming.camelCase,
      )?.name;

      return `${field.name} ${pascalCase}${nullable}${iterable} @relation("${relationName}")`;
    }

    let type = field.type;

    if (this.mappings[type]) {
      type = this.mappings[type];
    }

    return `${field.name} ${type}${nullable}${iterable} ${primaryKey} ${defaultValue}`
      .replace(/\s+/g, ' ')
      .trim();
  }

  private prismaField(field: Field, resource: Resource) {
    const mappings = {
      integer: 'Int',
      float: 'Float',
      string: 'String',
      boolean: 'Boolean',
      file: 'Json',
    };

    // const tags = value.split(' ');

    // const type = tags
    //   .map((tag) => mappings[tag] || '')
    //   .join(' ')
    //   .trim();

    const iterable = field.iterable ? '[]' : '';
    const nullable = field.nullable && !iterable ? '?' : '';
    const primaryKey = field.primaryKey ? '@id @default(autoincrement())' : '';
    const defaultValue = field.defaultValue
      ? `@default(${field.defaultValue})`
      : '';

    if (field.ref) {
      // self-referential relation
      if (
        field.ref.resource === resource.naming.pascalCase &&
        field.ref.field
      ) {
        // 1-1 self-relation
        if (!field.iterable) {
          const nullable = field.nullable ? '?' : '';

          return code([
            `${field.name} ${field.ref.resource}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation", fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
            `${field.name}${firstLetterToUpperCase(field.ref.field)} Int${nullable} @unique`,
            `${field.name}Relation ${field.ref.resource}${nullable} @relation("${firstLetterToUpperCase(field.name)}Relation")`,
          ]);
        }
      }

      if (field.ref.field) {
        return code([
          `${field.name} ${field.ref.resource} @relation(fields: [${field.name}${firstLetterToUpperCase(field.ref.field)}], references: [${field.ref.field}])`,
          `${field.name}${firstLetterToUpperCase(field.ref.field)} Int`,
        ]);
      }

      return `${field.name} ${field.ref.resource}${nullable}${iterable}`;
    }

    let type = field.type;

    if (mappings[type]) {
      type = mappings[type];
    }

    return `${field.name} ${type}${nullable}${iterable} ${primaryKey} ${defaultValue}`
      .replace(/\s+/g, ' ')
      .trim();
  }
}
