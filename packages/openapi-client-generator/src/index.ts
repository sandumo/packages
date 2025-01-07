import fs from 'fs';
import { SpecMethod, SpecMethodParameter, SpecMethodResponse } from './types';
import path from 'path';
import * as fsExtra from 'fs-extra';
import { code, firstLetterToUpperCase, genProp } from './utils';

// Config
const packageJson = {
  name: 'api-client',
  version: '0.0.0',
};

// function run() {
//   const pathToSpec = path.join(__dirname, '../../api/openapi-spec.json');
//   const pathToOutput = path.join(__dirname, `../../../packages/${packageJson.name}`);

//   console.log('Generating api client code...');

//   gen({
//     pathToSpec,
//     pathToOutput,
//   });

//   console.log('Generated api client code');

//   if (isWatchMode()) {
//     fs.watchFile(pathToSpec, () => {
//       console.log('Spec file changed. Regenerating client code...');

//       gen({
//         pathToSpec,
//         pathToOutput,
//       });

//       console.log('Api client code generated successfully.');
//     });
//   }
// }

// run();

// functions

// function gen(config: { pathToSpec: string, pathToOutput: string }) {
//   const schema = JSON.parse(fs.readFileSync(config.pathToSpec, 'utf8'));

//   const types = schema.components.schemas;

//   // Types
//   const gTypes: string[] = [];

//   for (const typeName in types) {
//     const type = types[typeName];
//     gTypes.push(handleSchema(typeName, type));
//   }

//   const controllers = devidePathsIntoControllers(schema.paths);
//   const gControllers = Object.keys(controllers).map(controllerName => genController(controllerName, controllers[controllerName]));
//   const gExport = genExport(controllers);

//   const gCode = code([
//     '// Imports',
//     genImports(),
//     '',
//     '// Types',
//     code(gTypes, 0, 2),
//     '',
//     '// Controllers',
//     code(gControllers, 0, 2),
//     '',
//     '// Export',
//     gExport,
//     '',
//   ]);

//   fs.mkdirSync(path.join(config.pathToOutput, 'src'), { recursive: true });
//   fs.writeFileSync(path.join(config.pathToOutput, 'src/index.ts'), gCode);

//   genPackageJson(config.pathToOutput);

//   copyLib(config.pathToOutput);
// }

function copyLib(pathToOutput: string) {
  fsExtra.copySync(path.join(__dirname, 'lib'), path.join(pathToOutput, 'src/lib'));
}

function genImports() {
  return code([
    "import axios from 'axios';",
    // "import { getQueryKey, toFormData } from './lib';",
    // "import { config } from './lib/config';",
    // "import { cache } from './lib/cache';",
  ]);
}

function genPackageJson(pathToOutput: string) {
  fs.writeFileSync(path.join(pathToOutput, 'package.json'), code([
    '{',
    `  "name": "${packageJson.name}",`,
    `  "version": "${packageJson.version}",`,
    '  "description": "",',
    '  "main": "./src/index.ts",',
    '  "types": "./src/index.ts",',
    '  "dependencies": {',
    '    "axios": "latest"',
    '  },',
    '  "devDependencies": {',
    '    "eslint": "^7.32.0",',
    '    "eslint-config-custom": "workspace:*",',
    '    "tsconfig": "workspace:*",',
    '    "typescript": "^4.5.2"',
    '  }',
    '}',
  ]));
}

function genExport(controllers: Record<string, any>) {
  return code([
    'const api = {',
    code(Object.keys(controllers).map(controller => code([`${controller}: new ${firstLetterToUpperCase(controller)}Controller(),`])), 1),
    code(['axios,'], 1),
    code(['cache,'], 1),
    '  config,',
    '};',
    '',
    'export default api;',
  ]);
}

function genController(name: string, paths: any) {
  const gMethods: string[] = [];

  for (const path in paths) {
    const methods = paths[path];

    for (const method in methods) {
      gMethods.push(genMethod(method, path, methods[method]));
    }
  }

  return code([
    `class ${firstLetterToUpperCase(name)}Controller {`,
    `${code(gMethods, 1, 2)}`,
    '}',
  ]);
}

function genMethod(httpMethod: string, path: string, options: SpecMethod) {
  const controllerName = options.operationId.split('_')[0] || 'unknown';
  const controllerStdName = pascalToKebab(controllerName.replace('Controller', ''));
  const methodName = options.operationId.split('_')[1] || 'unknown';

  const name = methodName;

  const pathParams = getMethodParams(options.parameters);
  const passParams = genPassParams(options.parameters);
  const returnType = getMethodReturnType(options.responses);
  const pathWithParams = getMethodPath(path, options.parameters);
  const queryType = getQueryType(options.parameters);
  const bodyType = getBodyType(options.requestBody);
  const axiosCofig = genAxiosConfig(options);

  const params = [
    pathParams,
    queryType ? `query: ${queryType}` : '',
    bodyType ? `body: ${bodyType}` : '',
  ].filter(_ => !!_).join(', ');

  let append = '';

  if (['post', 'put'].includes(httpMethod) && bodyType) {
    if (options.requestBody?.content?.['multipart/form-data']) {
      append = ', toFormData(body)';
    } else {
      append = ', body';
    }
  }

  if (queryType) {
    append += ', { params: query }';
  }

  if (axiosCofig) {
    append += `, ${axiosCofig}`;
  }

  return code([
    '/**',
    // ' * Description',
    // ' * @see {@link ExampleController@getExample}',
    ` * @see file://./../../../apps/api/src/app/${controllerStdName}/${controllerStdName}.controller.ts#${controllerName}#${methodName}`,
    ' */',
    `async ${name}(${params}): Promise<${returnType} | false> {`,
    `  const response = await axios.${httpMethod}(${pathWithParams}${append});`,
    ...(httpMethod !== 'get' ? [code([
      '',
      'if (Math.floor(response.status / 100) === 2) {',
      `  cache.invalidate(getQueryKey(${pathWithParams}).slice(0, 1));`,
      '}',
    ], 1)] : []),
    '',
    code([
      'if (Math.floor(response.status / 100) !== 2) {',
      '  return false;',
      '}',
    ], 1),
    '',
    '  return response.data;',
    '}',
    ...(httpMethod === 'get' ? [code([
      '',
      `${name}Query(${params}) {`,
      '  return {',
      `    queryKey: [...getQueryKey(${pathWithParams})${queryType ? ', query' : ''}],`,
      `    queryFn: (): Promise<${returnType}> => this.${name}(${passParams}) as Promise<${returnType}>,`,
      '  };',
      '}',
    ])] : []),
  ]);
}

// ./../../../apps/api/src/main.ts

/**
 * This function takes a string that is in camelCase and converts it to kebab-case.
 */
function camelToKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function pascalToKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/^-/, '');
}

function genAxiosConfig(options: SpecMethod) {
  if (options.requestBody?.content?.['multipart/form-data']) {
    return '{ headers: { \'Content-Type\': \'multipart/form-data\' } }';
  }

  return '';
}

function genPassParams(params: SpecMethodParameter[]) {
  const paramsArray: string[] = [];

  for (const key in params.filter(param => param.in === 'path')) {
    const param = params[key];
    paramsArray.push(`${param.name}`);
  }

  if (params.filter(param => param.in === 'query').length) {
    paramsArray.push('query');
  }

  return paramsArray.join(', ');
}

function getMethodReturnType(responses: { [x: '200' | 'default' | string]: SpecMethodResponse }) {
  let result = 'any';

  for (const key in responses) {
    if (Object.prototype.hasOwnProperty.call(responses, key)) {
      const response = responses[key];

      if (response.content) {
        for (const key in response.content) {
          if (Object.prototype.hasOwnProperty.call(response.content, key)) {
            if (key === 'application/json') {
              const content = response.content[key];

              if (content.schema) {
                if (content.schema.type) {
                  if (content.schema.type === 'array') {
                    if (content.schema.items.type !== undefined && content.schema.items.type) {
                      if (content.schema.items.type === 'object') {
                        result = 'Record<string, any>[]';
                      } else {
                        result = content.schema.items.type + '[]';
                      }
                    } else {
                      try {
                        return content.schema.items.$ref?.split('/').pop() + '[]';
                      } catch (error) {
                        console.log('[x] errr', response, content.schema);
                      }
                    }
                  }
                } else {
                  try {
                    result = content.schema.$ref.split('/').pop() || 'any';
                  } catch (error) {
                    console.log('[x] errr', content.schema);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return result;
}

function getMethodParams(params: SpecMethodParameter[]) {
  const paramsArray: string[] = [];

  for (const key in params.filter(param => param.in === 'path')) {
    const param = params[key];
    paramsArray.push(`${param.name}${param.required ? '' : '?'}: ${param.schema.type}`);
  }

  return paramsArray.join(', ');
}

function getQueryType(params: SpecMethodParameter[]) {
  const paramsArray: string[] = [];

  for (const key in params.filter(param => param.in === 'query')) {
    const param = params[key];

    const type = param.schema.type === 'array' ? `${param.schema.items.type}[]` : param.schema.type;

    paramsArray.push(`${param.name}${param.required ? '' : '?'}: ${type}`);
  }

  if (paramsArray.length) {
    return `{ ${paramsArray.join('; ')} }`;
  }

  return '';
}

function getBodyType(requestBody: SpecMethod['requestBody']) {
  if (requestBody) {
    let type: string = 'any';

    if (requestBody.content?.['application/json']) {
      type = requestBody.content?.['application/json']?.schema?.$ref?.split('/').pop() || 'any';
    } else if (requestBody.content?.['multipart/form-data']) {
      type = requestBody.content?.['multipart/form-data']?.schema?.$ref?.split('/').pop() || 'any';
    }

    return type || '';
  }

  return '';
}

function getMethodPath(path: string, params: SpecMethodParameter[]) {
  let anyParam = false;

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const param = params[key];

      if (param.in === 'path') {
        anyParam = path.includes(`{${param.name}}`);
        path = path.replace(`{${param.name}}`, '${' + param.name + '}');
      }
    }
  }

  return anyParam ? '`' + path + '`' : `'${path}'`;
}

function handleSchema(name: string, schema: any) {
  const props: string[] = [];

  if (schema.type === 'object') {
    for (const key in schema.properties) {
      if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
        const element = schema.properties[key];

        const required = !!schema.required?.includes(key);

        if (element.type === 'string') {
          props.push(genProp(key, 'string', required));
        } else if (element.type === 'number') {
          props.push(genProp(key, 'number', required));
        } else if (element.type === 'boolean') {
          props.push(genProp(key, 'boolean', required));
        } else if (element.type === 'array') {
          if (element.items.$ref) {
            props.push(genProp(key, `${(element.items.$ref as string).split('/').pop()}[]`, required));
          } else if (element.items.format === 'binary') {
            props.push(genProp(key, 'File[]', required));
          } else {
            props.push(genProp(key, 'string[]', required));
          }
        } else if (element.type === 'object') {
          props.push(genProp(key, 'Record<string, any>', required));
        } else {
          if (element.$ref) {
            const ref = element.$ref.split('/').pop();

            props.push(genProp(key, ref, required));
          } else {
            console.log('[x] unknown type', element.type);
          }
        }
      }
    }
  } else {
    console.log('[x] schema -------------------', name, schema);
  }

  return code([
    `export type ${name} = {`,
    code(props, 1),
    '}',
  ]);
}

function devidePathsIntoControllers(paths: any) {
  const controllers: any = {};

  for (const path in paths) {
    if (Object.prototype.hasOwnProperty.call(paths, path)) {
      const methods = paths[path];

      for (const method in methods) {
        const methodOptions = methods[method];

        let controller = (methodOptions.operationId.split('_')[0] as string).replace('Controller', '');
        controller = controller[0].toLowerCase() + controller.slice(1);

        if (methodOptions.tags?.length) {
          controller = methodOptions.tags[0];
        }

        const parts = controller.split('-');

        if (parts.length > 1) {
          controller = parts[0] + parts.slice(1).map(part => firstLetterToUpperCase(part)).join('');
        }

        if (!controllers[controller]) {
          controllers[controller] = {};
        }

        if (!controllers[controller][path]) {
          controllers[controller][path] = {};
        }

        controllers[controller][path][method] = methodOptions;
      }
    }
  }

  return controllers;
}

// exports

type GeneratorOptions = {

}

export class OpenAPIClientGenerator {
  private schema: Record<string, any>;
  // private pathToSpecFile: string;
  private outputPath: string;

  constructor(options?: GeneratorOptions) {
    this.schema = {};
    this.outputPath = '';
  }

  fromSchema(schema: Record<string, any>) {
    this.schema = schema;

    return this;
  }

  toPath(path: string) {
    this.outputPath = path;

    return this;
  }

  generate() {
    console.log('Generating OpenAPI client code...');

    // const schema = JSON.parse(fs.readFileSync(config.pathToSpec, 'utf8'));

    const types = this.schema.components.schemas;

    // Types
    const gTypes: string[] = [];

    for (const typeName in types) {
      const type = types[typeName];
      gTypes.push(handleSchema(typeName, type));
    }

    const controllers = devidePathsIntoControllers(this.schema.paths);
    const gControllers = Object.keys(controllers).map(controllerName => genController(controllerName, controllers[controllerName]));
    const gExport = genExport(controllers);

    console.log('[x] epta got here', __dirname);

    const gCode = code([
      '// Utilities',
      fs.readFileSync(path.join(__dirname, 'raw-code.ts'), 'utf8'),
      '// Imports',
      genImports(),
      '',
      '// Types',
      code(gTypes, 0, 2),
      '',
      '// Controllers',
      code(gControllers, 0, 2),
      '',
      '// Export',
      gExport,
      '',
    ]);

    // fs.mkdirSync(path.join(this.outputPath, 'src'), { recursive: true });
    fs.writeFileSync(this.outputPath, gCode);

    // genPackageJson(this.outputPath);

    // copyLib(this.outputPath);

    console.log('Generated OpenAPI client code');
  }
}
