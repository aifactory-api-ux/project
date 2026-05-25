import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchEntity } from './entities/dispatch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DispatchEntity])],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}