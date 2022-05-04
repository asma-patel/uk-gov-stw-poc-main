import { CacheModule, Module } from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import { ThreeCeService } from './three-ce.service';
import { ThreeCeController } from './three-ce.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [HttpModule, SharedModule, CacheModule.register()],
  providers: [ThreeCeService],
  controllers: [ThreeCeController],
  exports: [ThreeCeService]
})
export class ThreeCeModule {}
