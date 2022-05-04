import { Injectable } from '@nestjs/common';
import { ApiConfigService } from './api-config.service';
import AssistantV2 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';
import { Log } from '../../providers/utils/Log';

@Injectable()
export class WatsonConfigService {
  private assistant: AssistantV2;

  private log = new Log('WatsonConfigService').config();

  constructor(private apiConfigService: ApiConfigService) {
    this.configureWatson();
  }

  private async configureWatson() {
    this.assistant = new AssistantV2({
      version: this.apiConfigService.watsonConfig.version,
      authenticator: new IamAuthenticator({
        apikey: this.apiConfigService.watsonConfig.apiKey,
      }),
      serviceUrl: this.apiConfigService.watsonConfig.serviceUrl,
    });
  }

  public async createSession(): Promise<AssistantV2.Response> {
    this.log.info('Getting session Id');
    const sessionId = await this.assistant.createSession({
      assistantId: this.apiConfigService.watsonConfig.assistantId,
    });
    return sessionId;
  }

  public getAssistant(): AssistantV2 {
    return this.assistant;
  }

  public async createPayload(sessionId: string, text: string): Promise<AssistantV2.MessageParams> {
    return {
      assistantId: this.apiConfigService.watsonConfig.assistantId,
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: text,
        options: {
          return_context: true,
        },
      },
      context: {}
    }
  }
}
