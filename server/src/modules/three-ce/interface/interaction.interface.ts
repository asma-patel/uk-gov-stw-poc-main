import { AttributesDto } from "./attributes.interface";

export interface Interactions {
    id: string;
    name: string;
    label: string;
    category: string;
    type: string;
    heading: string;
    attrs: AttributesDto[];
    headings: string;
    inputType: string;
    selectedString: string;
    selectedDefinition: string;
    ruleMismatch: boolean;
    isAnsweredWithRule: boolean;
    hasOther: boolean;
    language: string;
    semanticAmbiguity: boolean;
    unselectedString: string;
}