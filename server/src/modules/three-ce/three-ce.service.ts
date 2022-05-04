import {CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {Cache} from 'cache-manager';
import {HttpService} from '@nestjs/axios';
import {ThreeCEDto} from './dto/threeCEDto.dto';
import {Interactions} from './interface/interaction.interface';
import {Log} from '../../providers/utils/Log';
import {ApiConfigService} from '../../shared/services/api-config.service';
import {Axios} from 'axios';
import {IWatsonProcess} from '../../IModules/IWatsonProcess';
import {ThreeCEDataDto} from './dto/threeCEdataDto.dto';
import AssistantV2 from 'ibm-watson/assistant/v2';
import {WatsonConfigService} from 'shared/services/watson-config.service';
import {NewMessageDto} from '../../modules/watson/dto/newMessage.dto';
import {
    ChosenCharacteristics,
    ThreeCECharacteristics,
    WatsonOptions,
} from './interface/threeCECharacteristics.interface';
import {CURRENT_PROCESS} from '../../shared/constants';
import {json} from 'stream/consumers';

@Injectable()
export class ThreeCeService implements IWatsonProcess {
    private defaultUrl: string = 'https://info.stage.3ceonline.com/ccce/apis/';
    private log = new Log('ThreeCEService').api();
    private axios = new Axios();
    private assistant: AssistantV2;
    private context: any;

    constructor(
        private httpService: HttpService,
        private apiConfigService: ApiConfigService,
        private watsonConfigService: WatsonConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.assistant = this.watsonConfigService.getAssistant();
    }

    public async processResponse(
        response: AssistantV2.MessageResponse,
        message: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        const responseType: boolean = await this.getResponseType(response);
        this.context = response.context.skills['main skill'].user_defined;

        if (this.context.current_process == CURRENT_PROCESS.CHARACTERISTICS) {
            this.log.debug(CURRENT_PROCESS.CHARACTERISTICS);
            return await this.processCharacteristics(response, message);
        } else if (this.context.current_process == CURRENT_PROCESS.ASSUMED_CHARACTERISTICS) {
            this.log.debug(CURRENT_PROCESS.ASSUMED_CHARACTERISTICS);
            return await this.processAssumedCharacteristics(response, message);
        } else if (this.context.proddesc.length > 0 && responseType) {
            this.log.debug('new Product');
            return await this.handleNewProductDescription(response, message);
        } else if (this.context.current_process == CURRENT_PROCESS.START_FINAL_HSCODE_DIGIT) {
            this.log.debug('FINAL CODE');
            return await this.processToFindTheFull10DigitsHsCode(response, message);
        }

        return response;
    }

    private async processAssumedCharacteristics(
        watsonResponse: AssistantV2.MessageResponse,
        message: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        this.log.debug(JSON.stringify(message.threeCEOption));
        const messageToSendTo3CE: ThreeCECharacteristics = {
            txid: this.context.txId,
            state: 'continue',
            interactionid: message.threeCEOption.interactionId,
            values: [
                {
                    first: message.threeCEOption.values.first,
                    second: message.threeCEOption.values.second,
                },
            ],
        };

        const threeCEResponse = await this.pickACharacteristic(messageToSendTo3CE);

        this.log.debug(JSON.stringify(threeCEResponse));

        if (
            threeCEResponse.characteristics != null &&
            threeCEResponse.characteristics.category != null
        ) {
            watsonResponse.output.generic.forEach(async (response: WatsonOptions) => {
                if (response.response_type == 'option') {
                    response.options = [];
                    response = await this.replaceWatsonOptionsWithCustom(
                        threeCEResponse,
                        'characteristics',
                        'attrs',
                        response,
                    );
                } else if (response.response_type == 'text') {
                    response.text = `Category: ${this.upperCaseFirstLetter(
                        threeCEResponse.characteristics.category,
                    )}`;
                }
            });

            this.context.current_question = threeCEResponse.characteristics.category;
            this.context.hscode = '';
        } else {
            if (
                threeCEResponse.currentInteractionQuestion != null &&
                threeCEResponse.currentInteractionQuestion.attrs.length > 0
            ) {
                this.context.current_process = CURRENT_PROCESS.CHARACTERISTICS;
            } else {
                this.context.current_process = CURRENT_PROCESS.FINAL_HSCODE_DIGIT;
                this.context.hscode = threeCEResponse.hsCode;
            }

            const messageToWatson = '3ce has completed this step';
            const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(
                message.session_id,
                messageToWatson,
            );
            payload.context = message.context;
            payload.context.skills['main skill'].user_defined = this.context;

            const watsonData = await this.watsonConfigService.getAssistant().message(payload);
            watsonResponse = watsonData.result;

            this.log.debug('Got data');

            if (
                threeCEResponse.currentInteractionQuestion != null &&
                threeCEResponse.currentInteractionQuestion.attrs.length > 0
            ) {
                this.log.debug('We are here');
                watsonResponse = await this.processCharacteristics(watsonResponse, message);
            }
        }

        return watsonResponse;
    }

    private async handleNewProductDescription(
        watsonResponse: AssistantV2.MessageResponse,
        message: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        let productFound: boolean = true;

        const threeCEResponse = await this.postDescribeProduct(this.context.proddesc);
        this.context.txId = threeCEResponse.txId;
        this.context.product_name = threeCEResponse.name;

        //When the product has no charateristics and has hscode so we just take the 6 digit hscode
        if (
            threeCEResponse.hsCode.length > 0 &&
            threeCEResponse.characteristics.category != null &&
            threeCEResponse.currentInteractionQuestion != null
        ) {
            this.context.hscode = threeCEResponse.hsCode;
        } else if (threeCEResponse.name == 'Unknown Item') {
            // When the description returns absolutely nothing
            productFound = false;
        } else {
            if (threeCEResponse.characteristics.category != null) {
                this.log.debug('Assumed Characteristics');
                this.context.current_question = threeCEResponse.characteristics.category;
                this.context.current_process = CURRENT_PROCESS.ASSUMED_CHARACTERISTICS;
            } else {
                this.context.current_question = threeCEResponse.currentInteractionQuestion.label;
                this.context.current_process = CURRENT_PROCESS.CHARACTERISTICS;
            }
        }

        if (productFound) {
            this.log.debug('Product found');
            const messageToWatson = `We have your product description ${threeCEResponse.txId}`;
            const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(
                message.session_id,
                messageToWatson,
            );
            payload.context = message.context;
            payload.context.skills['main skill'].user_defined = this.context;

            const watsonData = await this.watsonConfigService.getAssistant().message(payload);
            watsonResponse = watsonData.result;
            watsonResponse.output.generic.forEach(async (response: WatsonOptions) => {
                if (response.response_type == 'option') {
                    response.options = [];

                    if (threeCEResponse.characteristics.category != null) {
                        response = await this.replaceWatsonOptionsWithCustom(
                            threeCEResponse,
                            'characteristics',
                            'attrs',
                            response,
                        );
                    } else {
                        response = await this.replaceWatsonOptionsWithCustom(
                            threeCEResponse,
                            'currentInteractionQuestion',
                            'attrs',
                            response,
                        );
                    }
                }
            });

            watsonResponse.output.generic[2]['text'] = `Category: ${this.upperCaseFirstLetter(
                threeCEResponse.characteristics.category,
            )}`;
            return watsonResponse;
        } else {
            const messageToWatson = `No product found for the description`;
            const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(
                message.session_id,
                messageToWatson,
            );
            payload.context = this.context;

            const watsonData = await this.assistant.message(payload);
            watsonResponse = watsonData.result;

            return watsonResponse;
        }
    }

    private async processCharacteristics(
        watsonResponse: AssistantV2.MessageResponse,
        message: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        const messageToSendTo3CE: ThreeCECharacteristics = {
            txid: this.context.txId,
            state: 'continue',
            interactionid: message.threeCEOption.interactionId,
            values: [
                {
                    first: message.threeCEOption.values.first,
                    second: message.threeCEOption.values.second,
                },
            ],
        };

        this.log.debug('Process Characteristics');

        const threeCEResponse = await this.pickACharacteristic(messageToSendTo3CE);

        if (
            threeCEResponse.currentInteractionQuestion != null &&
            threeCEResponse.currentInteractionQuestion.attrs.length > 0
        ) {
            let updateText: boolean = true;
            if (watsonResponse.output.generic.length > 2) {
                updateText = false;
            }

            watsonResponse.output.generic.forEach(async (response: WatsonOptions) => {
                if (response.response_type == 'option') {
                    response.options = [];
                    response = await this.replaceWatsonOptionsWithCustom(
                        threeCEResponse,
                        'currentInteractionQuestion',
                        'attrs',
                        response,
                    );
                } else if (response.response_type == 'text' && updateText) {
                    response.text = `Now can you tell us more about the ${threeCEResponse.currentInteractionQuestion.name}`;
                }
            });

            this.context.current_question = threeCEResponse.currentInteractionQuestion.name;
            this.context.hscode = '';
        } else {
            this.context.current_process = CURRENT_PROCESS.FINAL_HSCODE_DIGIT;
            this.context.hscode = threeCEResponse.hsCode;

            const messageToWatson = 'We have your product description';
            const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(
                message.session_id,
                messageToWatson,
            );
            payload.context = message.context;
            payload.context.skills['main skill'].user_defined = this.context;

            const watsonData = await this.watsonConfigService.getAssistant().message(payload);
            watsonResponse = watsonData.result;
        }

        return watsonResponse;
    }

    private async replaceWatsonOptionsWithCustom(
        threeCEDResponse: ThreeCEDataDto,
        mainObject: string,
        subObject: string,
        response: WatsonOptions,
    ) {
        threeCEDResponse[mainObject][subObject].forEach(option => {
            response.options.push({
                label: this.upperCaseFirstLetter(option.name),
                value: {
                    input: {
                        options: {
                            id: option.id,
                            interactionId: threeCEDResponse[mainObject].id,
                        },
                        text: 'empty',
                    },
                },
            });
        });

        return response;
    }

    /**
     *
     * Send the product description to 3CE
     *
     * @param proddesc
     * @returns
     */
    public async postDescribeProduct(proddesc: string): Promise<ThreeCEDataDto> {
        let response: ThreeCEDto;
        let assumedInteractions: Interactions[] = [];
        let currentItemInteractions: Interactions[] = [];

        const jsonToSend = {
            proddesc: proddesc,
            lang: 'eng',
            state: 'start',
            profileId: '',
        };

        try {
            response = await this.httpService
                .post(this.defaultUrl + 'classify/v1/interactive/classify-start', jsonToSend, {
                    headers: {
                        'Content-Type': 'application/json',
                        accept: 'application/json',
                        Authorization: `bearer ${this.apiConfigService.threeCEToken}`,
                        'Accept-Language': 'en',
                    },
                })
                .toPromise()
                .then(res => res.data.data)
                .catch(err => {
                    throw err;
                });
        } catch (err) {
            this.log.error(err);
            throw new HttpException("There's an issue communicating with 3CE, Contact Support.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        let assumedCharacteristics: Interactions;

        if (response.assumedInteractions) {
            for (let index = 0; index < response.assumedInteractions.length; index++) {
                let interaction = response.assumedInteractions[index];
                if (interaction.inputType != 'specified by user') {
                    assumedCharacteristics = interaction;

                    break;
                }
            }
        }

        const data: ThreeCEDataDto = {
            prouctName: proddesc,
            txId: response.txId,
            name: response.currentItemName,
            characteristics: assumedCharacteristics,
            currentInteractionQuestion: response.currentQuestionInteraction,
            currentItemInteractions: response.currentItemInteraction,
            hsCode: response.hsCode,
        };

        return data;
    }

    /**
     * This is called after we get the product description and then we start drilling down to get the users assumptions
     *
     * @param threeCECharacteristics
     * @returns
     */
    public async pickACharacteristic(
        threeCECharacteristics: ThreeCECharacteristics,
    ): Promise<ThreeCEDataDto> {
        let response: ThreeCEDto;
        let assumedInteractions: Interactions[] = [];
        let currentItemInteractions: Interactions[] = [];

        try {
            response = await this.httpService
                .post(
                    this.defaultUrl + 'classify/v1/interactive/classify-continue',
                    threeCECharacteristics,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            accept: 'application/json',
                            Authorization: `bearer ${this.apiConfigService.threeCEToken}`,
                            'Accept-Language': 'en',
                        },
                    },
                )
                .toPromise()
                .then(res => res.data.data)
                .catch(err => {
                    this.log.error(err);
                    throw new HttpException("There's an issue communicating with 3CE, Contact Support.", HttpStatus.INTERNAL_SERVER_ERROR);
                });
        } catch (err) {
            this.log.error(err);
            throw new HttpException("There's an issue communicating with 3CE, Contact Support.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        let assumedCharacteristics: Interactions;

        if (response.assumedInteractions) {
            for (let index = 0; index < response.assumedInteractions.length; index++) {
                let interaction = response.assumedInteractions[index];
                if (interaction.inputType != 'specified by user') {
                    assumedCharacteristics = interaction;

                    break;
                }
            }
        }

        const data: ThreeCEDataDto = {
            prouctName: this.context.proddesc,
            txId: response.txId,
            name: response.currentItemName,
            characteristics: assumedCharacteristics,
            currentInteractionQuestion: response.currentQuestionInteraction,
            currentItemInteractions: response.currentItemInteraction,
            hsCode: response.hsCode,
        };

        return data;
    }

    private async getResponseType(response: AssistantV2.MessageResponse): Promise<boolean> {
        let responseType = false;
        if (response.output.entities && response.output.entities.length > 0) {
            response.output.entities.forEach(entity => {
                if (entity.entity == 'ResponseTypes') {
                    responseType = entity.value == 'Positive' ? true : false;
                }
            });
        }

        return responseType;
    }

    private upperCaseFirstLetter(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    /////////////// Process and remove any thing from the commodity code ///////////////////////

    private async processToFindTheFull10DigitsHsCode(
        watsonResponse: AssistantV2.MessageResponse,
        message: NewMessageDto,
    ): Promise<AssistantV2.MessageResponse> {
        // How the data is
        /*
        "taxes": [],
        "uom": null,
        "duties": null,
        "errorCode": null,
        "desc": null,
        "code": null,
        "children": [
            {
                "taxes": [],
                "uom": "",
                "duties": {},
                "errorCode": null,
                "desc": "SECTION IV - PREPARED FOODSTUFFS; BEVERAGES, SPIRITS AND VINEGAR; TOBACCO AND MANUFACTURED TOBACCO SUBSTITUTES",
                "code": "IV",
                "children": [
                    {
                    }
                ],
                "errorMessage": null,
                "id": "00_04",
                "type": "SECTION"
            }
        ],
        "errorMessage": null,
        "id": null,
        "type": null
        */

        this.log.debug(JSON.stringify(watsonResponse.output.generic));
        let hscode = this.context.hscode;
        if (message.message.length > 2) {
            if (this.context.hscode != message.message) {
                hscode = message.message;
            }
        }

        const threeCECommodities = await this.getFinalCommodities(hscode);
        this.log.debug(`Hscode ${hscode}`);
        this.log.debug(`has Children ${threeCECommodities.children.length}`);
        let currentHsCodeChildren = [{}];
        let foundHsCode = '';

        function loopThroughChildren(children) {
            children.forEach(child => {
                if (child.children.length > 1 && child.type == 'ITEM') {
                    currentHsCodeChildren = child.children;
                } else if (child.id == hscode) {
                    currentHsCodeChildren = child.children;
                    foundHsCode = child.code;
                } else if (child.code.length == 0 && hscode.length < 7) {
                    currentHsCodeChildren = child.children;
                } else {
                    loopThroughChildren(child.children);
                }
            });
        }

        loopThroughChildren(threeCECommodities['children']);

        if (currentHsCodeChildren.length > 0) {
            this.log.debug('WE here');
            this.log.debug(JSON.stringify(watsonResponse.output.generic.length));
            //send the children
            watsonResponse.output.generic.forEach(async (response: WatsonOptions) => {
                if (response.response_type == 'option') {
                    response.options = [];
                    currentHsCodeChildren.forEach(child => {
                        this.log.debug(child['desc']);
                        response.options.push({
                            label: this.removeDashesInText(child['desc']),
                            value: {
                                input: {
                                    text: child['id'],
                                },
                            },
                        });
                    });
                } else if (response.response_type == 'text') {
                    response.text = `Please select the most appropriate description of your goods from the list below`;
                }
            });

            this.context.hscode = hscode;
            watsonResponse.context.skills['main skill'].user_defined = this.context;
        } else {
            this.log.debug('Found hscode');
            this.context.current_process = '';
            const messageToWatson = `r4e ${foundHsCode}`;
            const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(
                message.session_id,
                messageToWatson,
            );
            payload.context = message.context;
            payload.context.skills['main skill'].user_defined = this.context;

            const watsonData = await this.watsonConfigService.getAssistant().message(payload);
            watsonResponse = watsonData.result;
        }

        // const test: AssistantV2.MessageResponse = null;
        return watsonResponse;
    }

    public async getFinalCommodities(hsCode: string): Promise<any> {
        let response: ThreeCEDto;
        let assumedInteractions: Interactions[] = [];
        let currentItemInteractions: Interactions[] = [];

        try {
            response = await this.httpService
                .get(this.defaultUrl + `tradedata/import/v1/schedule/${hsCode}/FR/GB`, {
                    headers: {
                        'Content-Type': 'application/json',
                        accept: 'application/json',
                        Authorization: `bearer ${this.apiConfigService.threeCEToken}`,
                        'Accept-Language': 'en',
                    },
                })
                .toPromise()
                .then(res => res.data)
                .catch(err => {
                    throw err;
                });
        } catch (err) {
            this.log.error(err);
            throw new HttpException("There's an issue communicating with 3CE, Contact Support.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    private removeDashesInText(text: string) {
        let deleteIndex = [];

        for (let index = 0; index < text.length; index++) {
            if (text[index] == '-') {
                deleteIndex.push(index);
            }
        }

        if (deleteIndex.length > 0) {
            let index = deleteIndex.length - 1;
            return text.slice(deleteIndex[index] + 1);
        } else {
            return text;
        }
    }
}
