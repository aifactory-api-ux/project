import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController, HealthController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../shared/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, HealthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
