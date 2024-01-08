import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface EmpCardProps{
    context: WebPartContext;
    userInfo: any;
    crcYr: number;
    allocation: any;
    selectChoicesYears: any;
    formType: string;
    clearPpl?: any;
}