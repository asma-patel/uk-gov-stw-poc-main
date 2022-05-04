export class Procedure {
    procedure: string;
    shortDescription: string;
    longDescription: string;
    codes: ProcedureCodes[];
}


export class ProcedureCodes { 
    prevProcedure: string;
    shortDescription: string;
    longDescription: string;
    restrictionsOnUsage: string;
    correlationMatrix: CorrelationMatrix[]
}


export class CorrelationMatrix {
    index: number;
    code: string;
    shortDescription: string;
}