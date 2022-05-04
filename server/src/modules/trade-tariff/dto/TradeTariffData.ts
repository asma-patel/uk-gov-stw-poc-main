
export interface TradeTariffDoc {
    id: string;
    code: string;
    requirement: string;
    condition_code: string;
    condition: string;
    action: string;
}


export class TradeTariffData {
    measure: {
        id: string;
        description: string;
        national: string;
        measure_type_series_id: string;
        geographical_area: {
            data: {
                id: string,
                type: string
            }
        },
        doc: TradeTariffDoc[]
    }[];
    //Cahce Store data
    cacheData?: {
        userChosenLicence?: string[];
        currentListIndex: number;
    }
}

export interface Measure {
    id: string;
    type: string;
    attributes: {};
    relationships: {
        measure_type: {
            data: {
                id: string;
                type: string
            }
        }
        measure_conditions: {
            data: {
                id: string;
                type: string
            }[]
        },
        excluded_countries: {
            data: {
                id: string;
                type: string
            }[]
        },
        geographical_area: {
            data: {
                id: string,
                type: string
            }
        },
    }
}

export interface Measure_Type {
    id: string;
    type: string;
    attributes: {
        description: string;
        national: string;
        measure_type_series_id: string;
        id: string
    };
}