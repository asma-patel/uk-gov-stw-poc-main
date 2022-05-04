
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, ReactElement, useContext, useEffect, useState } from 'react'
import * as API from '../../api/conversation';
import { ChatContext } from '../Chatbox';
import { ChatOptionContext } from '../ChatOptions/ChatOptions'

const AdditionalProcedureAPC = () => {
    const chatOption = useContext(ChatOptionContext);
    
    return (
        <Transition appear show={chatOption.isAPCModalOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={chatOption.closeAPC}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-default bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="text-xl leading-6 text-black text-center flex flex-col"
                            >
                                <span className="font-bold p-4">Additional Procedures</span>
                                <span className="p-2 text-left">Please choose the additional procedure code with the description that best suits how you wish your goods item to be handled. If you would like to find out more about each code, please click More Info next to the Description</span>
                            </Dialog.Title>
                            <div className="mt-2">
                                <Table />
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

const Table = () => {
    const chat = useContext(ChatContext);
    const chatOption = useContext(ChatOptionContext)
    const [correlationMatrixes, setCorrelationMatrixes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const ids = await API.getCorrelationMatrix(chat.getFinalAPC);
            setCorrelationMatrixes(ids);
        }
        fetchData();
        
    }, []);


    function chosenAPC(apc: string) {
        chat.foundAPCRestartCleo(apc);
        chatOption.closeAPC();
    }



    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-hidden sm:-mx-6 lg:-mx-8">
                <div className="py-2 inline-block max-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b sm:rounded-lg">
                        <table className="max-w-full divide-y divide-gray-light">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-base font-bold uppercase tracking-wider">
                                        Additional Procedure Code​
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-base font-bold uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-base font-bold uppercase tracking-wider">
                                        Select code relevant to your goods item​
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-light">
                            {correlationMatrixes.map((matrix, index) => {
                                return (
                                    <tr key={index}>
                                    <td className="px-6 py-4 whitespace-normal">
                                        <span className="text-base">{matrix['code']}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal">
                                        <span className="text-base">{matrix['shortDescription']}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal">
                                        <button
                                            className="border-none p-4 bg-gray-default text-white text-base font-semibold rounded-md"
                                            onClick={() => 
                                                chosenAPC(matrix['code'])
                                            }
                                        >
                                            This one
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdditionalProcedureAPC


// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment, useContext, useEffect, useState } from 'react';
// import { getAPC, getProcedures } from '../../api/conversation';
// import { ChatContext } from '../Chatbox';

// import { ModalContext } from '../Modal/modalContext';

// const AdditionalProcedureAPC = ({ data, updateMessage, sendMessage }) => {
//     const chat = useContext(ChatContext);

//     const [correlationMatrix, setCorrelationMatrix] = useState([]);
//     const [requestedProcedures, setRequestedProcedures] = useState([]);

//     let [isOpen, setIsOpen] = useState(true)

//     function closeModal() {
//         setIsOpen(false)
//     }

//     function openModal() {
//         setIsOpen(true)
//     }

//     useEffect(() => {
//         const fetchData = async () => {
//             setRequestedProcedures(await getProcedures());
//         }
//         fetchData();
//         ;
//     }, []);

//     useEffect(() => {
//         let matrixes = [];
//         let text = removeSpaces(data);

//         console.log(requestedProcedures);

//         if(requestedProcedures.length > 0) {
//             for (let index = 0; index < requestedProcedures.length; index++) {
//                 let procedure = requestedProcedures[index];
//                 console.log(procedure);
//                 if (procedure['procedure'] == text.slice(0, 2)) {
//                     if (procedure['codes'] != null && procedure['codes'] != undefined) {
//                         for (let j = 0; j < procedure['codes'].length; j++) {
//                             if (procedure['codes'][j]['prevProcedure'] == text.slice(2, 4)) {
//                                 matrixes = procedure['codes'][j]['correlationMatrix'];
//                             }
//                         }
//                     }
//                 }
//             }

//             console.log(matrixes);
    
//             const fetchData = async () => {
//                 setCorrelationMatrix(await getAPC(matrixes))
//             }
//             fetchData();
//         }

//     }, [requestedProcedures]);

//     const removeSpaces = text => {
//         return text.replace(/\s/g, '');
//     };

//     return (
//         <>
//             <div className="fixed inset-0 flex items-center justify-center">
//                 <button
//                     type="button"
//                     onClick={openModal}
//                     className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
//                 >
//                     Open dialog
//                 </button>
//             </div>

//             <Transition appear show={isOpen} as={Fragment}>
//                 <Dialog
//                     as="div"
//                     className="fixed inset-0 z-10 overflow-y-auto"
//                     onClose={closeModal}
//                 >
//                     <div className="min-h-screen px-4 text-center">
//                         <Transition.Child
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0"
//                             enterTo="opacity-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100"
//                             leaveTo="opacity-0"
//                         >
//                             <Dialog.Overlay className="fixed inset-0" />
//                         </Transition.Child>

//                         {/* This element is to trick the browser into centering the modal contents. */}
//                         <span
//                             className="inline-block h-screen align-middle"
//                             aria-hidden="true"
//                         >
//                             &#8203;
//                         </span>
//                         <Transition.Child
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0 scale-95"
//                             enterTo="opacity-100 scale-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100 scale-100"
//                             leaveTo="opacity-0 scale-95"
//                         >
//                             <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
//                                 <Dialog.Title
//                                     as="h3"
//                                     className="text-lg font-medium leading-6 text-gray-900"
//                                 >
//                                     Please choose the additional procedure code with the description that best suits
//                                     how you wish your goods item to be handled. If you would like to find out more
//                                     about each code, please click "More Info" next to the Description
//                                 </Dialog.Title>
//                                 <div className="mt-2">
//                                     <Table data={correlationMatrix} updateMessage={''} sendMessage={''} prevCode={removeSpaces(data)}/>
//                                 </div>

//                                 <div className="mt-4">
//                                     <button
//                                         type="button"
//                                         className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
//                                         onClick={closeModal}
//                                     >
//                                         Got it, thanks!
//                                     </button>
//                                 </div>
//                             </div>
//                         </Transition.Child>
//                     </div>
//                 </Dialog>
//             </Transition>
//         </>
//         // <div className='modal-size'>
//         //     <div className='flex-center c-column'>
//         //         <p className='p-0 title'>Additional Procedures</p>
//         //         <p>
//         //             Please choose the additional procedure code with the description that best suits
//         //             how you wish your goods item to be handled. If you would like to find out more
//         //             about each code, please click "More Info" next to the Description
//         //         </p>
//         //     </div>
//         //     {/* <div>
//         //         <Table
//         //             updateMessage={updateMessage}
//         //             sendMessage={sendMessage}
//         //             data={correlationMatrix}
//         //             prevCode={removeSpaces(data)}
//         //         />
//         //     </div> */}
//         //     <div></div>
//         // </div>
//     );
// }

// function setUserSelected(procedure, prevCode) {
//     return prevCode + procedure.additionalCode;
// }

// function Table({ data, updateMessage, prevCode, sendMessage }) {

//     const close = (procedure, prevCode) => {
//         console.log("Dilan", procedure);
//         updateMessage('cleo', 'text', `<span class="cleo-pop">Here is your CPC code ${setUserSelected(procedure, prevCode)}</span>`);
//         sendMessage("restart");
//     };

//     return (
//         <div>
//             <table>
//                 <tr>
//                     <th>Additional Procedure Code​</th>
//                     <th>Description</th>
//                     <th>Select code relevant to your goods item​</th>
//                 </tr>
//                 {data.map((procedure, index) => {
//                     return (
//                         <tr key={index}>
//                             <td>{procedure.additionalCode}</td>
//                             <td>{procedure.descriptionShort}</td>
//                             <td>
//                                 <button
//                                     className='info-button'
//                                     onClick={() => close(procedure, prevCode)}
//                                 >
//                                     This one
//                                 </button>
//                             </td>
//                         </tr>
//                     );
//                 })}
//             </table>
//         </div>
//     );
// }

// export default AdditionalProcedureAPC;
