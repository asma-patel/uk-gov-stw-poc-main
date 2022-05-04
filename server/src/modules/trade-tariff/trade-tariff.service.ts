import { CACHE_MANAGER, HttpService, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import AssistantV2 from 'ibm-watson/assistant/v2';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { IWatsonProcess } from '../../IModules/IWatsonProcess';
import { NewMessageDto } from '..//watson/dto/newMessage.dto';
import { WatsonConfigService } from '../../shared/services/watson-config.service';
import { Log } from '../../providers/utils/Log';
import { Measure, TradeTariffData, TradeTariffDoc } from './dto/TradeTariffData';
import { WatsonOptions } from '../three-ce/interface/threeCECharacteristics.interface';
import { CURRENT_PROCESS } from 'shared/constants';

//TODO work on error handling
@Injectable()
export class TradeTariffService implements IWatsonProcess {
    private log = new Log('TradeTariffService').api();
    private context: any;
    private assistant: AssistantV2;

    constructor(
        private httpService: HttpService,
        private apiConfigService: ApiConfigService,
        private watsonConfigService: WatsonConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.assistant = this.watsonConfigService.getAssistant();
    }

    public async processResponse(response: AssistantV2.MessageResponse, message: NewMessageDto): Promise<AssistantV2.MessageResponse> {
        this.context = response.context.skills['main skill'].user_defined;
        let finishedFindingLicence: boolean = false;
        let doNotEditText = false;

        //Get licences for user by their session id
        let tradeTariffData: TradeTariffData = new TradeTariffData();
        tradeTariffData = await this.cacheManager.get(message.session_id);

        if (this.context.current_process == 'identify_document') {

            //first time user is requesting licences
            if (!tradeTariffData) {
                this.log.info("First time");
                let licencesFound: boolean = false;
                try {
                    tradeTariffData = await this.getTradeTariffData(this.context.hscode, this.context.country_origin, true);
                    licencesFound = tradeTariffData.measure.length > 0 ? true : false;
                } catch (err) {
                    licencesFound = false;
                }
                if (!licencesFound) {
                    this.context.current_process = '#';
                    const messageToWatson = 'Not found';
                    const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(message.session_id, messageToWatson);
                    payload.context = message.context;
                    payload.context.skills['main skill'].user_defined = this.context;

                    this.log.debug(payload.context.skills['main skill'].user_defined)

                    await this.watsonConfigService.getAssistant().message(payload);
                    const watsonData = await this.watsonConfigService.getAssistant().message(payload);
                    return watsonData.result;
                }
                tradeTariffData.cacheData = {
                    userChosenLicence: [],
                    currentListIndex: 0
                }
                await this.cacheManager.set(message.session_id, tradeTariffData, { ttl: 300 });

                for (let index = 0; index < tradeTariffData.measure.length; index++) {
                    response.output.generic.splice(index + 1, 0, {
                        response_type: 'text',
                        text: `<span class="cleo-pop">${tradeTariffData.measure[index].description}</span>`,
                    });
                }

                doNotEditText = true;
            } else {
                tradeTariffData.cacheData.userChosenLicence.push(message.message);
                tradeTariffData.cacheData.currentListIndex++;

                this.log.info(tradeTariffData.cacheData);

                if (tradeTariffData.cacheData.currentListIndex >= tradeTariffData.measure.length) {
                    this.context.current_process = CURRENT_PROCESS.USER_SELECTED_DOCUMENTS;
                    const messageToWatson = 're';
                    const payload: AssistantV2.MessageParams = await this.watsonConfigService.createPayload(message.session_id, messageToWatson);
                    payload.context = message.context;
                    payload.context.skills['main skill'].user_defined = this.context;

                    const watsonData = await this.watsonConfigService.getAssistant().message(payload);
                    response = watsonData.result;

                    let userSelectedDoc: string[] = [];
                    this.log.info("Finished do something");
                    finishedFindingLicence = true;

                    for (let index = 0; index < tradeTariffData.cacheData.userChosenLicence.length; index++) {
                        let measure = tradeTariffData.measure[index];
                        for (let docIndex = 0; docIndex < measure.doc.length; docIndex++) {
                            if (tradeTariffData.cacheData.userChosenLicence[index] == measure.doc[docIndex].id) {
                                response.output.generic.push({
                                    response_type: 'text',
                                    text: `<span class="cleo-pop">${tradeTariffData.measure[index].doc[docIndex].requirement}</span>`
                                });
                            }
                        }
                    }

                    response.output.generic.push({
                        response_type: 'text',
                        text: 'Please take the time to read and let me know when you want to continue.',
                    });

                    return response;
                }
            }

            await this.replaceWithCustom(response, tradeTariffData, tradeTariffData.cacheData.currentListIndex, doNotEditText);
        }


        return response;
    }

    private async replaceWithCustom(response: AssistantV2.MessageResponse,
        tradeTariffData: TradeTariffData,
        index: number, doNotEditText: boolean): Promise<AssistantV2.MessageResponse> {

        this.log.info(JSON.stringify(response));
        response.output.generic.forEach((response: WatsonOptions) => {
            if (response.response_type === 'option') {
                response.options = [];
                let doc = this.compareDoc(tradeTariffData.measure[index].doc);
                tradeTariffData.measure[index].doc.forEach(measure => {
                    console.log(measure.action);
                    if (measure.action != 'Import/export not allowed after control' && measure.action != 'The entry into free circulation is not allowed') {
                        response.options.push({
                            label: doc
                                ? `${measure.code}: ${measure.requirement}`
                                : measure.action,
                            value: {
                                input: {
                                    text: measure.id
                                    // text: `<span class="cleo-pop">${measure.id}</span>`
                                }
                            }
                        })
                    }
                })
            } else if (
                response.response_type == 'text'
                &&
                this.compareDoc(tradeTariffData.measure[index].doc)
                &&
                !doNotEditText
            ) {
                response.text = `In order to allow the following "${tradeTariffData.measure[index].doc[0].action}", please select the most appropriate document from the list:`;
            }
        });

        this.log.info("Replace");

        return response;
    }

    //TODO Look into comparing the docs - if there's more than 3 docs then the others could be identical
    private compareDoc(doc): boolean {
        if (doc.length > 1) {
            if (doc[0].action == doc[1].action) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    /**
     * 
     * @param commodityCode 
     * @param country 
     * @param isImport 
     * 
     * Gets the trade Tariff data
     */
    private async getTradeTariffData(commodityCode, country, isImport): Promise<TradeTariffData> {
        let response: { data: any, included: [] };
        let tradeTariffData: TradeTariffData = new TradeTariffData();
        tradeTariffData.measure = [];
        let countryId: string;

        try {
            response = await this.httpService.get(`https://www.trade-tariff.service.gov.uk/api/v2/commodities/${commodityCode}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `bearer ${process.env.BEARER_TOKEN}`,
                    'Accept-Language': 'en',
                },
            }).toPromise().then(res => res.data).catch(err => { throw err });
        } catch (error) {
            this.log.error(`Failed to fetch data from Trade Tariff ${error}`)
            throw error;
        }

        this.log.debug('Received the trade tariff data');

        let allMeasureIds: { id: string, type: string }[] = response.data.relationships.import_measures.data;

        //Create a hashmap so its easier/faster/cleaner to look up data without having to constantly loop through the Trade Tariff data
        let tradeTariffMap = new Map();
        //Loop through the tradetariff data and only store the data needed for further processing
        for (let index = 0; index < response.included.length; index++) {
            const data: any = response.included[index];
            switch (data.type) {
                case 'measure_type':
                    tradeTariffMap.set(data['id'], data);
                    break;
                case 'measure':
                    if (data['relationships']['measure_conditions']['data'].length > 0) {
                        tradeTariffMap.set(data['id'], data);
                    }
                    break;
                case 'measure_condition':
                    tradeTariffMap.set(data['id'], data);
                    break;
                case 'geographical_area':
                    if (data.attributes.description.toLowerCase() == country.toLowerCase() || data.attributes.id.toLowerCase() == country.toLowerCase()) {
                        countryId = data.attributes.id;
                    }
                    const areaId = data.attributes.id;
                    const convertAreaIdToNumber = Number(areaId);
                    if (!isNaN(convertAreaIdToNumber)) {
                        tradeTariffMap.set(data['id'], data);
                    }
                    break;
                default:
                    null;
            }
        }

        for (let index = 0; index < response.data['relationships']['import_measures']['data'].length; index++) {
            const measureId = response.data['relationships']['import_measures']['data'][index]['id'];
            const measure: Measure = tradeTariffMap.get(measureId);

            if (measure != undefined) {
                let isCountryExcluded: boolean = false;
                //Do not get excluded countries
                measure.relationships.excluded_countries.data.forEach((countryIds) => {
                    if (countryIds.id == countryId) {
                        isCountryExcluded = true;
                    }
                });

                if (!isCountryExcluded) {
                    const measureType = tradeTariffMap.get(measure.relationships.measure_type.data.id);
                    let doc: TradeTariffDoc[] = [];

                    if (measureType.attributes.measure_type_series_id == 'B') {
                        for (let measureConditions = 0; measureConditions < measure.relationships.measure_conditions.data.length; measureConditions++) {
                            const measureCondtion = tradeTariffMap.get(measure.relationships.measure_conditions.data[measureConditions].id);
                            doc.push({
                                id: measureCondtion.id,
                                code: measureCondtion.attributes.document_code,
                                requirement: measureCondtion.attributes.requirement,
                                condition_code: measureCondtion.attributes.condition_code,
                                condition: measureCondtion.attributes.condition,
                                action: measureCondtion.attributes.action,
                            });
                        }

                        tradeTariffData.measure.push({
                            id: measureType.id,
                            description: measureType.attributes.description,
                            national: measureType.attributes.national,
                            measure_type_series_id: measureType.attributes.measure_type_series_id,
                            geographical_area: measure.relationships.geographical_area,
                            doc: doc
                        });
                    }

                }

            }
        }

        //Sometimes there will be 2 of the same measure types. This happens when a country has specific documents from other countries. 
        //If it does then remove the measure type for All countries and only keep the one for the specified country
        //https://www.trade-tariff.service.gov.uk/commodities/0208901000 The commodity shows this
        let replaceMeasure = [];
        for (let index = 0; index < tradeTariffData.measure.length; index++) {
            let currentMeasure = tradeTariffData.measure[index];

            const convertAreaIdToNumber = Number(currentMeasure.geographical_area.data.id);
            if (isNaN(convertAreaIdToNumber) && currentMeasure.geographical_area.data.id != countryId) {
                delete tradeTariffData.measure[index];
            }
        }

        for (let index = 0; index < tradeTariffData.measure.length; index++) {
            if (tradeTariffData.measure[index] != null) {
                replaceMeasure.push(tradeTariffData.measure[index]);
            }
        }

        tradeTariffData.measure = replaceMeasure;

        this.log.debug('Sorted the trade tariff data');
        this.log.debug(JSON.stringify(tradeTariffData));

        return tradeTariffData;
    }
}
