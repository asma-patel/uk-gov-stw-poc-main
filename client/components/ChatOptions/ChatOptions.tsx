import DOMPurify from 'isomorphic-dompurify';
import { createContext, useContext, useState } from 'react';
import { ChosenCharacteristics, Options } from '../../interface';
import { ChatContext } from '../Chatbox';
import AdditionalProcedureAPC from '../Procedure/AdditionalProcedureAPC';
interface OptionProp {
    clickable: boolean,
    options: Options[] | undefined
}

export const ChatOptionContext = createContext({
    isAPCModalOpen: false,
    openAPC: () => { },
    closeAPC: () => { }
});

const ChatOption = (props: OptionProp) => {
    const chat = useContext(ChatContext);

    //FInal APC code
    const [isAPCModalOpen, setIsAPCModalOpen] = useState(false);

    //Final APC Code - All method goes here to keep the code base clean
    //TODO think about moving to a different Component
    function openAPC() {
        setIsAPCModalOpen(true);
    }

    function closeAPC() {
        setIsAPCModalOpen(false);
    }

    return (
        <ChatOptionContext.Provider value={{ isAPCModalOpen, openAPC, closeAPC }} >
            <AdditionalProcedureAPC />
            <div className="flex flex-col">
                {props.options?.map((option, index) => {
                    if (option.label != null && option.label.length > 0) {
                        return (
                            <div key={index}>
                                <button
                                    className="chat-option"
                                    onClick={() => {
                                        if (props.clickable) {
                                            if (chat.getFinalAPC) {
                                                openAPC();
                                            } else if (option.value.input.options) {
                                                const threeChosenOption: ChosenCharacteristics = {
                                                    interactionId: option.value.input.options.interactionId,
                                                    values: {
                                                        first: option.value.input.options.id,
                                                        second: option.label
                                                    }
                                                }
                                                chat.userSendMessage(option.label, threeChosenOption, { optionLabel: option.label, optionText: option.value.input.text });
                                            } else {
                                                chat.userSendMessage(option.label, undefined, { optionLabel: option.label, optionText: option.value.input.text });
                                            }
                                        }
                                    }}

                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option.label).replace(/href/g, "target='_blank' href") }}
                                ></button>
                            </div>
                        )
                    }

                })}
                <div className='cleo-text'>CLEO</div>
            </div>
        </ChatOptionContext.Provider>
    )
}

export default ChatOption;