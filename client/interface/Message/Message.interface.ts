
export interface Options {
    label: string,
    value: {
        input: {
            text: string,
            options?: {
                id: string;
                interactionId: string;
            },
        }
    }
}

export interface ChosenCharacteristics {
    interactionId: string,
    values: {
        first: string;
        second: string;
    }
}

export interface Message {
    text?: string,
    options?: Options[],
    type: string,
    userType: string,
}