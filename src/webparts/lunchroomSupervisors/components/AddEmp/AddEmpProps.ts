import { WebPartContext } from "@microsoft/sp-webpart-base";

export default interface AddEmpProps{
    emps: any;
    context: WebPartContext;
    crcYr: number;
    selectChoicesYears: any;
}