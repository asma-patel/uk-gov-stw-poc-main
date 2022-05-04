import { ApiProperty } from "@nestjs/swagger"

//For classify-continue, the data that needs to be passed.
export interface ThreeCECharacteristics {
    interactionid: string;
    state: string;
    txid: string;
    values: [{
        ///First is the chosen attrs id
        first: string;
        //second is the chosen attrs name
        second: string
    }]
}

export class ChosenCharacteristics {
    @ApiProperty()
    interactionId: string;

    @ApiProperty()
    values: {
        first: string;
        second: string;
    }
}

export interface WatsonOptions {
    response_type: string;
    text?: string;
    title?: string;
    options?: {
        label: string;
        value: {
            input: {
                text?: string;
                options?: {
                    id: string;
                    interactionId: string;
                },
            }
        }
    }[]

}