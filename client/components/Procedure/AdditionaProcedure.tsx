import React, { ReactElement, useEffect } from 'react'
import AdditionalProcedureAPC from './AdditionalProcedureAPC'


function AdditionaProcedure(): ReactElement {
    
    useEffect(() => {
        console.log("Startup")
    }, []);

    
    return (
        <AdditionalProcedureAPC />
    )
}

export default AdditionaProcedure
