import { Interface } from "readline";
import { Interactions } from "../interface/interaction.interface";

export class ThreeCEDto {
    id: string;
    txId: string;
    languageCode: string;
    productDescription: string;
    profileId: string;
    currentItemPaths: string[];
    currentItemNo: string;
    currentSIP: string
    currentItemDef: string;
    currentItemName: string;
    hsCode: string;
    assumedInteractions: Interactions[];
    knownInteractions: Interactions[];
    orderedInteractions: Interactions[];
    currentItemInteraction: Interactions;
    currentQuestionInteraction: Interactions;
    potentialHeadings: string[];
}