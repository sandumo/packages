import { PrismaGenerator } from './generators/prisma.generator';
import { schema } from './schema';

function run() {
  const prismaSchema = new PrismaGenerator(schema).generate();

  console.log(prismaSchema);
}

run();
