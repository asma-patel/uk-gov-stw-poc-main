import DOMPurify from 'isomorphic-dompurify';
import React, { useEffect } from 'react';
import { ReactElement } from 'react';

interface IconProp {
    type: string,
    text: string,
    displayText: boolean;
}



const ChatBubble = (props: IconProp) => {
    useEffect(() => {
        let x: any = document.getElementsByClassName("cleo-pop");
        if(x.length > 0) {
            for(let index = 0; index < x.length; index++) {
                x[index].parentNode.style.backgroundColor = "#2070bb";
            }
        }
        // let x = document.getElementByClassName("cleo-pop").parentElement;
        // x.style.backgroundColor = "red";

    }, []);

    function userChat(): ReactElement {
        return (
            <>
                <div className="user-bubble" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.text)}}>
                </div>
                <div className="user-text">ME</div>
            </>
        )
    }
    function cleoChat(): ReactElement {
        return (
            <>
                <div className="cleo-chat" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.text) }}>
                </div>
                {props.displayText == true ?
                    <div className="cleo-text">CLEO</div>
                    :
                    <React.Fragment />
                }
            </>
        )
    }
    function returnChat(): ReactElement {
        if (props.text.length > 0) {
            if (props.type == 'cleo') {
                return cleoChat();
            } else {
                return userChat();
            }
        } else {
            return <></>;
        }

    }

    return (
        <div className="flex flex-col pt-3">
            {returnChat()}
        </div>
    )
}


export default ChatBubble;
