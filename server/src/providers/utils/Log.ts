import { Logger } from 'winston';
import { LoggerFactory } from './Logging.provider';

export class Log {
  className: string;

  constructor(className: string) {
    this.className = className;
  }

  public server = (): Logger => {
    return new LoggerFactory(this.className).getLogger('server');
  };

  public api = (): Logger => {
    return new LoggerFactory(this.className).getLogger('API');
  };

  public config = (): Logger => {
    return new LoggerFactory(this.className).getLogger('Config');
  };

  //   public server: Logger = new LoggerFactory(this.className).getLogger('API');
  //   public static api: Logger = LoggerFactory.api;
}
