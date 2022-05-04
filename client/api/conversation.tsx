import { ChosenCharacteristics, Watson } from "../interface";

const defaultURL = 'http://localhost:4000/api/'

export async function getSessionId(): Promise<string> {
    const data = await fetch(defaultURL + 'session', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    });

    const session_id = await data.text();
    return session_id;
}

export async function getMessage(sessionId: string, message: string, isFirstCall: boolean, context: any, threeCEOption?: ChosenCharacteristics): Promise<Watson> {
    const payload =
    {
        message: message,
        threeCEOption: {},
        session_id: sessionId,
        isFirstCall: isFirstCall,
        context: context
    }

    if (threeCEOption) {
        payload.threeCEOption = threeCEOption;
    }

    const data = await fetch(defaultURL + 'message', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const dataReceived = await data.json();
    console.log(dataReceived)

    return dataReceived;
}

export async function getCorrelationMatrix(apc: string) {
    const data = await fetch(defaultURL + 'correlationMatrix/' + apc, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });

    return data.json();
}