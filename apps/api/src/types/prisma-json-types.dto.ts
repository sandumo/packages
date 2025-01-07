// export { FileReference } from 'file-reference';
import * as FR from '@sandumo/file-reference';

export class FileReference extends FR.FileReference {
  name: string;
  path: string;
  size: number;
  type: string;
}
