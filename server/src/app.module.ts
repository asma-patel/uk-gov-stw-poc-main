import { MiddlewareConsumer, Module, NestModule, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { contextMiddleware } from './middlewares';
import { WatsonModule } from './modules/watson/watson.module';
import { TradeTariffModule } from './modules/trade-tariff/trade-tariff.module';
import { ProcedureModule } from 'modules/procedure/procedure.module';

@Module({
  imports: [
    WatsonModule,
    TradeTariffModule,
    SharedModule,
    ProcedureModule,
    CacheModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes('*');
  }
}