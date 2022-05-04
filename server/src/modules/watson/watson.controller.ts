import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { WatsonConfigService } from '../../shared/services/watson-config.service';
import { Log } from '../../providers/utils/Log';
import { WatsonService } from './watson.service';
import AssistantV2 from 'ibm-watson/assistant/v2';
import { NewMessageDto } from './dto/newMessage.dto';
import { Axios } from 'axios';
import { HttpService } from '@nestjs/axios';
import { readFile, readFileSync } from 'fs';

@Controller()
export class WatsonController {
  private readonly log = new Log('WatsonController').api();
  private axios = new Axios;

  constructor(
    private watsonService: WatsonService,
    private watsonConfigService: WatsonConfigService,
    private httpService: HttpService
  ) { }

  @Post('/api/message/')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: NewMessageDto,
    description: 'Send message to Watson',
  })
  async message(@Body() message: NewMessageDto): Promise<AssistantV2.MessageResponse> {
    this.log.info('Received message to send to Watson');
    return await this.watsonService.sendMessageToWatson(message);
  }

  @Get('/api/session')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get Watson session Id',
  })
  async getSessionId(): Promise<String> {
    return await (await this.watsonConfigService.createSession()).result.session_id;
  }

  @Get('/api/procedure')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get procedure codes',
  })
  async getProcedureCode(): Promise<any> {
    const returnData = readFileSync('./CLEOJSON.json', { encoding: 'utf8', flag: 'r' });

    return returnData;
  }

}
