import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import AssistantV2 from 'ibm-watson/assistant/v2';
import {ChosenCharacteristics} from '../../modules/three-ce/interface/threeCECharacteristics.interface';
import {TradeTariffService} from '../../modules/trade-tariff/trade-tariff.service';
import {IWatsonProcess} from '../../IModules/IWatsonProcess';
import {ThreeCeService} from '../../modules/three-ce/three-ce.service';
import {Log} from '../../providers/utils/Log';
import {ApiConfigService} from '../../shared/services/api-config.service';
import {WatsonConfigService} from '../../shared/services/watson-config.service';
import {MessageDto} from './dto/message.dto';
import {NewMessageDto} from './dto/newMessage.dto';

@Injectable()
export class WatsonService {
    private message: AssistantV2.MessageContext;
    private log = new Log('WatsonService').api();
    constructor(
        private watsonConfigService: WatsonConfigService,
        private apiConfigService: ApiConfigService,
        private threeCEService: ThreeCeService,
        private tradeTariffService: TradeTariffService,
    ) {}

    /**
     * Sends message to watson
     *
     * @param messageDto
     */
    public async sendMessageToWatson(
        newMessageDto: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        const userDefinedSkills: AssistantV2.MessageContextSkill = {
            user_defined: {
                test: '',
                global_process: '',
            },
        };
        const context: AssistantV2.MessageContext = {
            skills: {
                'main skill': {
                    userDefinedSkills,
                },
            },
        };

        const assistant = this.watsonConfigService.getAssistant();
        const payload: AssistantV2.MessageParams = {
            assistantId: this.apiConfigService.watsonConfig.assistantId,
            sessionId: newMessageDto.session_id,
            input: {
                message_type: 'text',
                text: newMessageDto.message,
                options: {
                    return_context: true,
                },
            },
        };

        if (newMessageDto.isFirstCall || newMessageDto.context) {
            payload.context = newMessageDto.context || context;
        }

        let results;
        try {
            results = (await assistant.message(payload)).result;
        } catch (err) {
            this.log.error("An error has occured")
            throw new HttpException(err.message, err.code)
        }

        // const results = (await assistant.message(payload)).result;

        const global_process = results.context.skills['main skill'].user_defined.global_process;

        switch (global_process) {
            case 'find-commodity-code': {
                return await this.threeCEService.processResponse(results, newMessageDto);
            }
            case 'licence-obligations': {
                return await this.tradeTariffService.processResponse(results, newMessageDto);
            }
            default: {
                this.log.debug('Default watson process');
                break;
            }
        }

        return results;
    }
}
