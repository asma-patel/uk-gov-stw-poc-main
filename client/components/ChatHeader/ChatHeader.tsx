import Icon from "../Icon/Icon";
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid'
import GDPR from "../GDPR/GDPR";
import { createContext, useState } from "react";

export const ChatHeaderContext = createContext({
    isOpen: false,
    openModal: () => {},
    closeModal: () => {}
});

const ChatHeader = () => {
    const [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true)
    }
    return (
        <ChatHeaderContext.Provider value={{isOpen, openModal, closeModal}}>
            <GDPR />
            <div className="h-16 w-full bg-black" style={{ color: 'white' }}>
                <div className="h-full w-full flex">
                    <div className="flex-auto p-1.5">
                        <div className="flex flex-row">
                            <ChevronDownIcon className="text-white h-6 w-6" />
                            <p>Hide</p>
                            <button onClick={() => {openModal()}} >GDPR</button>
                        </div>
                    </div>
                    <div className="flex-auto justify-center flex p-3 font-bold text-2xl">
                        <p>CLEO</p>
                    </div>
                    <div className="flex-auto flex flex-row justify-end p-1.5">
                        <p>Close</p>
                        <XIcon className="text-white h-6 w-6" />
                    </div>
                </div>
                <div className="flex justify-center z-10 relative">
                    <div className="bg-BluePrimary w-11/12 h-3.5"></div>
                </div>
            </div>
        </ChatHeaderContext.Provider>
    );
};

export default ChatHeader;
