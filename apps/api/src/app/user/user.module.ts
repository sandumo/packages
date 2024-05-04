import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [SharedModule],
  exports: [UserService],
})
export class UserModule {}
