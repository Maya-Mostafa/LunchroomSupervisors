import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface EmpListProps{
    emps: any;
    context: WebPartContext;
    crcYr: number;
    allocations: any;
    // allocationsCount: any;
    selectChoicesYears: any;
    employeesType: string;
}