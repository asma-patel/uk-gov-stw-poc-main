import AssistantV2 from "ibm-watson/assistant/v2";
import { NewMessageDto } from "modules/watson/dto/newMessage.dto";

export interface IWatsonProcess { 

    /**
     * Processes the reponses for the watson message
     */
    processResponse(response: AssistantV2.MessageResponse, message: NewMessageDto):  Promise<AssistantV2.MessageResponse>;
}