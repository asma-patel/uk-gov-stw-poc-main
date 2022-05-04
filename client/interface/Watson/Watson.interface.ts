interface Entities {

}

interface Intents {
    intent: string;
    confidence: number;
}

interface Generic {
    response_type: string,
    title?: string,
    options?: {
        label: string,
        value: {
            input: {
                text: string
            }
        }
    }[],
    text?: string
}

export interface Watson {
    output: {
        intents: Intents[]
        entities: Entities[],
        generic: Generic[]
    },
    user_id: string,
    context: {
        global: {
            system: any,
            session_id: string
        },
        skills: {
            'main skill': {
                user_defined: any
            }
        }
    },
    message?: string
}
