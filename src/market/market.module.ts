import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
