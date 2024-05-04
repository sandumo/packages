import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  static readonly SALT_ROUNDS = 10;

  async check(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  hash(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, HashService.SALT_ROUNDS);
  }
}
