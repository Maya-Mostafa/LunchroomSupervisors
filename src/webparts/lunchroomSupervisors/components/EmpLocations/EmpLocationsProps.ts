import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface EmpLocationsProps{
    context: WebPartContext;
    myLocations: any;
    getSelectedLoc: any;
}