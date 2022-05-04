import { useEffect, useReducer, useState, createContext, useContext } from 'react';
import ChatContainer from './ChatContainer/ChatContainer';
import ChatHeader from './ChatHeader/ChatHeader';
import ChatInput from './ChatInput/ChatInput';

import * as API from '../api/conversation';
import { BOT_STATE, RESPONSE_TYPE, } from './BotStates';
import { ChosenCharacteristics, Message, Options, Watson } from '../interface';

const messages: Message[] = [{
    text: '',
    type: 'text',
    userType: 'cleo'
}];

const reducer = (state: any, action: Message) => {
    return [...state, action];
}

export const ChatContext = createContext({
    state: messages,
    botMessageStatus: BOT_STATE.IDLE,
    getFinalAPC: '',
    userSendMessage: (text: string, threeCEOption?: ChosenCharacteristics, options?: { optionLabel: string, optionText: string }) => { },
    foundAPCRestartCleo: (apc: string) => {}
});

const ChatBox = () => {
    const [sessionId, setSessionId] = useState('');
    const [botMessageStatus, setBotMessageStatus] = useState(BOT_STATE.IDLE);
    const [context, setContext] = useState({});
    const [state, dispatch] = useReducer(reducer, messages);

    //FInal APC code
    const [getFinalAPC, setGetFinalAPC] = useState('');
    
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (sessionId.length > 0) {
            sendMessageToSend('', true);
        }
    }, [sessionId]);

    const fetchData = async () => {
        setBotMessageStatus(BOT_STATE.IN_PROGRESS);
        const sessionId = await API.getSessionId();
        setSessionId(sessionId);
    }

    const updateMessageList = async (userType: string, messageType: string, text?: string, option?: Options[]) => {
        const chatList = document.getElementById('chat-container');

        if (chatList != null) {
            setTimeout(() => {
                chatList.scroll({ top: chatList.scrollHeight, behavior: 'smooth' });
                chatList.scrollTop = chatList.scrollHeight - chatList.clientHeight;
            }, 100);
        }

        switch(messageType) {
            case RESPONSE_TYPE.TEXT:
                dispatch({ type: RESPONSE_TYPE.TEXT, userType: userType, text: text });
                break;
            case RESPONSE_TYPE.OPTION:
                dispatch({ type: RESPONSE_TYPE.OPTION, userType: userType, options: option });
                break;
            default:
                dispatch({ type: RESPONSE_TYPE.TEXT, userType: userType, text: 'CLEO currently does not support that type' });
                break;
        }

        if (userType == 'cleo') {
            setBotMessageStatus(BOT_STATE.COMPLETED);
        } else {
            setBotMessageStatus(BOT_STATE.IDLE);
        }
    }

    ///Sending message to API/Watson
    const sendMessageToSend = async (text: string, isFirstMessage: boolean, threeCEOption?: ChosenCharacteristics) => {
        setBotMessageStatus(BOT_STATE.IN_PROGRESS);

        try {
            let message: Watson = await API.getMessage(sessionId, text, isFirstMessage, context, threeCEOption);

            if(message.context == null) {
                throw new Error(message.message);
            }

            if (message.context.skills['main skill'].user_defined.current_process == 'final_hscode_digit') {
                message.context.skills['main skill'].user_defined.current_process = 'start_final_hscode_digit';
                message = await API.getMessage(sessionId, 're', isFirstMessage, message.context, undefined);
                console.log("Finished")
            }
            isAPCFinalStep(message.context.skills['main skill'].user_defined);
            message.output.generic.map(async (data, index) => {
                await updateMessageList('cleo', data.response_type, data.text || undefined, data.options || undefined);
            });

            setContext(message.context);
        } catch (err: any) {
            console.log(`Failed to get data ${err}`);
            if (err.message == 'Invalid Session') {
                setBotMessageStatus(BOT_STATE.FAILED);
                await updateMessageList('cleo', RESPONSE_TYPE.TEXT, "CLEO Session has expired.", undefined);
                await updateMessageList('cleo', RESPONSE_TYPE.TEXT, "Starting a new session...", undefined);
                setTimeout(() => {
                    fetchData();
                }, 3000);
            } else {
                await updateMessageList('cleo', RESPONSE_TYPE.TEXT, err.message, undefined);
                await updateMessageList('cleo', RESPONSE_TYPE.TEXT, "Restarting CLEO...", undefined);
                setBotMessageStatus(BOT_STATE.IN_PROGRESS);
                setTimeout(() => {
                    fetchData();
                }, 3000);
            }

        }
    }

    const userSendMessage = async (text: string, threeCEOption?: ChosenCharacteristics, options?: { optionLabel: string, optionText: string }) => {
        let messageToSendToWatson = options ? options.optionText : text;
        let textToUpdate = options ? options.optionLabel : text;

        console.log(messageToSendToWatson);
        console.log(textToUpdate);

        await updateMessageList('user', RESPONSE_TYPE.TEXT, textToUpdate, undefined);
        await sendMessageToSend(messageToSendToWatson, false, threeCEOption);
    }

    //Final APC Code - All method goes here to keep the code base clean
    //TODO think about moving to a different Component
    function isAPCFinalStep(user_defined: any) {
        if(user_defined.current_process == "final_procedure_code" && user_defined.global_process == "procedure-combination") {
            setGetFinalAPC(user_defined.other.substring(0,2) + user_defined.other.substring(3,5));
        } else {
            setGetFinalAPC('');
        }
    }

    async function  foundAPCRestartCleo(apc: string) {
        await updateMessageList('cleo', RESPONSE_TYPE.TEXT, 
        `<span class="cleo-pop">Here is your CPC code ${getFinalAPC}${apc} </span>`, 
        undefined);

        await sendMessageToSend('restart', false, undefined);
    }


    return (
        <ChatContext.Provider value={{ state, botMessageStatus, userSendMessage, getFinalAPC, foundAPCRestartCleo }} >
            <div className="flex justify-center p-4">
                <div className="c-box">
                    <ChatHeader />
                    <div className="p-5 overflow-y-auto overflow-x-hidden h-chat" id='chat-container'>
                        <ChatContainer />
                    </div>
                    <ChatInput />
                </div>
            </div>
        </ChatContext.Provider>
    );
};

export default ChatBox
