import { Global, HttpModule, Module } from '@nestjs/common';
import { ApiConfigService } from './services/api-config.service';
import { GeneratorService } from './services/generator.service';
import { WatsonConfigService } from './services/watson-config.service';

const providers = [
    ApiConfigService,
    GeneratorService,
    WatsonConfigService
]

@Global()
@Module({
    providers,
    imports: [HttpModule],
    exports: [...providers, HttpModule]
})
export class SharedModule {}
