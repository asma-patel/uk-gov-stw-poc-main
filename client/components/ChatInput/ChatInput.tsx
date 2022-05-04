import { ChevronRightIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../Chatbox';

const ChatInput = () => {
    const chat = useContext(ChatContext);

    const inputRef = useRef<any>(null);

    const [message, setMessage] = useState('');

    useEffect(() => {
        inputRef.current.value = '';
    }, []);

    return (
        <div className="w-full h-input relative flex bg-black">
            <div className="m-4 bg-white w-full rounded-lg">
                <div className="p-1.5">
                    <form onSubmit={e => {
                        e.preventDefault();
                        chat.userSendMessage(message);
                        inputRef.current.value = '';
                    }}
                    >
                        <input
                            type='text'
                            className='p-2 m-auto overflow-x-hidden overflow-y-auto border-opacity-0 w-9/12'
                            placeholder='Type a message...'
                            name='chat'
                            id='name'
                            ref={inputRef}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                        >
                        </input>
                        <button className="p-2 w-3/12 bg-blueSecondary rounded text-white" onClick={(e) => {
                            e.preventDefault();
                            chat.userSendMessage(message);
                            inputRef.current.value = '';
                        }}>
                            <div className="flex flex-row justify-center">
                                <span>SEND</span>
                                <ChevronRightIcon className="h-6 w-6" />
                            </div>
                        </button>
                    </form>
                </div>

                {/* <div className="p-2 max-h-full overflow-x-hidden overflow-y-auto">
                    please type
                </div> */}
            </div>
        </div>
    );
};

export default ChatInput;
