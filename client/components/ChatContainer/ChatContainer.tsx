import { ReactNode, useContext } from 'react';
import { Message } from '../../interface';
import { BOT_STATE } from '../BotStates';
import { ChatContext } from '../Chatbox';
import ChatBubble from '../ChatBubble/ChatBubble';
import ChatOption from '../ChatOptions/ChatOptions';

const ChatContainer = () => {
    const chat = useContext(ChatContext);
    const chatListClasses = chat.botMessageStatus == BOT_STATE.IN_PROGRESS ? 'ibm-lg-col-4 ibm-padding chat-list chat-list--loading j-column' : 'ibm-lg-col-4 ibm-padding chat-list j-column';

    const displayText = (currentMessage: Message, index: number) => {
        if (chat.state[index + 1] != undefined) {
            if (chat.state[index + 1].type == currentMessage.userType) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    return (
        <div className={chatListClasses}>
            {chat.state.map((message, index) => {

                switch (message.type) {
                    case 'option':
                        if (chat.state[index + 1] != undefined) {
                            return (
                                <ChatOption clickable={false} options={message.options}/>
                            )
                        } else {
                            return (
                                <ChatOption clickable={true} options={message.options}/>
                            )
                        }
                    default:
                        return (
                            <ChatBubble type={message.userType || 'cleo'} text={message.text || ''} displayText={displayText(message, index)} key={index} />
                        )
                }
            })}

            <div className='chat-list__loader'>
                <p className='ibm-type-c'>
                    &nbsp;
                    <span />
                </p>
            </div>
            <div id='chat-list-bottom'>&nbsp;</div>
        </div>
    );
};

export default ChatContainer;
