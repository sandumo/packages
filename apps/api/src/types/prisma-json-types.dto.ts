// export { FileReference } from 'file-reference';
import * as FR from 'file-reference';

export class FileReference extends FR.FileReference {
  name: string;
  path: string;
  size: number;
  type: string;
}
