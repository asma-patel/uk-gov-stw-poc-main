import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Log } from '../../providers/utils/Log';

@Injectable()
export class ApiConfigService {
  private readonly log = new Log('ApiConfigService').config();

  constructor(private configService: ConfigService) { }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  private getNumber(key: string, defaultValue?: number): number {
    const value = this.configService.get(key, defaultValue);
    if (value === undefined) {
      throw new Error(key + ' env var not set'); // probably we should call process.exit() too to avoid locking the service
    }
    try {
      return Number(value);
    } catch {
      throw new Error(key + ' env var is not a number');
    }
  }

  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.configService.get(key, defaultValue?.toString());
    if (value === undefined) {
      throw new Error(key + ' env var not set');
    }
    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string, defaultValue?: string): string {
    const value = this.configService.get(key, defaultValue);

    if (!value) {
      this.log.warn(`"${key}" environment variable is not set`);
      return;
    }
    return value.toString().replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV', 'development');
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION', this.isDevelopment);
  }

  get authConfig() {
    return {
      jwtSecret: this.getString('JWT_SECRET_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
      version: this.getString('APP_VERSION')
    };
  }

  get watsonConfig() {
    return {
      version: '2020-09-24',
      apiKey: this.getString('ASSISTANT_APIKEY'),
      serviceUrl: this.getString('ASSISTANT_URL'),
      assistantId: this.getString("ASSISTANT_ID")
    };
  }

  get threeCEToken() {
    return this.getString("BEARER_TOKEN");
  }
}
