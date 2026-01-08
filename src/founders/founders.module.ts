import { Module } from '@nestjs/common';
import { FoundersController } from './founders.controller';
import { FoundersService } from './founders.service';

@Module({
  controllers: [FoundersController],
  providers: [FoundersService],
})
export class FoundersModule {}
