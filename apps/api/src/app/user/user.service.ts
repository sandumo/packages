import { Injectable } from '@nestjs/common';
import { HashService } from 'src/shared/services';

@Injectable()
export class UserService {
  constructor(private readonly hashService: HashService) {}
}
