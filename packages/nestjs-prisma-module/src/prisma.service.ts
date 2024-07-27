import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService extends getExtendedClient() {}

function getExtendedClient() {
  const client = () =>
    new PrismaClient().$extends(
      createSoftDeleteExtension({
        models: {
          Product: {
            field: 'deletedAt',
            createValue: (deleted) => {
              if (deleted) return new Date();
              return null;
            },
          },
        },
      }),
    );

  return class {
    // wrapper with type-safety 🎉
    constructor() {
      return client();
    }
  } as new () => ReturnType<typeof client>;
}
