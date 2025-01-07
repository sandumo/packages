import { FileReference } from '@sandumo/file-reference';
// export {};

// declare global {
//   namespace Types {
//     class FileReference {
//       name: string;
//       path: string;
//       size: number;
//       type: string;
//     }
//   }
// }

declare global {
  namespace PrismaJson {
    // type FileReference = Types.FileReference;
    export { FileReference }; // from 'file-reference';
  }
}

declare module '@prisma/client' {
  namespace Prisma {
    // class FileReference extends Types.FileReference {}
    // import FileReference = Types.FileReference;
    export { FileReference }; // from 'file-reference';
  }
}
