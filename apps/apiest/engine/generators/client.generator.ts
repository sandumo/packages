import { Schema } from 'engine/types';
import { schema } from '../schema';

class ClientGenerator {
  constructor(private readonly schema: Schema) {}

  generate() {
    return this.generateTypes();

    return c(
      `
      // Types

      ${Object.values(this.schema.resources)
        .map((resource) =>
          c(`
            type ${resource.naming.pascalCase} = {
              ${Object.values(resource.fields)
                .map(
                  (field) => `
                  ${field.name}: ${field.type}
                `,
                )
                .join(``)}
            }
          `),
        )
        .join('\n')}

      // Controllers
      ${Object.values(this.schema.resources)
        .map((resource) =>
          c(`
            class ${resource.naming.pascalCase}Controller {
              async list${resource.naming.pascalCasePlural}() {
                return request('get', '/${resource.naming.kebabCasePlural}', {}, {});
              }

              async get${resource.naming.pascalCase}(${resource.primaryKey}: ${resource.fields[resource.primaryKey].type}) {
                return request('get', '/${resource.naming.kebabCasePlural}/${resource.primaryKey}', {}, {});
              }

              async create${resource.naming.pascalCase}(data: ${resource.naming.pascalCase}) {
                return request('post', '/${resource.naming.kebabCasePlural}', {}, data);
              }

              async update${resource.naming.pascalCase}(${resource.primaryKey}: ${resource.fields[resource.primaryKey].type}, data: ${resource.naming.pascalCase}) {
                return request('put', '/${resource.naming.kebabCasePlural}/${resource.primaryKey}', {}, data);
              }

              async delete${resource.naming.pascalCase}(${resource.primaryKey}: ${resource.fields[resource.primaryKey].type}) {
                return request('delete', '/${resource.naming.kebabCasePlural}/${resource.primaryKey}', {}, {});
              }
            }
          `),
        )
        .join('\n')}
    `,
    );
  }

  generateTypes() {
    return code([
      // default types
      '// Default types',
      ...cd(`
          export type FileReference = {
            name: string;
            path: string;
            size: number;
            type: string;
          };
        `),

      '',
      '// Types',
      '',

      // iterate over resources
      code(
        Object.values(this.schema.resources).map((resource) =>
          code([
            `export type ${resource.naming.pascalCase} = {`,

            // iterate over fields
            ...Object.values(resource.fields).map((field) =>
              code(
                [
                  `${field.name}${field.nullable ? '?' : ''}: ${field.ref ? this.schema.resources[field.ref.resource].naming.pascalCase : this.mapType(field.type)}${field.iterable ? '[]' : ''};`,
                ],
                1,
              ),
            ),

            '};',
          ]),
        ),
        0,
        2,
      ),
    ]);
  }

  getSomeCode() {
    return c(`
      function epta2(s: string) {
        console.log('epta=', s);
      }
    `);
  }

  mapType(type: string) {
    if (type === 'integer' || type === 'float') {
      return 'number';
    }

    if (type === 'file') {
      return 'FileReference';
    }

    return type;
  }
}

function run() {
  const prismaSchema = new ClientGenerator(schema).generate();

  // console.log(JSON.stringify(prismaSchema, null, 2));
  console.log(prismaSchema);
}

run();

// utils

function c(code: string, indentation: number = 0) {
  let lines = code.split('\n');

  // console.log('[x] lines=', lines);

  while (lines[0].trim() === '') {
    lines.shift();
  }

  while (lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  // console.log('[x] 1 - lines=', lines);

  const detectedIndentation = lines[0].match(/^ +/)?.[0].length ?? 0;

  let onOff = false;

  lines = lines.map((line) => {
    if (line.length > 0 && line[0] !== ' ') {
      onOff = !onOff;
      return line.trimEnd();
    }

    if (onOff) {
      return line.trimEnd();
    }

    return line.slice(detectedIndentation).trimEnd();
  });

  // console.log('[x] lines=', JSON.stringify(lines, null, 2));

  // console.log('[x] indentation=', indentation);

  // for (const line of lines) {
  //   console.log('[x] line=', line);
  // }

  const indent = Array.from({ length: indentation }, () => ' ').join('');

  return '\n' + lines.map((line) => `${indent}${line}`).join('\n');

  return code.replace(/\n +/gm, '\n').replace(/\n/g, '\n');
}

function cd(code: string, indentation: number = 0) {
  let lines = code.split('\n');

  // console.log('[x] lines=', lines);

  while (lines[0].trim() === '') {
    lines.shift();
  }

  while (lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  // console.log('[x] 1 - lines=', lines);

  const detectedIndentation = lines[0].match(/^ +/)?.[0].length ?? 0;

  let onOff = false;

  lines = lines.map((line) => {
    if (line.length > 0 && line[0] !== ' ') {
      onOff = !onOff;
      return line.trimEnd();
    }

    if (onOff) {
      return line.trimEnd();
    }

    return line.slice(detectedIndentation).trimEnd();
  });

  // console.log('[x] lines=', JSON.stringify(lines, null, 2));

  // console.log('[x] indentation=', indentation);

  // for (const line of lines) {
  //   console.log('[x] line=', line);
  // }

  const indent = Array.from({ length: indentation }, () => ' ').join('');

  return lines.map((line) => `${indent}${line}`);
}

function code(lines: string[], tabs: number = 0, newLines: number = 1) {
  return lines
    .map(
      (line) =>
        t(tabs) + line.replace(/ +\n/gm, '\n').replace(/\n/g, '\n' + t(tabs)),
    )
    .join(nl(newLines));
}

function t(n: number = 1, x: number = 2) {
  let result = '';

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < x; j++) {
      result += ' ';
    }
  }

  return result;
}

function nl(n: number = 1) {
  let result = '';

  for (let i = 0; i < n; i++) {
    result += '\n';
  }

  return result;
}

export function request(
  method: string,
  path: string,
  params: Record<string, any>,
  body: Record<string, any>,
) {
  console.log('request=', method, path, params, body);
}
