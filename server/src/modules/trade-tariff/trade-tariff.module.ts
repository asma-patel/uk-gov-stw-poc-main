import { CacheModule, Module } from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import { TradeTariffService } from './trade-tariff.service';
import { TradeTariffController } from './trade-tariff.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [HttpModule, SharedModule, CacheModule.register()],
  providers: [TradeTariffService],
  controllers: [TradeTariffController],
  exports: [TradeTariffService]
})
export class TradeTariffModule {}
