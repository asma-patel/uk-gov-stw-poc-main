import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {ThreeCeModule} from '../../modules/three-ce/three-ce.module';
import {WatsonController} from './watson.controller';
import {WatsonService} from './watson.service';
import {TradeTariffModule} from '../../modules/trade-tariff/trade-tariff.module';

@Module({
    imports: [ThreeCeModule, HttpModule, TradeTariffModule],
    controllers: [WatsonController],
    providers: [WatsonService],
})
export class WatsonModule {}
