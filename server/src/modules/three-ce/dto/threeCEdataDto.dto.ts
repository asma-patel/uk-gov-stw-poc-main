import { Interactions } from "../interface/interaction.interface";

export class ThreeCEDataDto {
    prouctName: string;
    txId: string;
    name: string;
    characteristics: Interactions;
    currentInteractionQuestion: Interactions;
    currentItemInteractions: Interactions;
    hsCode: string;
}