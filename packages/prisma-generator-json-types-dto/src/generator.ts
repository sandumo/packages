import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import { GENERATOR_NAME } from './constants';
import { writeFileSafely } from './utils/writeFileSafely';

const { version } = require('../package.json');

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`);
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const output = options.generator.output!.value!;

    const { importTypesPath } = options.generator.config;

    const typeMappings: Record<string, string> = {
      String: 'string',
      Int: 'number',
      Float: 'number',
      Boolean: 'boolean',
      DateTime: 'Date',
      Json: 'Record<string, any>',
    };

    let importPrisma = false;
    let importCustomTypes: string[] = [];

    let content = '';

    options.dmmf.datamodel.models.forEach(async (model) => {
      content += `${content && '\n'}export class ${model.name} {\n${model.fields
        .map((field) => {
          const { isRequired, isList, type, documentation } = field;

          let tsType = typeMappings[type] || type;

          if (type === 'Json' && documentation) {
            try {
              tsType = `${documentation.slice(1, -1)}`;
              importCustomTypes = [...importCustomTypes.filter(type => type !== tsType), tsType];
            } catch (e) {}
          }

          return `  ${field.name}: ${tsType}${isList ? '[]' : ''}${isRequired ? '' : ' | null'};`;
        })
        .join('\n')}\n}\n`;
    });

    if (importPrisma) {
      content = `import { Prisma } from '@prisma/client';\n\n${content}`;
    }

    if (importCustomTypes.length) {
      content = `import { ${importCustomTypes.map(type => type).join(', ')} } from '${importTypesPath}';\n\n${content}`;
    }

    await writeFileSafely(output, content);
  },
});
